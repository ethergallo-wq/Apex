#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
enrich_iucn_habitats_ONLY_IUCN.py

Versione corretta: usa animals-data.js SOLO come lista animali/specie.
NON usa mai questi campi del tuo dataset come fonte habitat:
- hab
- habitat_ids
- bio_regions
- game_regions
- map_profile
- unlock_tags
- desc/bio per inferire habitat

Gli habitat, systems, altitudine e profondità vengono presi SOLO dall'assessment IUCN Red List API v4.

USO
---
export IUCN_REDLIST_KEY="LA_TUA_KEY"

python scripts/enrich_iucn_habitats_ONLY_IUCN.py \
  --input animals-data.js \
  --out-dir ./iucn_enrichment_only_iucn \
  --delay 2.0

Test primi 20:
python scripts/enrich_iucn_habitats_ONLY_IUCN.py \
  --input animals-data.js \
  --out-dir ./iucn_enrichment_only_iucn \
  --max 20
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.parse import urljoin

import requests


BASE_URL = "https://api.iucnredlist.org/api/v4/"


IUCN_HABITAT_IT: Dict[str, str] = {
    "1": "Foresta",
    "1.1": "Foresta boreale",
    "1.2": "Foresta - Subartico",
    "1.3": "Foresta – Subantartica",
    "1.4": "Foresta – Temperata",
    "1.5": "Foresta – Subtropicale/tropicale secca",
    "1.6": "Foresta – Pianura umida subtropicale/tropicale",
    "1.7": "Foresta – Vegetazione di mangrovie subtropicale/tropicale al di sopra del livello dell'alta marea",
    "1.8": "Foresta – Palude subtropicale/tropicale",
    "1.9": "Foresta – Subtropicale/tropicale umida montana",
    "2": "Savana",
    "2.1": "Savana - Secca",
    "2.2": "Savana - Umida",
    "3": "Arbusti",
    "3.1": "Arbusti – Subartico",
    "3.2": "Arbusti – Subantartica",
    "3.3": "Arbusti – Boreale",
    "3.4": "Arbusti – Temperati",
    "3.5": "Arbusti – Zona secca subtropicale/tropicale",
    "3.6": "Arbusti – Subtropicale/tropicale umido",
    "3.7": "Arbusti – Zone subtropicali/tropicali di alta quota",
    "3.8": "Arbusti – Vegetazione arbustiva di tipo mediterraneo",
    "4": "Prateria",
    "4.1": "Prateria – Tundra",
    "4.2": "Prateria – Subartico",
    "4.3": "Prateria – Subantartica",
    "4.4": "Prateria – Temperata",
    "4.5": "Prateria – Subtropicale/tropicale arida",
    "4.6": "Prateria – Subtropicale/tropicale stagionalmente umida/allagata",
    "4.7": "Prateria – Alta quota subtropicale/tropicale",
    "5": "Zone umide (interne)",
    "5.1": "Zone umide (interne) – Fiumi/torrenti/cascate permanenti",
    "5.2": "Zone umide (interne) – Fiumi/torrenti/canali stagionali/intermittenti/irregolari",
    "5.3": "Zone umide (interne) – Zone umide dominate da arbusti",
    "5.4": "Zone umide (interne) – Paludi, acquitrini, torbiere",
    "5.5": "Zone umide (interne) – Laghi permanenti di acqua dolce (oltre 8 ettari)",
    "5.6": "Zone umide (interne) – Laghi d'acqua dolce stagionali/intermittenti (oltre 8 ha)",
    "5.7": "Zone umide (interne) – Paludi/stagni d'acqua dolce permanenti (inferiori a 8 ettari)",
    "5.8": "Zone umide (interne) – Paludi/stagni d'acqua dolce stagionali/intermittenti (inferiori a 8 ettari)",
    "5.9": "Zone umide (interne) – Sorgenti di acqua dolce e oasi",
    "5.10": "Zone umide (interne) – Zone umide della tundra",
    "5.11": "Zone umide (interne) – Zone umide alpine",
    "5.12": "Zone umide (interne) – Zone umide geotermiche",
    "5.13": "Zone umide (interne) – Delta interni permanenti",
    "5.14": "Zone umide (interne) – Laghi permanenti salini, salmastri o alcalini",
    "5.15": "Zone umide (interne) – Laghi e piane salmastre, saline o alcaline stagionali/intermittenti",
    "5.16": "Zone umide (interne) – Paludi/stagni permanenti salini, salmastri o alcalini",
    "5.17": "Zone umide (interne) – Paludi/pozze saline, salmastre o alcaline stagionali/intermittenti",
    "5.18": "Zone umide (interne) – Carsismo e altri sistemi idrologici sotterranei (interni)",
    "6": "Zone rocciose",
    "7": "Grotte e habitat sotterranei (non acquatici)",
    "7.1": "Grotte e habitat sotterranei (non acquatici) – Grotte",
    "7.2": "Grotte e habitat sotterranei (non acquatici) – Altri habitat sotterranei",
    "8": "Deserto",
    "8.1": "Deserto – Caldo",
    "8.2": "Deserto – Temperato",
    "8.3": "Deserto – Freddo",
    "9": "Neritica marina",
    "9.1": "Neritico marino – Pelagico",
    "9.2": "Neritica marina – Rocce e scogliere rocciose subtidali",
    "9.3": "Neritico marino – Roccia/ciottoli/ghiaia sciolti subtidali",
    "9.4": "Neritico marino – Sabbioso subtidale",
    "9.5": "Neritico marino – Fango sabbioso subtidale",
    "9.6": "Neritico marino – Subtidale fangoso",
    "9.7": "Neritico marino – Macroalghe/alghe",
    "9.8": "Neritica marina – Barriera corallina",
    "9.8.1": "Canale esterno della barriera corallina",
    "9.8.2": "Pendio posteriore",
    "9.8.3": "Pendio esterno",
    "9.8.4": "Laguna",
    "9.8.5": "Substrato soffice inter-barriera corallina",
    "9.8.6": "Substrato di detriti inter-barriera corallina",
    "9.9": "Erba marina sommersa",
    "9.10": "Estuari",
    "10": "Marino oceanico",
    "10.1": "Epipelagico (0–200 m)",
    "10.2": "Mesopelagico (200–1.000 m)",
    "10.3": "Batipelagico (1.000–4.000 m)",
    "10.4": "Abissopelagico (4.000–6.000 m)",
    "11": "Fondali oceanici profondi (bentonici e demersali)",
    "11.1": "Pendio continentale/Zona batilica (200–4.000 m)",
    "11.1.1": "Pendio continentale/Zona batilica – Substrato rigido",
    "11.1.2": "Pendio continentale/Zona batilica – Substrato morbido",
    "11.2": "Pianura abissale (4.000–6.000 m)",
    "11.3": "Montagne/Colline abissali (4.000–6.000 m)",
    "11.4": "Fossa abissale/di acque profonde (>6.000 m)",
    "11.5": "Monte sottomarino",
    "11.6": "Sorgenti idrotermali abissali",
    "12": "Intertidale marino",
    "12.1": "Costa rocciosa",
    "12.2": "Coste sabbiose e/o spiagge, banchi di sabbia, lingue di sabbia",
    "12.3": "Coste e/o spiagge di ciottoli e/o ghiaia",
    "12.4": "Coste fangose e piane fangose intertidali",
    "12.5": "Paludi salmastre",
    "12.6": "Pozze di marea",
    "12.7": "Radici sommerse delle mangrovie",
    "13": "Marino costiero/sopratidale",
    "13.1": "Scogliere marine e isole rocciose al largo della costa",
    "13.2": "Grotte costiere/Carsismo",
    "13.3": "Dune sabbiose costiere",
    "13.4": "Lagune costiere salmastre/saline/laghi marini",
    "13.5": "Laghi costieri di acqua dolce",
    "14": "Artificiale - Terrestre",
    "14.1": "Terreno arabile",
    "14.2": "Pascoli",
    "14.3": "Piantagioni",
    "14.4": "Orti rurali",
    "14.5": "Aree urbane",
    "14.6": "Foresta subtropicale/tropicale fortemente degradata",
    "15": "Artificiale - Acquatico",
    "15.1": "Aree di stoccaggio dell'acqua oltre 8 ettari",
    "15.2": "Stagni sotto gli 8 ettari",
    "15.3": "Stagni per l'acquacoltura",
    "15.4": "Siti di sfruttamento del sale",
    "15.5": "Scavi a cielo aperto",
    "15.6": "Aree di trattamento delle acque reflue",
    "15.7": "Terreni irrigati, compresi i canali di irrigazione",
    "15.8": "Terreni agricoli soggetti a inondazioni stagionali",
    "15.9": "Canali e fossi di drenaggio",
    "15.10": "Carsismo e altri sistemi idrologici sotterranei di origine antropica",
    "15.11": "Strutture antropiche marine",
    "15.12": "Gabbie per la maricoltura",
    "15.13": "Laghetti di acqua salmastra/Mari",
    "16": "Vegetazione introdotta",
    "17": "Altri",
    "18": "Sconosciuto",
}


def read_animals_js(path: Path) -> List[Dict[str, Any]]:
    """Estrae export const ANIMALS = [...] da animals-data.js."""
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

    return json.loads(text[start:end])


def get_nested(d: Dict[str, Any], path: Tuple[str, ...]) -> Any:
    cur: Any = d
    for p in path:
        if not isinstance(cur, dict):
            return None
        cur = cur.get(p)
    return cur


def existing_iucn_assessment_id(animal: Dict[str, Any]) -> Optional[int]:
    """
    Questo è l'UNICO dato IUCN letto da animals-data.js.
    Serve solo come scorciatoia per evitare lookup per nome.
    Non è un habitat.
    """
    paths = [
        ("geo", "iucn_meta", "assessment_id"),
        ("iucn_meta", "assessment_id"),
        ("distribution", "iucn_meta", "assessment_id"),
    ]
    for p in paths:
        v = get_nested(animal, p)
        if isinstance(v, int):
            return v
        if isinstance(v, str) and v.isdigit():
            return int(v)
    return None


class IUCNClient:
    def __init__(self, token: str, delay: float = 2.0, timeout: float = 60.0, verbose: bool = False):
        self.token = token
        self.delay = delay
        self.timeout = timeout
        self.verbose = verbose
        self.last_call = 0.0
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": "animaldex-iucn-habitats-only/1.0",
        })

    def get(self, path: str, params: Optional[dict] = None) -> Any:
        url = urljoin(BASE_URL, path.lstrip("/"))

        for attempt in range(5):
            wait = self.delay - (time.monotonic() - self.last_call)
            if wait > 0:
                time.sleep(wait)

            if self.verbose:
                print(f"GET {url} {params or ''}", file=sys.stderr)

            resp = self.session.get(url, params=params, timeout=self.timeout)
            self.last_call = time.monotonic()

            if resp.status_code == 404:
                return None

            if resp.status_code == 429:
                retry_after = resp.headers.get("Retry-After")
                sleep_s = float(retry_after) if retry_after and retry_after.isdigit() else min(60, 2 ** attempt * self.delay)
                print(f"Rate limit 429. Pausa {sleep_s:.1f}s", file=sys.stderr)
                time.sleep(sleep_s)
                continue

            if 500 <= resp.status_code < 600:
                sleep_s = min(60, 2 ** attempt * self.delay)
                print(f"Server error {resp.status_code}. Retry tra {sleep_s:.1f}s", file=sys.stderr)
                time.sleep(sleep_s)
                continue

            resp.raise_for_status()
            return resp.json()

        resp.raise_for_status()
        return None


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
    assessments = listify_assessments(response)
    if not assessments:
        return None

    selected = assessments

    # Scope 1 di solito = global. Se non presente, prende comunque l'assessment più recente.
    if preferred_scope:
        scoped = [a for a in assessments if preferred_scope in assessment_scopes(a)]
        if scoped:
            selected = scoped

    latest = [a for a in selected if a.get("latest") is True]
    if latest:
        selected = latest

    def key(a: Dict[str, Any]) -> Tuple[int, int]:
        y = a.get("year_published") or a.get("published_year") or a.get("assessment_date") or 0
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


def cache_read(path: Path) -> Any:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return None


def cache_write(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def safe_slug(s: str) -> str:
    return re.sub(r"[^A-Za-z0-9_-]+", "_", s.strip()).strip("_") or "unknown"


def fetch_assessment(client: IUCNClient, animal: Dict[str, Any], cache_dir: Path, scope: Optional[str], refresh: bool) -> Tuple[Optional[Dict[str, Any]], Dict[str, Any]]:
    sci = animal.get("sci") or animal.get("scientific_name") or ""
    meta: Dict[str, Any] = {
        "scientific_name": sci,
        "assessment_id": None,
        "assessment_source": None,
        "status": "not_started",
    }

    aid = existing_iucn_assessment_id(animal)

    if aid is not None:
        meta["assessment_source"] = "animals-data.js:geo.iucn_meta.assessment_id"
    else:
        genus, species, infra = sci_parts(sci)
        if not genus or not species:
            meta["status"] = "invalid_scientific_name"
            return None, meta

        lookup_path = cache_dir / "lookup" / f"{safe_slug(sci)}.json"
        lookup = None if refresh else cache_read(lookup_path)

        if lookup is None:
            params = {"genus_name": genus, "species_name": species}
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
        for k in ("en", "it", "value", "name", "label", "description", "text"):
            v = x.get(k)
            if isinstance(v, str):
                return v
            nested = text_value(v)
            if nested:
                return nested
    return None


def normalize_code(code: Any) -> Optional[str]:
    if code is None:
        return None
    s = str(code).strip().replace("_", ".")
    return s or None

def normalize_suitability(value: Any) -> str:
    """
    IUCN può restituire suitability come testo, dict o codice.
    Output app: suitable / marginal / unknown
    """
    raw = text_value(value) if isinstance(value, dict) else value
    if raw is None:
        return "unknown"
    s = str(raw).strip().lower()

    # Possibili varianti viste in dataset/API wrappers.
    if s in {"suitable", "suitability suitable", "yes", "y", "true", "1"}:
        return "suitable"
    if "suit" in s and "marg" not in s and "not" not in s:
        return "suitable"
    if s in {"marginal", "marginally suitable", "2"} or "marg" in s:
        return "marginal"
    if "unknown" in s or s in {"u", "0", "none", "null"}:
        return "unknown"
    return "unknown"


def normalize_major_importance(value: Any) -> str:
    """
    Output app: yes / no / unknown
    """
    raw = text_value(value) if isinstance(value, dict) else value
    if raw is None:
        return "unknown"
    if isinstance(raw, bool):
        return "yes" if raw else "no"

    s = str(raw).strip().lower()
    if s in {"yes", "y", "true", "1", "major", "major importance", "important"}:
        return "yes"
    if s in {"no", "n", "false", "0", "not major", "not important"}:
        return "no"
    if "major" in s or "important" in s:
        return "yes"
    if "unknown" in s:
        return "unknown"
    return "unknown"


def normalize_seasonality(value: Any) -> str:
    """
    Output app: resident / breeding / non-breeding / passage / unknown
    """
    raw = text_value(value) if isinstance(value, dict) else value
    if raw is None:
        return "unknown"

    s = str(raw).strip().lower()
    s = s.replace("_", "-").replace(" ", "-")

    if s in {"resident", "residential", "all-year", "year-round", "yearround", "permanent"}:
        return "resident"
    if s in {"breeding", "reproductive", "nesting"} or "breed" in s or "nest" in s:
        return "breeding"
    if s in {"non-breeding", "nonbreeding", "wintering", "winter"} or "non-breed" in s or "winter" in s:
        return "non-breeding"
    if s in {"passage", "migratory", "migration", "transient"} or "passage" in s or "migrat" in s:
        return "passage"
    if "unknown" in s:
        return "unknown"
    return "unknown"


def first_present(d: Dict[str, Any], keys: List[str]) -> Any:
    for k in keys:
        if k in d and d.get(k) is not None:
            return d.get(k)
    return None



def extract_iucn_habitats_only(assessment: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Estrae SOLO assessment['habitats'] IUCN.
    Output normalizzato per app:
    - habitat_code
    - habitat_name_it
    - habitat_suitability: suitable / marginal / unknown
    - major_importance: yes / no / unknown
    - seasonality: resident / breeding / non-breeding / passage / unknown
    """
    if not isinstance(assessment, dict):
        return []

    habitats = assessment.get("habitats")
    if not isinstance(habitats, list):
        return []

    out: List[Dict[str, Any]] = []
    seen = set()

    for item in habitats:
        if isinstance(item, dict):
            code = normalize_code(
                first_present(item, [
                    "code",
                    "habitat_code",
                    "habitatCode",
                    "id",
                ])
            )

            name_en = (
                text_value(item.get("description"))
                or text_value(item.get("name"))
                or text_value(item.get("habitat"))
                or text_value(item.get("label"))
            )

            suitability_raw = first_present(item, [
                "suitability",
                "suitable",
                "habitat_suitability",
            ])
            major_raw = first_present(item, [
                "majorimportance",
                "major_importance",
                "majorImportance",
                "major",
            ])
            season_raw = first_present(item, [
                "season",
                "seasonality",
                "seasonal",
            ])

            normalized = {
                "habitat_code": code,
                "habitat_name_it": IUCN_HABITAT_IT.get(code or ""),
                "habitat_name_en": name_en,
                "habitat_suitability": normalize_suitability(suitability_raw),
                "major_importance": normalize_major_importance(major_raw),
                "seasonality": normalize_seasonality(season_raw),
                "source": "IUCN Red List assessment.habitats",
                "raw": item,
            }

        elif isinstance(item, str):
            code = normalize_code(item)
            normalized = {
                "habitat_code": code,
                "habitat_name_it": IUCN_HABITAT_IT.get(code or ""),
                "habitat_name_en": None,
                "habitat_suitability": "unknown",
                "major_importance": "unknown",
                "seasonality": "unknown",
                "source": "IUCN Red List assessment.habitats",
                "raw": item,
            }
        else:
            continue

        # Deduplica habitat identici per lo stesso assessment, mantenendo record distinti
        # se cambia suitability/importance/seasonality.
        key = (
            normalized["habitat_code"],
            normalized["habitat_suitability"],
            normalized["major_importance"],
            normalized["seasonality"],
        )
        if key in seen:
            continue
        seen.add(key)

        out.append(normalized)

    return out

def extract_iucn_systems_only(assessment: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not isinstance(assessment, dict):
        return []
    systems = assessment.get("systems")
    if not isinstance(systems, list):
        return []

    out = []
    for s in systems:
        if isinstance(s, dict):
            out.append({
                "code": s.get("code") or s.get("id"),
                "name": text_value(s.get("description")) or text_value(s.get("name")) or text_value(s.get("system")),
                "source": "IUCN Red List assessment.systems",
                "raw": s,
            })
        else:
            out.append({
                "code": None,
                "name": str(s),
                "source": "IUCN Red List assessment.systems",
                "raw": s,
            })
    return out


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
    if not isinstance(assessment, dict):
        return []
    out: List[Dict[str, Any]] = []
    for path, value in walk(assessment):
        keypath = ".".join(path).lower()
        if any(t in keypath for t in terms):
            if value is None or isinstance(value, (str, int, float, bool)):
                out.append({"path": ".".join(path), "value": value})
    return out


def extract_elevation_depth_iucn_only(assessment: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Estrae solo campi presenti nell'assessment IUCN.
    Nessuna inferenza da habitat, descrizioni app o testo esterno.
    """
    if not isinstance(assessment, dict):
        return {
            "elevation_lower_m": None,
            "elevation_upper_m": None,
            "depth_upper_m": None,
            "depth_lower_m": None,
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
    ])
    elevation_upper = find_number_by_key(assessment, [
        "upper_elevation_limit",
        "elevation_upper",
        "elevation_max",
        "max_elevation",
        "maximum_elevation",
        "altitude_max",
        "upper_altitude_limit",
    ])

    # In IUCN spesso "upper depth" = limite meno profondo, "lower depth" = limite più profondo.
    depth_upper = find_number_by_key(assessment, [
        "upper_depth_limit",
        "depth_upper",
        "depth_min",
        "min_depth",
        "minimum_depth",
    ])
    depth_lower = find_number_by_key(assessment, [
        "lower_depth_limit",
        "depth_lower",
        "depth_max",
        "max_depth",
        "maximum_depth",
    ])

    return {
        "elevation_lower_m": elevation_lower,
        "elevation_upper_m": elevation_upper,
        "depth_upper_m": depth_upper,
        "depth_lower_m": depth_lower,
        "raw_elevation_values": raw_values_by_terms(assessment, ["elevation", "altitude", "altitudinal"]),
        "raw_depth_values": raw_values_by_terms(assessment, ["depth", "bathymetric"]),
    }


def extract_redlist_meta(assessment: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not isinstance(assessment, dict):
        return {}

    cat = assessment.get("red_list_category")
    if isinstance(cat, dict):
        red_list_category = cat.get("code") or text_value(cat.get("description")) or cat.get("name")
    else:
        red_list_category = cat

    citation = assessment.get("citation")
    assessment_url = None
    if isinstance(citation, dict):
        assessment_url = citation.get("url")

    return {
        "red_list_category": red_list_category,
        "year_published": assessment.get("year_published") or assessment.get("published_year"),
        "assessment_url": assessment_url or assessment.get("url"),
    }


def make_record(animal: Dict[str, Any], assessment: Optional[Dict[str, Any]], meta: Dict[str, Any]) -> Dict[str, Any]:
    habitats = extract_iucn_habitats_only(assessment)
    systems = extract_iucn_systems_only(assessment)
    elev_depth = extract_elevation_depth_iucn_only(assessment)
    red = extract_redlist_meta(assessment)

    return {
        # Questi campi arrivano da animals-data.js SOLO per collegare l'output alla specie.
        "animal_id": animal.get("id"),
        "animal_no": animal.get("no"),
        "scientific_name": animal.get("sci"),
        "common_name_it": animal.get("com"),
        "common_name_en": animal.get("com_en"),

        # Questi arrivano da IUCN.
        "source_of_habitat_data": "IUCN_ONLY",
        "iucn_assessment_id": meta.get("assessment_id"),
        "iucn_assessment_source": meta.get("assessment_source"),
        "iucn_lookup_status": meta.get("status"),
        "iucn_red_list_category": red.get("red_list_category"),
        "iucn_year_published": red.get("year_published"),
        "iucn_assessment_url": red.get("assessment_url"),
        "iucn_systems": systems,
        "iucn_habitats": habitats,
        "iucn_habitat_codes": [h["habitat_code"] for h in habitats if h.get("habitat_code")],
        "iucn_habitat_names_it": [h["habitat_name_it"] for h in habitats if h.get("habitat_name_it")],
        "iucn_habitat_names_en": [h["habitat_name_en"] for h in habitats if h.get("habitat_name_en")],
        **elev_depth,
    }


def write_outputs(records: List[Dict[str, Any]], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    json_path = out_dir / "iucn_habitats_ONLY_IUCN.json"
    csv_path = out_dir / "iucn_habitats_ONLY_IUCN_flat.csv"
    js_path = out_dir / "iucn_habitats_ONLY_IUCN.js"
    flat_js_path = out_dir / "iucn_habitat_rows_ONLY_IUCN.js"
    summary_path = out_dir / "summary_ONLY_IUCN.json"

    # JSON specie-centrico: ogni animale contiene array iucn_habitats.
    json_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")

    keyed = {str(r["animal_id"]): r for r in records if r.get("animal_id") is not None}
    js_path.write_text(
        "export const IUCN_HABITATS_ONLY_IUCN = "
        + json.dumps(keyed, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    # CSV flat richiesto: una riga = un animale + un habitat IUCN.
    flat_rows: List[Dict[str, Any]] = []
    for r in records:
        habitats = r.get("iucn_habitats") or []
        if not habitats:
            flat_rows.append({
                "animal_id": r.get("animal_id"),
                "animal_no": r.get("animal_no"),
                "scientific_name": r.get("scientific_name"),
                "common_name_it": r.get("common_name_it"),
                "common_name_en": r.get("common_name_en"),
                "iucn_assessment_id": r.get("iucn_assessment_id"),
                "iucn_lookup_status": r.get("iucn_lookup_status"),
                "habitat_code": "",
                "habitat_name_it": "",
                "habitat_suitability": "unknown",
                "major_importance": "unknown",
                "seasonality": "unknown",
                "elevation_lower_m": r.get("elevation_lower_m"),
                "elevation_upper_m": r.get("elevation_upper_m"),
                "depth_upper_m": r.get("depth_upper_m"),
                "depth_lower_m": r.get("depth_lower_m"),
            })
            continue

        for h in habitats:
            flat_rows.append({
                "animal_id": r.get("animal_id"),
                "animal_no": r.get("animal_no"),
                "scientific_name": r.get("scientific_name"),
                "common_name_it": r.get("common_name_it"),
                "common_name_en": r.get("common_name_en"),
                "iucn_assessment_id": r.get("iucn_assessment_id"),
                "iucn_lookup_status": r.get("iucn_lookup_status"),
                "habitat_code": h.get("habitat_code"),
                "habitat_name_it": h.get("habitat_name_it"),
                "habitat_suitability": h.get("habitat_suitability") or "unknown",
                "major_importance": h.get("major_importance") or "unknown",
                "seasonality": h.get("seasonality") or "unknown",
                "elevation_lower_m": r.get("elevation_lower_m"),
                "elevation_upper_m": r.get("elevation_upper_m"),
                "depth_upper_m": r.get("depth_upper_m"),
                "depth_lower_m": r.get("depth_lower_m"),
            })

    fields = [
        "animal_id",
        "animal_no",
        "scientific_name",
        "common_name_it",
        "common_name_en",
        "iucn_assessment_id",
        "iucn_lookup_status",
        "habitat_code",
        "habitat_name_it",
        "habitat_suitability",
        "major_importance",
        "seasonality",
        "elevation_lower_m",
        "elevation_upper_m",
        "depth_upper_m",
        "depth_lower_m",
    ]

    with csv_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for row in flat_rows:
            w.writerow(row)

    flat_js_path.write_text(
        "export const IUCN_HABITAT_ROWS_ONLY_IUCN = "
        + json.dumps(flat_rows, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )

    summary = {
        "source_of_habitat_data": "IUCN_ONLY",
        "n_records": len(records),
        "n_flat_habitat_rows": len(flat_rows),
        "ok": sum(1 for r in records if r.get("iucn_lookup_status") == "ok"),
        "with_iucn_habitats": sum(1 for r in records if r.get("iucn_habitat_codes")),
        "with_iucn_systems": sum(1 for r in records if r.get("iucn_systems")),
        "with_iucn_elevation": sum(1 for r in records if r.get("elevation_lower_m") is not None or r.get("elevation_upper_m") is not None),
        "with_iucn_depth": sum(1 for r in records if r.get("depth_upper_m") is not None or r.get("depth_lower_m") is not None),
        "failed_or_not_found": sum(1 for r in records if r.get("iucn_lookup_status") != "ok"),
        "normalized_habitat_fields": {
            "habitat_suitability": ["suitable", "marginal", "unknown"],
            "major_importance": ["yes", "no", "unknown"],
            "seasonality": ["resident", "breeding", "non-breeding", "passage", "unknown"],
        },
        "outputs": {
            "species_json": str(json_path),
            "flat_csv": str(csv_path),
            "species_js": str(js_path),
            "flat_js": str(flat_js_path),
            "summary": str(summary_path),
        },
        "important_note": "animals-data.js is used only for animal identity and optional existing IUCN assessment_id, never for habitat inference.",
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

def main() -> int:
    p = argparse.ArgumentParser(description="Estrae habitat/altitudine/profondità SOLO da IUCN Red List API v4.")
    p.add_argument("--input", required=True, type=Path, help="Path a animals-data.js")
    p.add_argument("--out-dir", default=Path("./iucn_enrichment_only_iucn"), type=Path)
    p.add_argument("--token", default=os.environ.get("IUCN_REDLIST_KEY"), help="API key IUCN, oppure env IUCN_REDLIST_KEY")
    p.add_argument("--scope", default="1", help="Scope preferito assessment. 1=Global. Usa '' per disattivare.")
    p.add_argument("--delay", type=float, default=2.0, help="Pausa tra chiamate API.")
    p.add_argument("--max", type=int, default=None, help="Processa solo i primi N animali.")
    p.add_argument("--refresh", action="store_true", help="Ignora cache e riscarica.")
    p.add_argument("--verbose", action="store_true")
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
    partial = args.out_dir / "partial_ONLY_IUCN.jsonl"

    print(f"Animali da processare: {len(animals)}", file=sys.stderr)
    print("Modalità: IUCN_ONLY. Gli habitat del file locale vengono ignorati.", file=sys.stderr)

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
                    "source_of_habitat_data": "IUCN_ONLY",
                    "iucn_lookup_status": "error",
                    "error": repr(e),
                }
                print(f"  ERRORE: {e}", file=sys.stderr)

            records.append(rec)
            pf.write(json.dumps(rec, ensure_ascii=False) + "\n")
            pf.flush()

    write_outputs(records, args.out_dir)

    print("Fatto.", file=sys.stderr)
    print(f"JSON: {args.out_dir / 'iucn_habitats_ONLY_IUCN.json'}", file=sys.stderr)
    print(f"CSV:  {args.out_dir / 'iucn_habitats_ONLY_IUCN.csv'}", file=sys.stderr)
    print(f"JS:   {args.out_dir / 'iucn_habitats_ONLY_IUCN.js'}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
