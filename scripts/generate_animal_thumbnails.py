#!/usr/bin/env python3
"""Generate lightweight WebP thumbnails for animal grid cards."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass
class ThumbnailResult:
    source: Path
    destination: Path
    before: int
    after: int
    changed: bool
    reason: str

    @property
    def saved(self) -> int:
        return max(0, self.before - self.after)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Crea miniature WebP per public/animals.")
    parser.add_argument("--source", default="public/animals", help="Cartella immagini originali.")
    parser.add_argument("--output", default="public/animals/thumbs", help="Cartella miniature.")
    parser.add_argument("--max-dimension", type=int, default=360, help="Lato massimo in pixel.")
    parser.add_argument("--quality", type=int, default=78, help="Qualita' WebP, da 1 a 95.")
    parser.add_argument("--method", type=int, default=0, help="Metodo WebP, 0 veloce, 6 piu' lento.")
    parser.add_argument("--force", action="store_true", help="Rigenera anche miniature gia' presenti.")
    return parser.parse_args()


def iter_sources(source_dir: Path, output_dir: Path) -> list[Path]:
    files: list[Path] = []
    for path in source_dir.iterdir():
        if path.is_dir() or path.resolve().is_relative_to(output_dir.resolve()):
            continue
        if path.suffix.lower() in SUPPORTED_EXTENSIONS:
            files.append(path)
    return sorted(files)


def create_thumbnail(source: Path, destination: Path, max_dimension: int, quality: int, method: int, force: bool) -> ThumbnailResult:
    before = source.stat().st_size
    if destination.exists() and not force and destination.stat().st_mtime >= source.stat().st_mtime:
        return ThumbnailResult(source, destination, before, destination.stat().st_size, False, "gia' aggiornata")

    try:
        with Image.open(source) as image:
            if getattr(image, "is_animated", False):
                return ThumbnailResult(source, destination, before, 0, False, "animata, saltata")

            image = ImageOps.exif_transpose(image)
            image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            if image.mode not in {"RGB", "RGBA"}:
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

            destination.parent.mkdir(parents=True, exist_ok=True)
            image.save(destination, format="WEBP", quality=quality, method=method)
            return ThumbnailResult(source, destination, before, destination.stat().st_size, True, "creata")
    except (OSError, UnidentifiedImageError) as error:
        return ThumbnailResult(source, destination, before, 0, False, f"errore: {error}")


def human_size(value: int) -> str:
    units = ["B", "KB", "MB", "GB"]
    size = float(value)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} GB"


def main() -> int:
    args = parse_args()
    source_dir = Path(args.source)
    output_dir = Path(args.output)

    if not source_dir.exists():
        raise SystemExit(f"Cartella non trovata: {source_dir}")

    results = [
        create_thumbnail(
            source=source,
            destination=output_dir / f"{source.stem}.webp",
            max_dimension=args.max_dimension,
            quality=args.quality,
            method=args.method,
            force=args.force,
        )
        for source in iter_sources(source_dir, output_dir)
    ]

    changed = [result for result in results if result.changed]
    before = sum(result.before for result in results)
    after = sum(result.after for result in results if result.after)
    saved = sum(result.saved for result in changed)

    print(f"Immagini analizzate: {len(results)}")
    print(f"Miniature create/aggiornate: {len(changed)}")
    print(f"Peso originali: {human_size(before)}")
    print(f"Peso miniature: {human_size(after)}")
    print(f"Risparmio sulle create: {human_size(saved)}")

    skipped_errors = [result for result in results if result.reason.startswith("errore")]
    if skipped_errors:
        print("Errori:")
        for result in skipped_errors[:10]:
            print(f"- {result.source}: {result.reason}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
