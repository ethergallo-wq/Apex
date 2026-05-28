#!/usr/bin/env python3
import argparse
import json
import re
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ANIMALS_DATA = ROOT / "src" / "animals-data.js"
DEFAULT_ALIASES = ROOT / "data" / "species-ranges-master" / "range_aliases.json"
DEFAULT_DEPLOY_DIR = ROOT / "public" / "data" / "species-ranges"
SOURCE_DBS = {
    "historical": Path("/Users/andreagalliazzo/Desktop/Apex/Distribuzione Animali Apex/species_app.sqlite"),
    "marinefish": ROOT / "data" / "species-ranges-master" / "marinefish.sqlite",
}


def norm_name(value):
    return re.sub(r"\s+", " ", (value or "").strip()).lower()


def slugify(value):
    clean = re.sub(r"[^a-z0-9]+", "-", (value or "").strip().lower())
    return clean.strip("-")


def load_animals():
    text = ANIMALS_DATA.read_text(encoding="utf-8")
    text = re.sub(r"^\s*export\s+const\s+ANIMALS\s*=\s*", "", text)
    text = re.sub(r";\s*$", "", text)
    return json.loads(text)


def load_index(deploy_dir):
    index_path = deploy_dir / "index.json"
    if not index_path.exists():
        return {}
    return json.loads(index_path.read_text(encoding="utf-8"))


def save_index(deploy_dir, index):
    (deploy_dir / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )


def fetch_source_row(source_db, source_sci):
    db_path = SOURCE_DBS[source_db]
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    return con.execute(
        """
        SELECT id, sci_name, grp, id_no, category, marine, terrestrial, freshwater,
               n_features, bbox_minx, bbox_miny, bbox_maxx, bbox_maxy, wanted_name, geojson_gz
        FROM species
        WHERE lower(sci_name) = lower(?)
        """,
        (source_sci,),
    ).fetchone()


def prune_deploy(deploy_dir, animals):
    index = load_index(deploy_dir)
    dex_names = {norm_name(a.get("sci")) for a in animals if a.get("sci")}
    dex_slugs = {slugify(a.get("sci")) for a in animals if a.get("sci")}
    removed_index = 0
    removed_files = 0

    for name in list(index):
        if norm_name(name) not in dex_names:
            index.pop(name, None)
            removed_index += 1

    for path in deploy_dir.glob("*.geojson.gz"):
        if path.name.removesuffix(".geojson.gz") not in dex_slugs:
            path.unlink()
            removed_files += 1

    save_index(deploy_dir, index)
    return removed_index, removed_files, len(index)


def apply_aliases(args):
    deploy_dir = Path(args.deploy_dir)
    deploy_dir.mkdir(parents=True, exist_ok=True)
    alias_doc = json.loads(Path(args.aliases).read_text(encoding="utf-8"))
    animals = load_animals()
    animals_by_name = {norm_name(a.get("sci")): a for a in animals if a.get("sci")}
    index = load_index(deploy_dir)
    applied = []
    skipped = []

    for alias in alias_doc.get("aliases", []):
        if alias.get("apply") is False:
            skipped.append((alias, "apply=false"))
            continue
        target_name = norm_name(alias.get("animaldex_sci"))
        if target_name not in animals_by_name:
            skipped.append((alias, "animaldex species not found"))
            continue
        if target_name in index and not args.replace_existing:
            skipped.append((alias, "already covered"))
            continue

        row = fetch_source_row(alias["source_db"], alias["source_sci"])
        if not row:
            skipped.append((alias, "source range not found"))
            continue

        animal = animals_by_name[target_name]
        target_sci = animal["sci"]
        slug = slugify(target_sci)
        filename = f"{slug}.geojson.gz"
        if not args.dry_run:
            (deploy_dir / filename).write_bytes(row["geojson_gz"])
            index[target_name] = {
                "id": row["id"],
                "sci_name": target_sci,
                "wanted_name": target_sci,
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
                "range_alias": {
                    "source_sci_name": row["sci_name"],
                    "source_db": alias["source_db"],
                    "basis": alias.get("basis"),
                    "confidence": alias.get("confidence"),
                },
            }
        applied.append((target_sci, row["sci_name"], alias["source_db"]))

    if not args.dry_run:
        save_index(deploy_dir, index)
        pruned = prune_deploy(deploy_dir, animals)
    else:
        pruned = (0, 0, len(index))

    print(f"Applied aliases: {len(applied)}")
    for target, source, source_db in applied:
        print(f"alias\t{target}\t<=\t{source}\t[{source_db}]")
    print(f"Skipped aliases: {len(skipped)}")
    for alias, reason in skipped:
        print(f"skip\t{alias.get('animaldex_sci')}\t<=\t{alias.get('source_sci')}\t{reason}")
    print(f"Deploy index entries: {pruned[2]}; pruned orphan index entries: {pruned[0]}; files: {pruned[1]}")


def main():
    parser = argparse.ArgumentParser(description="Apply curated taxonomic aliases to deployable species ranges.")
    parser.add_argument("--aliases", default=str(DEFAULT_ALIASES))
    parser.add_argument("--deploy-dir", default=str(DEFAULT_DEPLOY_DIR))
    parser.add_argument("--replace-existing", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    apply_aliases(args)


if __name__ == "__main__":
    main()
