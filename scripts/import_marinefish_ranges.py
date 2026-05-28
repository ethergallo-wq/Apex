#!/usr/bin/env python3
import argparse
import gzip
import json
import math
import re
import sqlite3
import struct
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = Path("/Users/andreagalliazzo/Downloads/MARINEFISH")
DEFAULT_DB = ROOT / "data" / "species-ranges-master" / "marinefish.sqlite"
DEFAULT_DEPLOY_DIR = ROOT / "public" / "data" / "species-ranges"
ANIMALS_DATA = ROOT / "src" / "animals-data.js"
FISH_CLASSES = {"Actinopterygii", "Elasmobranchii", "Coelacanthi"}
KEEP_PROPS = [
    "sci_name",
    "id_no",
    "presence",
    "origin",
    "seasonal",
    "category",
    "order_",
    "family",
    "genus",
    "marine",
    "terrestria",
    "freshwater",
]


def slugify(value):
    clean = re.sub(r"[^a-z0-9]+", "-", (value or "").strip().lower())
    return clean.strip("-")


def norm_name(value):
    return re.sub(r"\s+", " ", (value or "").strip()).lower()


def parse_number(value):
    if value in (None, ""):
        return None
    try:
        n = float(value)
    except ValueError:
        return value
    if math.isfinite(n) and n.is_integer():
        return int(n)
    return n


def dbf_fields(dbf_path):
    with dbf_path.open("rb") as f:
        header = f.read(32)
        record_count = struct.unpack("<I", header[4:8])[0]
        header_len = struct.unpack("<H", header[8:10])[0]
        record_len = struct.unpack("<H", header[10:12])[0]
        fields = []
        pos = 32
        while pos < header_len - 1:
            raw = f.read(32)
            pos += 32
            if not raw or raw[0] == 0x0D:
                break
            name = raw[:11].split(b"\x00", 1)[0].decode("latin1").strip()
            fields.append((name, chr(raw[11]), raw[16], raw[17]))
    return record_count, header_len, record_len, fields


def iter_dbf_records(dbf_path):
    _, header_len, record_len, fields = dbf_fields(dbf_path)
    with dbf_path.open("rb") as f:
        f.seek(header_len)
        while True:
            record = f.read(record_len)
            if not record or len(record) < record_len:
                break
            if record[0:1] == b"*":
                continue
            pos = 1
            row = {}
            for name, field_type, length, _decimals in fields:
                raw = record[pos : pos + length]
                pos += length
                value = raw.decode("latin1", "replace").strip()
                if field_type in {"N", "F"}:
                    value = parse_number(value)
                row[name] = value
            yield row


def iter_shp_polygons(shp_path):
    with shp_path.open("rb") as f:
        f.seek(100)
        while True:
            record_header = f.read(8)
            if not record_header:
                break
            if len(record_header) < 8:
                raise ValueError(f"Truncated record header in {shp_path}")
            _record_no, content_words = struct.unpack(">2i", record_header)
            content = f.read(content_words * 2)
            if len(content) < content_words * 2:
                raise ValueError(f"Truncated record body in {shp_path}")
            shape_type = struct.unpack("<i", content[:4])[0]
            if shape_type == 0:
                yield None
                continue
            if shape_type != 5:
                raise ValueError(f"Unsupported shape type {shape_type} in {shp_path}")
            box = struct.unpack("<4d", content[4:36])
            part_count, point_count = struct.unpack("<2i", content[36:44])
            parts = list(struct.unpack(f"<{part_count}i", content[44 : 44 + 4 * part_count]))
            points_offset = 44 + 4 * part_count
            points = [
                struct.unpack("<2d", content[points_offset + i * 16 : points_offset + i * 16 + 16])
                for i in range(point_count)
            ]
            rings = []
            for idx, start in enumerate(parts):
                end = parts[idx + 1] if idx + 1 < len(parts) else point_count
                rings.append(points[start:end])
            yield box, rings


def ring_area(ring):
    if len(ring) < 4:
        return 0.0
    total = 0.0
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        total += x1 * y2 - x2 * y1
    return total / 2.0


def point_in_ring(point, ring):
    x, y = point
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if (yi > y) != (yj > y):
            x_cross = (xj - xi) * (y - yi) / ((yj - yi) or 1e-30) + xi
            if x < x_cross:
                inside = not inside
        j = i
    return inside


def perpendicular_distance(point, start, end):
    px, py = point
    sx, sy = start
    ex, ey = end
    dx = ex - sx
    dy = ey - sy
    if dx == 0 and dy == 0:
        return math.hypot(px - sx, py - sy)
    return abs(dy * px - dx * py + ex * sy - ey * sx) / math.hypot(dx, dy)


def rdp(points, tolerance):
    if len(points) <= 2:
        return points
    max_dist = -1.0
    index = 0
    start = points[0]
    end = points[-1]
    for i in range(1, len(points) - 1):
        dist = perpendicular_distance(points[i], start, end)
        if dist > max_dist:
            index = i
            max_dist = dist
    if max_dist > tolerance:
        left = rdp(points[: index + 1], tolerance)
        right = rdp(points[index:], tolerance)
        return left[:-1] + right
    return [start, end]


def radial_simplify(points, tolerance):
    if len(points) <= 2 or tolerance <= 0:
        return points
    sq_tol = tolerance * tolerance
    kept = [points[0]]
    last_x, last_y = points[0]
    for x, y in points[1:-1]:
        dx = x - last_x
        dy = y - last_y
        if dx * dx + dy * dy >= sq_tol:
            kept.append((x, y))
            last_x, last_y = x, y
    kept.append(points[-1])
    return kept


def simplify_ring(ring, tolerance, precision):
    if not ring:
        return []
    closed = ring[0] == ring[-1]
    work = ring[:-1] if closed else ring[:]
    if len(work) < 3:
        return []
    radial = radial_simplify(work + [work[0]], tolerance * 0.5)
    simplified = rdp(radial, tolerance)
    if simplified and simplified[0] == simplified[-1]:
        simplified = simplified[:-1]
    deduped = []
    last = None
    for x, y in simplified:
        point = (round(x, precision), round(y, precision))
        if point != last:
            deduped.append(point)
            last = point
    if len(deduped) < 3:
        return []
    if deduped[0] != deduped[-1]:
        deduped.append(deduped[0])
    return [[x, y] for x, y in deduped]


def polygon_to_multipolygon(rings, tolerance, precision, min_area):
    simplified = []
    for ring in rings:
        sr = simplify_ring(ring, tolerance, precision)
        if len(sr) < 4:
            continue
        area = ring_area(sr)
        if abs(area) < min_area:
            continue
        simplified.append((area, sr))

    outers = []
    holes = []
    for area, ring in simplified:
        # ESRI polygon outer rings are commonly clockwise (negative area).
        if area < 0:
            outers.append([ring])
        else:
            holes.append(ring)

    if not outers:
        outers = [[ring] for _area, ring in simplified]
        holes = []

    for hole in holes:
        test = hole[0]
        container = None
        container_area = None
        for poly in outers:
            outer = poly[0]
            if point_in_ring(test, outer):
                area = abs(ring_area(outer))
                if container is None or area < container_area:
                    container = poly
                    container_area = area
        if container is None:
            outers.append([hole])
        else:
            container.append(hole)
    return outers


def geometry_bounds(geometry):
    bounds = [math.inf, math.inf, -math.inf, -math.inf]
    for polygon in geometry.get("coordinates", []):
        for ring in polygon:
            for x, y in ring:
                bounds[0] = min(bounds[0], x)
                bounds[1] = min(bounds[1], y)
                bounds[2] = max(bounds[2], x)
                bounds[3] = max(bounds[3], y)
    if bounds[0] is math.inf:
        return None
    return bounds


def merge_bounds(items):
    bounds = [math.inf, math.inf, -math.inf, -math.inf]
    seen = False
    for item in items:
        if not item:
            continue
        seen = True
        bounds[0] = min(bounds[0], item[0])
        bounds[1] = min(bounds[1], item[1])
        bounds[2] = max(bounds[2], item[2])
        bounds[3] = max(bounds[3], item[3])
    return bounds if seen else [None, None, None, None]


def init_db(conn):
    conn.executescript(
        """
        PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS species (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sci_name TEXT NOT NULL UNIQUE,
          grp TEXT NOT NULL,
          id_no INTEGER,
          category TEXT,
          "order" TEXT,
          family TEXT,
          genus TEXT,
          marine INTEGER,
          terrestrial INTEGER,
          freshwater INTEGER,
          n_features INTEGER,
          bbox_minx REAL,
          bbox_miny REAL,
          bbox_maxx REAL,
          bbox_maxy REAL,
          geojson_gz BLOB NOT NULL,
          wanted_name TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_species_sci_name ON species(sci_name);
        """
    )


def feature_collection(name, features):
    return {"type": "FeatureCollection", "name": slugify(name).replace("-", "_"), "features": features}


def import_marinefish(args):
    input_dir = Path(args.input)
    db_path = Path(args.db)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if args.replace and db_path.exists():
        db_path.unlink()
    conn = sqlite3.connect(db_path)
    init_db(conn)

    species = {}
    processed = 0
    skipped_empty = 0
    parts = sorted(input_dir.glob("MARINEFISH_PART*.shp"))
    if not parts:
        raise SystemExit(f"No MARINEFISH_PART*.shp files found in {input_dir}")

    for shp_path in parts:
        dbf_path = shp_path.with_suffix(".dbf")
        print(f"Reading {shp_path.name}...", flush=True)
        part_processed = 0
        for props, shape in zip(iter_dbf_records(dbf_path), iter_shp_polygons(shp_path)):
            if args.limit and processed >= args.limit:
                break
            processed += 1
            part_processed += 1
            if not shape:
                skipped_empty += 1
                continue
            _box, rings = shape
            coordinates = polygon_to_multipolygon(rings, args.tolerance, args.precision, args.min_area)
            if not coordinates:
                skipped_empty += 1
                continue
            sci_name = props.get("sci_name")
            if not sci_name:
                skipped_empty += 1
                continue
            clean_props = {key: props.get(key) for key in KEEP_PROPS if props.get(key) not in (None, "")}
            geometry = {"type": "MultiPolygon", "coordinates": coordinates}
            feature = {"type": "Feature", "properties": clean_props, "geometry": geometry}
            bounds = geometry_bounds(geometry)
            entry = species.setdefault(
                sci_name,
                {
                    "features": [],
                    "bounds": [],
                    "props": clean_props,
                },
            )
            entry["features"].append(feature)
            entry["bounds"].append(bounds)
            if processed % args.progress_every == 0:
                print(
                    f"  processed {processed} records; species buffered {len(species)}",
                    flush=True,
                )
        print(f"Finished {shp_path.name}: {part_processed} records", flush=True)
        if args.limit and processed >= args.limit:
            break

    print(f"Serializing {len(species)} species from {processed} source records...", flush=True)
    for sci_name, entry in species.items():
        props = entry["props"]
        collection = feature_collection(sci_name, entry["features"])
        gz = gzip.compress(json.dumps(collection, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), compresslevel=9)
        bbox = merge_bounds(entry["bounds"])
        conn.execute(
            """
            INSERT INTO species (
              sci_name, grp, id_no, category, "order", family, genus,
              marine, terrestrial, freshwater, n_features,
              bbox_minx, bbox_miny, bbox_maxx, bbox_maxy, geojson_gz, wanted_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(sci_name) DO UPDATE SET
              grp=excluded.grp,
              id_no=excluded.id_no,
              category=excluded.category,
              "order"=excluded."order",
              family=excluded.family,
              genus=excluded.genus,
              marine=excluded.marine,
              terrestrial=excluded.terrestrial,
              freshwater=excluded.freshwater,
              n_features=excluded.n_features,
              bbox_minx=excluded.bbox_minx,
              bbox_miny=excluded.bbox_miny,
              bbox_maxx=excluded.bbox_maxx,
              bbox_maxy=excluded.bbox_maxy,
              geojson_gz=excluded.geojson_gz,
              wanted_name=excluded.wanted_name
            """,
            (
                sci_name,
                "marinefish",
                parse_number(props.get("id_no")),
                props.get("category"),
                props.get("order_"),
                props.get("family"),
                props.get("genus"),
                1 if str(props.get("marine", "")).lower() == "true" else 0,
                1 if str(props.get("terrestria", "")).lower() == "true" else 0,
                1 if str(props.get("freshwater", "")).lower() == "true" else 0,
                len(entry["features"]),
                bbox[0],
                bbox[1],
                bbox[2],
                bbox[3],
                gz,
                sci_name,
            ),
        )
    conn.commit()
    count = conn.execute("SELECT count(*) FROM species").fetchone()[0]
    size_mb = db_path.stat().st_size / 1024 / 1024
    print(f"Imported {len(species)} species; database now has {count} rows at {db_path} ({size_mb:.1f} MB). Skipped empty: {skipped_empty}.", flush=True)


def load_dex_animals():
    text = ANIMALS_DATA.read_text(encoding="utf-8")
    text = re.sub(r"^\s*export\s+const\s+ANIMALS\s*=\s*", "", text)
    text = re.sub(r";\s*$", "", text)
    return json.loads(text)


def load_dex_names():
    return {
        norm_name(a.get("sci")): a
        for a in load_dex_animals()
        if a.get("sci")
    }


def load_dex_fish_names():
    animals = load_dex_animals()
    return {
        norm_name(a.get("sci")): a
        for a in animals
        if a.get("cls") in FISH_CLASSES
    }


def prune_deploy_dir(deploy_dir):
    index_path = deploy_dir / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {}
    dex_names = load_dex_names()
    dex_slugs = {slugify(a.get("sci")) for a in dex_names.values()}

    removed_index = 0
    for name in list(index):
        if norm_name(name) not in dex_names:
            index.pop(name, None)
            removed_index += 1

    removed_files = 0
    for path in deploy_dir.glob("*.geojson.gz"):
        slug = path.name.removesuffix(".geojson.gz")
        if slug not in dex_slugs:
            path.unlink()
            removed_files += 1

    index_path.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    return removed_index, removed_files, len(index)


def export_dex(args):
    db_path = Path(args.db)
    deploy_dir = Path(args.deploy_dir)
    deploy_dir.mkdir(parents=True, exist_ok=True)
    index_path = deploy_dir / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else {}
    fish = load_dex_fish_names()
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT id, sci_name, grp, id_no, category, marine, terrestrial, freshwater,
               n_features, bbox_minx, bbox_miny, bbox_maxx, bbox_maxy, wanted_name, geojson_gz
        FROM species
        WHERE lower(sci_name) IN ({})
        ORDER BY sci_name
        """.format(",".join("?" for _ in fish)),
        list(fish.keys()),
    ).fetchall()
    matched = {norm_name(row["sci_name"]) for row in rows}
    missing = sorted(set(fish) - matched)
    print(f"Animaldex fish species: {len(fish)}; matched in marinefish DB: {len(rows)}; missing: {len(missing)}")
    already_deployed = [name for name in missing if name in index]
    missing_from_deploy = [name for name in missing if name not in index]
    deploy_covered = [name for name in fish if name in index or name in matched]
    print(
        f"Combined deploy coverage after this source: {len(deploy_covered)}/{len(fish)} unique fish names; "
        f"marinefish-missing already deployed: {len(already_deployed)}; true gaps: {len(missing_from_deploy)}"
    )
    if args.dry_run:
        for name in missing_from_deploy[:80]:
            a = fish[name]
            print(f"true_gap\t{a.get('no')}\t{a.get('sci')}\t{a.get('com')}")
        return

    for row in rows:
        slug = slugify(row["sci_name"])
        filename = f"{slug}.geojson.gz"
        (deploy_dir / filename).write_bytes(row["geojson_gz"])
        index[norm_name(row["sci_name"])] = {
            "id": row["id"],
            "sci_name": row["sci_name"],
            "wanted_name": row["wanted_name"],
            "slug": slug,
            "url": f"/data/species-ranges/{filename}",
            "group": row["grp"],
            "id_no": row["id_no"],
            "category": row["category"],
            "marine": bool(row["marine"]),
            "terrestrial": bool(row["terrestrial"]),
            "freshwater": bool(row["freshwater"]),
            "n_features": row["n_features"],
            "bbox": [row["bbox_minx"], row["bbox_miny"], row["bbox_maxx"], row["bbox_maxy"]],
        }
    index_path.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    removed_index, removed_files, index_count = prune_deploy_dir(deploy_dir)
    print(
        f"Exported/updated {len(rows)} deployable ranges in {deploy_dir}; "
        f"index now has {index_count} entries. Pruned orphan index entries: {removed_index}; files: {removed_files}."
    )


def inspect_db(args):
    conn = sqlite3.connect(args.db)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """
        SELECT grp, count(*) n, round(avg(length(geojson_gz))/1024.0, 1) avg_kb,
               round(max(length(geojson_gz))/1024.0, 1) max_kb,
               sum(length(geojson_gz)) total_bytes
        FROM species
        GROUP BY grp
        ORDER BY grp
        """
    ).fetchall()
    for row in rows:
        print(dict(row))


def prune_deploy(args):
    deploy_dir = Path(args.deploy_dir)
    removed_index, removed_files, index_count = prune_deploy_dir(deploy_dir)
    print(
        f"Pruned deploy directory {deploy_dir}; index now has {index_count} entries. "
        f"Removed orphan index entries: {removed_index}; files: {removed_files}."
    )


def main():
    parser = argparse.ArgumentParser(description="Import and deploy simplified MARINEFISH range shapefiles.")
    sub = parser.add_subparsers(dest="command", required=True)

    p_import = sub.add_parser("import")
    p_import.add_argument("--input", default=str(DEFAULT_INPUT))
    p_import.add_argument("--db", default=str(DEFAULT_DB))
    p_import.add_argument("--tolerance", type=float, default=0.05)
    p_import.add_argument("--precision", type=int, default=5)
    p_import.add_argument("--min-area", type=float, default=0.0)
    p_import.add_argument("--limit", type=int, default=0)
    p_import.add_argument("--replace", action="store_true")
    p_import.add_argument("--progress-every", type=int, default=500)
    p_import.set_defaults(func=import_marinefish)

    p_export = sub.add_parser("export-dex")
    p_export.add_argument("--db", default=str(DEFAULT_DB))
    p_export.add_argument("--deploy-dir", default=str(DEFAULT_DEPLOY_DIR))
    p_export.add_argument("--dry-run", action="store_true")
    p_export.set_defaults(func=export_dex)

    p_prune = sub.add_parser("prune-deploy")
    p_prune.add_argument("--deploy-dir", default=str(DEFAULT_DEPLOY_DIR))
    p_prune.set_defaults(func=prune_deploy)

    p_inspect = sub.add_parser("inspect-db")
    p_inspect.add_argument("--db", default=str(DEFAULT_DB))
    p_inspect.set_defaults(func=inspect_db)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
