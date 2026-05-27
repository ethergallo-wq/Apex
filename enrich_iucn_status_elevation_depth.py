#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
enrich_iucn_status_elevation_depth.py

Estrae da IUCN Red List API v4:
- stato di conservazione (Red List category: LC, NT, VU, EN, CR, DD, ecc.)
- range altitudinale, quando presente
- range di profondità, quando presente

Input:
- animals-data.js con `export const ANIMALS = [...]`

Output:
- iucn_status_elevation_depth.json
- iucn_status_elevation_depth.csv
- iucn_status_elevation_depth.js
- summary_status_elevation_depth.json
- opzionale: animals-data.iucn_status_patched.js

Uso:
export IUCN_REDLIST_KEY="LA_TUA_KEY"

python3 scripts/enrich_iucn_status_elevation_depth.py \
  --input src/animals-data.js \
  --out-dir ./iucn_status_elevation_depth \
  --delay 2.0

Test primi 20:
python3 scripts/enrich_iucn_status_elevation_depth.py \
  --input src/animals-data.js \
  --out-dir ./iucn_status_elevation_depth_test \
  --max 20 \
  --verbose

Per generare anche un animals-data.js patchato:
python3 scripts/enrich_iucn_status_elevation_depth.py \
  --input src/animals-data.js \
  --out-dir ./iucn_status_elevation_depth \
  --patch-output ./iucn_status_elevation_depth/animals-data.iucn_status_patched.js
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
from copy import deepcopy
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import urljoin

import requests


BASE_URL = "https://api.iucnredlist.org/api/v4/"


def read_animals_js(path: Path) -> List[Dict[str, Any]]:
    """Estrae export const ANIMALS = [...] da animals-data.js e lo parsea come JSON."""
    text = path.read_text(encoding="utf-8")

    m = re.search(r"export\s+const\s+ANIMALS\s*=", text)
    if not m:
        raise ValueError("Non trovo `export const ANIMALS =` nel file input.")

    start = text.find("[", m.end())
    if start < 0:
        raise ValueError("Non trovo `[` dopo `export const ANIMALS =`.")

    depth = 0
    in_string = False
    escape = False
    end = None

    for i in range(start, len(text)):
        ch = text[i]

        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
        elif ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    if end is None:
        raise ValueError("Array ANIMALS non chiuso.")

    raw = text[start:end]
    return json.loads(raw)


def safe_slug(s: str) -> str:
    return re.sub(r"[^A-Za-z0-9_-]+", "_", (s or "").strip()).strip("_") or "unknown"


def get_nested(d: Dict[str, Any], path: Tuple[str, ...]) -> Any:
    cur: Any = d
    for p in path:
        if not isinstance(cur, dict):
            return None
        cur = cur.get(p)
    return cur


def existing_iucn_assessment_id(animal: Dict[str, Any]) -> Optional[int]:
    """
    Usa un assessment_id già presente nel tuo animals-data.js come scorciatoia.
    Non usa nessun altro dato locale come fonte IUCN.
    """
    paths = [
        ("geo", "iucn_meta", "assessment_id"),
        ("iucn_meta", "assessment_id"),
        ("distribution", "iucn_meta", "assessment_id"),
        ("iucn", "assessment_id"),
    ]
    for p in paths:
        v = get_nested(animal, p)
        if isinstance(v, int):
            return v
        if isinstance(v, str) and v.isdigit():
            return int(v)
    return None


class IUCNClient:
    def __init__(
        self,
        token: str,
        delay: float = 2.0,
        timeout: float = 60.0,
        verbose: bool = False,
    ):
        self.token = token
        self.delay = delay
        self.timeout = timeout
        self.verbose = verbose
        self.last_call = 0.0

        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": "animaldex-iucn-status-elevation-depth/1.0",
        })

    def get(self, path: str, params: Optional[dict] = None) -> Any:
        url = urljoin(BASE_URL, path.lstrip("/"))

        last_resp = None
        for attempt in range(5):
            wait = self.delay - (time.monotonic() - self.last_call)
            if wait > 0:
                time.sleep(wait)

            if self.verbose:
                print(f"GET {url} {params or ''}", file=sys.stderr)

            resp = self.session.get(url, params=params, timeout=self.timeout)
            last_resp = resp
            self.last_call = time.monotonic()

            if resp.status_code == 404:
                return None

            if resp.status_code == 429:
                retry_after = resp.headers.get("Retry-After")
                sleep_s = float(retry_after) if retry_after and retry_after.isdigit() else min(60, (2 ** attempt) * max(self.delay, 1.0))
                print(f"Rate limit 429. Pausa {sleep_s:.1f}s", file=sys.stderr)
                time.sleep(sleep_s)
                continue

            if 500 <= resp.status_code < 600:
                sleep_s = min(60, (2 ** attempt) * max(self.delay, 1.0))
                print(f"Server error {resp.status_code}. Retry tra {sleep_s:.1f}s", file=sys.stderr)
                time.sleep(sleep_s)
                continue

            resp.raise_for_status()
            return resp.json()

        if last_resp is not None:
            last_resp.raise_for_status()
        return None


def cache_read(path: Path) -> Any:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return None


def cache_write(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def sci_parts(sci: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    parts = re.sub(r"\s+", " ", (sci or "").strip()).split(" ")
    if len(parts) < 2:
        return None, None, None
    genus = parts[0].capitalize()
    species = parts[1].lower()
    infra = " ".join(parts[2:]).lower() if len(parts) > 2 else None
    return genus, species, infra


def listify_assessments(response: Any) -> List[Dict[str, Any]]:
    if response is None:
        return []
    if isinstance(response, list):
        return [x for x in response if isinstance(x, dict)]
    if isinstance(response, dict):
        for key in ("assessments", "result", "results", "data"):
            v = response.get(key)
            if isinstance(v, list):
                return [x for x in v if isinstance(x, dict)]
        if "assessment_id" in response or "id" in response:
            return [response]
    return []


def assessment_scopes(a: Dict[str, Any]) -> List[str]:
    out: List[str] = []

    scopes = a.get("scopes")
    if isinstance(scopes, list):
        for s in scopes:
            if isinstance(s, dict):
                code = s.get("code")
                if code is not None:
                    out.append(str(code))
            elif isinstance(s, str):
                out.append(s)

    if a.get("scope_code") is not None:
        out.append(str(a["scope_code"]))

    return sorted(set(out))


def choose_assessment_id(response: Any, preferred_scope: Optional[str] = "1") -> Optional[int]:
    """
    Sceglie l'assessment global latest se disponibile.
    Scope 1 di solito corrisponde a Global.
    """
    assessments = listify_assessments(response)
    if not assessments:
        return None

    selected = assessments

    if preferred_scope:
        scoped = [a for a in assessments if preferred_scope in assessment_scopes(a)]
        if scoped:
            selected = scoped

    latest = [a for a in selected if a.get("latest") is True]
    if latest:
        selected = latest

    def key(a: Dict[str, Any]) -> Tuple[int, int]:
        y = (
            a.get("year_published")
            or a.get("published_year")
            or a.get("assessment_date")
            or 0
        )
        try:
            year = int(str(y)[:4])
        except Exception:
            year = 0

        aid = a.get("assessment_id") or a.get("id") or 0
        try:
            aid_i = int(aid)
        except Exception:
            aid_i = 0

        return year, aid_i

    chosen = sorted(selected, key=key, reverse=True)[0]
    aid = chosen.get("assessment_id") or chosen.get("id")
    return int(aid) if aid is not None else None


def fetch_assessment(
    client: IUCNClient,
    animal: Dict[str, Any],
    cache_dir: Path,
    scope: Optional[str],
    refresh: bool,
) -> Tuple[Optional[Dict[str, Any]], Dict[str, Any]]:
    sci = animal.get("sci") or animal.get("scientific_name") or ""

    meta: Dict[str, Any] = {
        "scientific_name": sci,
        "assessment_id": None,
        "assessment_source": None,
        "status": "not_started",
    }

    aid = existing_iucn_assessment_id(animal)

    if aid is not None:
        meta["assessment_source"] = "animals-data.js existing assessment_id"
    else:
        genus, species, infra = sci_parts(sci)
        if not genus or not species:
            meta["status"] = "invalid_scientific_name"
            return None, meta

        lookup_path = cache_dir / "lookup" / f"{safe_slug(sci)}.json"
        lookup = None if refresh else cache_read(lookup_path)

        if lookup is None:
            params = {
                "genus_name": genus,
                "species_name": species,
            }
            if infra:
                params["infra_name"] = infra
            lookup = client.get("taxa/scientific_name", params=params)
            cache_write(lookup_path, lookup)

        aid = choose_assessment_id(lookup, preferred_scope=scope)
        meta["assessment_source"] = "IUCN taxa/scientific_name lookup"

    if aid is None:
        meta["status"] = "assessment_not_found"
        return None, meta

    meta["assessment_id"] = aid

    assessment_path = cache_dir / "assessment" / f"{aid}.json"
    assessment = None if refresh else cache_read(assessment_path)

    if assessment is None:
        assessment = client.get(f"assessment/{aid}")
        cache_write(assessment_path, assessment)

    meta["status"] = "ok" if assessment else "assessment_fetch_failed"
    return assessment, meta


def walk(obj: Any, path: Tuple[str, ...] = ()) -> Iterable[Tuple[Tuple[str, ...], Any]]:
    yield path, obj
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk(v, path + (str(k),))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk(v, path + (str(i),))


def text_value(x: Any) -> Optional[str]:
    if isinstance(x, str):
        return x
    if isinstance(x, dict):
        for k in ("code", "en", "it", "value", "name", "label", "description", "text"):
            v = x.get(k)
            if isinstance(v, str):
                return v
            nested = text_value(v)
            if nested:
                return nested
    return None


def as_float(v: Any) -> Optional[float]:
    if isinstance(v, bool) or v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        m = re.search(r"-?\d+(?:[.,]\d+)?", v)
        if m:
            return float(m.group(0).replace(",", "."))
    return None


def find_number_by_key(assessment: Dict[str, Any], aliases: List[str]) -> Optional[float]:
    aliases_l = {a.lower() for a in aliases}
    for path, value in walk(assessment):
        if path and path[-1].lower() in aliases_l:
            n = as_float(value)
            if n is not None:
                return n
    return None


def raw_values_by_terms(assessment: Optional[Dict[str, Any]], terms: List[str]) -> List[Dict[str, Any]]:
    """
    Tiene traccia dei campi grezzi trovati, utile per debug.
    Non usarlo nel frontend; può essere verboso.
    """
    if not isinstance(assessment, dict):
        return []

    out: List[Dict[str, Any]] = []
    for path, value in walk(assessment):
        keypath = ".".join(path).lower()
        if any(t in keypath for t in terms):
            if value is None or isinstance(value, (str, int, float, bool)):
                out.append({"path": ".".join(path), "value": value})
    return out


def extract_redlist_meta(assessment: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not isinstance(assessment, dict):
        return {
            "red_list_category": None,
            "red_list_category_name": None,
            "year_published": None,
            "assessment_url": None,
        }

    cat = (
        assessment.get("red_list_category")
        or assessment.get("redlist_category")
        or assessment.get("category")
    )

    red_list_category = None
    red_list_category_name = None

    if isinstance(cat, dict):
        red_list_category = (
            cat.get("code")
            or cat.get("short_code")
            or cat.get("name")
            or text_value(cat)
        )
        red_list_category_name = (
            text_value(cat.get("description"))
            or cat.get("label")
            or cat.get("name")
        )
    elif isinstance(cat, str):
        red_list_category = cat

    citation = assessment.get("citation")
    assessment_url = None
    if isinstance(citation, dict):
        assessment_url = citation.get("url")

    return {
        "red_list_category": red_list_category,
        "red_list_category_name": red_list_category_name,
        "year_published": assessment.get("year_published") or assessment.get("published_year"),
        "assessment_url": assessment_url or assessment.get("url"),
    }


def extract_elevation_depth_iucn_only(assessment: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Estrae solo campi presenti nell'assessment IUCN.
    Nessuna inferenza da habitat, descrizioni o dati locali.
    """
    if not isinstance(assessment, dict):
        return {
            "elevation_lower_m": None,
            "elevation_upper_m": None,
            "depth_upper_m": None,
            "depth_lower_m": None,
            "elevation_range_m": None,
            "depth_range_m": None,
            "raw_elevation_values": [],
            "raw_depth_values": [],
        }

    elevation_lower = find_number_by_key(assessment, [
        "lower_elevation_limit",
        "elevation_lower",
        "elevation_min",
        "min_elevation",
        "minimum_elevation",
        "altitude_min",
        "lower_altitude_limit",
        "lower_elevation",
    ])

    elevation_upper = find_number_by_key(assessment, [
        "upper_elevation_limit",
        "elevation_upper",
        "elevation_max",
        "max_elevation",
        "maximum_elevation",
        "altitude_max",
        "upper_altitude_limit",
        "upper_elevation",
    ])

    # Nomenclatura IUCN: upper depth = limite superiore/shallow, lower depth = limite inferiore/deep.
    depth_upper = find_number_by_key(assessment, [
        "upper_depth_limit",
        "depth_upper",
        "depth_min",
        "min_depth",
        "minimum_depth",
        "upper_depth",
    ])

    depth_lower = find_number_by_key(assessment, [
        "lower_depth_limit",
        "depth_lower",
        "depth_max",
        "max_depth",
        "maximum_depth",
        "lower_depth",
    ])

    elevation_range = None
    if elevation_lower is not None or elevation_upper is not None:
        elevation_range = {
            "lower_m": elevation_lower,
            "upper_m": elevation_upper,
        }

    depth_range = None
    if depth_upper is not None or depth_lower is not None:
        depth_range = {
            "upper_m_shallow": depth_upper,
            "lower_m_deep": depth_lower,
        }

    return {
        "elevation_lower_m": elevation_lower,
        "elevation_upper_m": elevation_upper,
        "depth_upper_m": depth_upper,
        "depth_lower_m": depth_lower,
        "elevation_range_m": elevation_range,
        "depth_range_m": depth_range,
        "raw_elevation_values": raw_values_by_terms(assessment, ["elevation", "altitude", "altitudinal"]),
        "raw_depth_values": raw_values_by_terms(assessment, ["depth", "bathymetric"]),
    }


def make_record(animal: Dict[str, Any], assessment: Optional[Dict[str, Any]], meta: Dict[str, Any]) -> Dict[str, Any]:
    red = extract_redlist_meta(assessment)
    elev_depth = extract_elevation_depth_iucn_only(assessment)

    return {
        "animal_id": animal.get("id"),
        "animal_no": animal.get("no"),
        "scientific_name": animal.get("sci"),
        "common_name_it": animal.get("com"),
        "common_name_en": animal.get("com_en"),

        "source": "IUCN Red List API v4",
        "iucn_lookup_status": meta.get("status"),
        "iucn_assessment_id": meta.get("assessment_id"),
        "iucn_assessment_source": meta.get("assessment_source"),

        "iucn_red_list_category": red.get("red_list_category"),
        "iucn_red_list_category_name": red.get("red_list_category_name"),
        "iucn_year_published": red.get("year_published"),
        "iucn_assessment_url": red.get("assessment_url"),

        **elev_depth,
    }


def write_outputs(records: List[Dict[str, Any]], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    json_path = out_dir / "iucn_status_elevation_depth.json"
    csv_path = out_dir / "iucn_status_elevation_depth.csv"
    js_path = out_dir / "iucn_status_elevation_depth.js"
    summary_path = out_dir / "summary_status_elevation_depth.json"

    json_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    keyed = {
        str(r["animal_id"]): {
            "animal_id": r.get("animal_id"),
            "animal_no": r.get("animal_no"),
            "scientific_name": r.get("scientific_name"),
            "common_name_it": r.get("common_name_it"),
            "source": r.get("source"),
            "iucn_lookup_status": r.get("iucn_lookup_status"),
            "iucn_assessment_id": r.get("iucn_assessment_id"),
            "iucn_red_list_category": r.get("iucn_red_list_category"),
            "iucn_red_list_category_name": r.get("iucn_red_list_category_name"),
            "iucn_year_published": r.get("iucn_year_published"),
            "iucn_assessment_url": r.get("iucn_assessment_url"),
            "elevation_lower_m": r.get("elevation_lower_m"),
            "elevation_upper_m": r.get("elevation_upper_m"),
            "depth_upper_m": r.get("depth_upper_m"),
            "depth_lower_m": r.get("depth_lower_m"),
            "elevation_range_m": r.get("elevation_range_m"),
            "depth_range_m": r.get("depth_range_m"),
        }
        for r in records
        if r.get("animal_id") is not None
    }

    js_path.write_text(
        "export const IUCN_STATUS_ELEVATION_DEPTH = "
        + json.dumps(keyed, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    fields = [
        "animal_id",
        "animal_no",
        "scientific_name",
        "common_name_it",
        "common_name_en",
        "iucn_lookup_status",
        "iucn_assessment_id",
        "iucn_red_list_category",
        "iucn_red_list_category_name",
        "iucn_year_published",
        "iucn_assessment_url",
        "elevation_lower_m",
        "elevation_upper_m",
        "depth_upper_m",
        "depth_lower_m",
    ]

    with csv_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in records:
            w.writerow({k: r.get(k) for k in fields})

    summary = {
        "source": "IUCN Red List API v4",
        "n_records": len(records),
        "ok": sum(1 for r in records if r.get("iucn_lookup_status") == "ok"),
        "failed_or_not_found": sum(1 for r in records if r.get("iucn_lookup_status") != "ok"),
        "with_red_list_category": sum(1 for r in records if r.get("iucn_red_list_category")),
        "with_elevation": sum(1 for r in records if r.get("elevation_lower_m") is not None or r.get("elevation_upper_m") is not None),
        "with_depth": sum(1 for r in records if r.get("depth_upper_m") is not None or r.get("depth_lower_m") is not None),
        "outputs": {
            "json": str(json_path),
            "csv": str(csv_path),
            "js": str(js_path),
            "summary": str(summary_path),
        },
        "notes": {
            "depth_upper_m": "limite superiore/meno profondo secondo nomenclatura IUCN, quando presente",
            "depth_lower_m": "limite inferiore/più profondo secondo nomenclatura IUCN, quando presente",
            "no_local_inference": "altitudine/profondità/stato sono letti solo dall'assessment IUCN, non inferiti da animals-data.js",
        },
    }

    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")


def patch_animals_js(animals: List[Dict[str, Any]], records: List[Dict[str, Any]], output_path: Path) -> None:
    """
    Crea un nuovo animals-data.js patchato.
    Non modifica il file originale.

    Patch:
    - aggiorna cons con iucn_red_list_category, se presente
    - aggiunge/aggiorna animal["iucn"] con status/elevation/depth
    """
    by_id = {r.get("animal_id"): r for r in records if r.get("animal_id") is not None}

    patched = deepcopy(animals)

    for animal in patched:
        aid = animal.get("id")
        rec = by_id.get(aid)
        if not rec:
            continue

        cat = rec.get("iucn_red_list_category")
        if cat:
            animal["cons"] = cat

        iucn_obj = animal.get("iucn")
        if not isinstance(iucn_obj, dict):
            iucn_obj = {}

        iucn_obj.update({
            "source": "IUCN Red List API v4",
            "lookup_status": rec.get("iucn_lookup_status"),
            "assessment_id": rec.get("iucn_assessment_id"),
            "red_list_category": rec.get("iucn_red_list_category"),
            "red_list_category_name": rec.get("iucn_red_list_category_name"),
            "year_published": rec.get("iucn_year_published"),
            "assessment_url": rec.get("iucn_assessment_url"),
            "elevation_lower_m": rec.get("elevation_lower_m"),
            "elevation_upper_m": rec.get("elevation_upper_m"),
            "depth_upper_m": rec.get("depth_upper_m"),
            "depth_lower_m": rec.get("depth_lower_m"),
        })

        animal["iucn"] = iucn_obj

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        "export const ANIMALS = "
        + json.dumps(patched, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )


def main() -> int:
    p = argparse.ArgumentParser(
        description="Estrae stato conservazione IUCN + altitudine/profondità da IUCN Red List API v4."
    )
    p.add_argument("--input", required=True, type=Path, help="Path a animals-data.js")
    p.add_argument("--out-dir", default=Path("./iucn_status_elevation_depth"), type=Path)
    p.add_argument("--token", default=os.environ.get("IUCN_REDLIST_KEY"), help="API key IUCN oppure env IUCN_REDLIST_KEY")
    p.add_argument("--scope", default="1", help="Scope preferito assessment. 1=Global. Usa '' per disattivare.")
    p.add_argument("--delay", type=float, default=2.0, help="Pausa tra chiamate API.")
    p.add_argument("--max", type=int, default=None, help="Processa solo i primi N animali.")
    p.add_argument("--refresh", action="store_true", help="Ignora cache e riscarica.")
    p.add_argument("--verbose", action="store_true")
    p.add_argument("--patch-output", type=Path, default=None, help="Opzionale: genera animals-data.js patchato con cons/iucn.")
    args = p.parse_args()

    if not args.token:
        print("ERRORE: manca IUCN API key. Usa env IUCN_REDLIST_KEY o --token.", file=sys.stderr)
        return 2

    animals = read_animals_js(args.input)
    if args.max is not None:
        animals = animals[: args.max]

    args.out_dir.mkdir(parents=True, exist_ok=True)
    cache_dir = args.out_dir / "cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    client = IUCNClient(args.token, delay=args.delay, verbose=args.verbose)
    scope = args.scope if args.scope != "" else None

    records: List[Dict[str, Any]] = []
    partial = args.out_dir / "partial_status_elevation_depth.jsonl"

    print(f"Animali da processare: {len(animals)}", file=sys.stderr)
    print("Modalità: IUCN API v4. Nessuna inferenza da dati locali per status/altitudine/profondità.", file=sys.stderr)

    with partial.open("w", encoding="utf-8") as pf:
        for idx, animal in enumerate(animals, start=1):
            sci = animal.get("sci")
            print(f"[{idx}/{len(animals)}] {sci}", file=sys.stderr)

            try:
                assessment, meta = fetch_assessment(client, animal, cache_dir, scope, args.refresh)
                rec = make_record(animal, assessment, meta)
            except Exception as e:
                rec = {
                    "animal_id": animal.get("id"),
                    "animal_no": animal.get("no"),
                    "scientific_name": sci,
                    "common_name_it": animal.get("com"),
                    "source": "IUCN Red List API v4",
                    "iucn_lookup_status": "error",
                    "error": repr(e),
                }
                print(f"  ERRORE: {e}", file=sys.stderr)

            records.append(rec)
            pf.write(json.dumps(rec, ensure_ascii=False) + "\n")
            pf.flush()

    write_outputs(records, args.out_dir)

    if args.patch_output:
        patch_animals_js(animals, records, args.patch_output)
        print(f"Patch animals-data.js: {args.patch_output}", file=sys.stderr)

    print("Fatto.", file=sys.stderr)
    print(f"JSON:    {args.out_dir / 'iucn_status_elevation_depth.json'}", file=sys.stderr)
    print(f"CSV:     {args.out_dir / 'iucn_status_elevation_depth.csv'}", file=sys.stderr)
    print(f"JS:      {args.out_dir / 'iucn_status_elevation_depth.js'}", file=sys.stderr)
    print(f"SUMMARY: {args.out_dir / 'summary_status_elevation_depth.json'}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
