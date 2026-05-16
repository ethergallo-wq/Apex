#!/usr/bin/env python3
import gzip
import json
import re
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SQLITE_PATH = Path("/Users/andreagalliazzo/Desktop/Apex/Distribuzione Animali Apex/species_app.sqlite")
OUT_DIR = ROOT / "public" / "data" / "species-ranges"
INDEX_PATH = OUT_DIR / "index.json"


def slugify(value):
    clean = re.sub(r"[^a-z0-9]+", "-", (value or "").strip().lower())
    return clean.strip("-")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("*.geojson.gz"):
        old.unlink()

    con = sqlite3.connect(SQLITE_PATH)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        """
        SELECT
          id, sci_name, grp, id_no, category, marine, terrestrial, freshwater,
          n_features, bbox_minx, bbox_miny, bbox_maxx, bbox_maxy, wanted_name,
          geojson_gz
        FROM species
        WHERE geojson_gz IS NOT NULL
        ORDER BY sci_name
        """
    ).fetchall()

    index = {}
    for row in rows:
        slug = slugify(row["sci_name"])
        if not slug:
            continue
        filename = f"{slug}.geojson.gz"
        (OUT_DIR / filename).write_bytes(row["geojson_gz"])
        index[row["sci_name"].lower()] = {
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
            "bbox": [
                row["bbox_minx"],
                row["bbox_miny"],
                row["bbox_maxx"],
                row["bbox_maxy"],
            ],
        }

    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Exported {len(index)} species ranges to {OUT_DIR}")


if __name__ == "__main__":
    main()
