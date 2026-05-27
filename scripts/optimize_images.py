#!/usr/bin/env python3
"""Optimize app images without changing their filenames.

Default behavior is a dry run over ./public. Add --apply to rewrite files.
Requires Pillow:
    python3 -m pip install pillow
"""

from __future__ import annotations

import argparse
import shutil
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

try:
    from PIL import Image, ImageOps, UnidentifiedImageError
except ImportError:
    print(
        "Pillow non e' installato. Installa la dipendenza con:\n"
        "  python3 -m pip install pillow",
        file=sys.stderr,
    )
    raise SystemExit(1)


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
EXCLUDED_DIRS = {".git", "node_modules", "build", "dist", ".next"}


@dataclass
class ImageResult:
    path: Path
    before: int
    after: int
    changed: bool
    reason: str

    @property
    def saved(self) -> int:
        return max(0, self.before - self.after)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Riduce il peso delle immagini dell'app preservando nomi e formati."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        default=["public"],
        help="Cartelle o file da ottimizzare. Default: public",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Applica le modifiche. Senza questo flag fa solo una simulazione.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=82,
        help="Qualita' per JPEG/WebP, da 1 a 95. Default: 82",
    )
    parser.add_argument(
        "--max-dimension",
        type=int,
        default=1600,
        help=(
            "Lato massimo in pixel. Le immagini piu' grandi vengono ridimensionate. "
            "Usa 0 per non ridimensionare. Default: 1600"
        ),
    )
    parser.add_argument(
        "--min-saving-percent",
        type=float,
        default=2.0,
        help="Sostituisce il file solo se risparmia almeno questa percentuale. Default: 2",
    )
    parser.add_argument(
        "--backup",
        action="store_true",
        help="Prima di applicare crea una copia in .image-optimizer-backup/.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Mostra anche le immagini saltate.",
    )
    return parser.parse_args()


def iter_images(paths: list[str]) -> list[Path]:
    images: list[Path] = []
    for raw_path in paths:
        path = Path(raw_path)
        if not path.exists():
            print(f"Percorso non trovato, salto: {path}", file=sys.stderr)
            continue

        if path.is_file():
            if path.suffix.lower() in SUPPORTED_EXTENSIONS:
                images.append(path)
            continue

        for child in path.rglob("*"):
            if any(part in EXCLUDED_DIRS for part in child.parts):
                continue
            if child.is_file() and child.suffix.lower() in SUPPORTED_EXTENSIONS:
                images.append(child)

    return sorted(set(images))


def resize_if_needed(image: Image.Image, max_dimension: int) -> Image.Image:
    if max_dimension <= 0:
        return image.copy()

    width, height = image.size
    longest_side = max(width, height)
    if longest_side <= max_dimension:
        return image.copy()

    scale = max_dimension / longest_side
    new_size = (round(width * scale), round(height * scale))
    return image.resize(new_size, Image.Resampling.LANCZOS)


def prepare_image(image: Image.Image, suffix: str, max_dimension: int) -> Image.Image:
    image = ImageOps.exif_transpose(image)
    image = resize_if_needed(image, max_dimension)

    if suffix in {".jpg", ".jpeg"} and image.mode not in {"RGB", "L"}:
        background = Image.new("RGB", image.size, (255, 255, 255))
        if "A" in image.getbands():
            background.paste(image, mask=image.getchannel("A"))
            return background
        return image.convert("RGB")

    return image


def save_optimized(image: Image.Image, source: Path, destination: Path, quality: int) -> None:
    suffix = source.suffix.lower()
    destination.parent.mkdir(parents=True, exist_ok=True)

    if suffix in {".jpg", ".jpeg"}:
        image.save(
            destination,
            format="JPEG",
            quality=quality,
            optimize=True,
            progressive=True,
        )
        return

    if suffix == ".webp":
        image.save(
            destination,
            format="WEBP",
            quality=quality,
            method=6,
        )
        return

    if suffix == ".png":
        image.save(
            destination,
            format="PNG",
            optimize=True,
            compress_level=9,
        )
        return

    raise ValueError(f"Formato non supportato: {source}")


def optimization_candidate(path: Path, args: argparse.Namespace) -> ImageResult:
    before = path.stat().st_size

    try:
        with Image.open(path) as image:
            if getattr(image, "is_animated", False):
                return ImageResult(path, before, before, False, "animata, saltata")

            prepared = prepare_image(image, path.suffix.lower(), args.max_dimension)

            with tempfile.NamedTemporaryFile(suffix=path.suffix, delete=False) as tmp:
                tmp_path = Path(tmp.name)

            try:
                save_optimized(prepared, path, tmp_path, args.quality)
                after = tmp_path.stat().st_size
                min_saved_bytes = before * (args.min_saving_percent / 100)

                if after >= before or before - after < min_saved_bytes:
                    tmp_path.unlink(missing_ok=True)
                    return ImageResult(path, before, before, False, "risparmio troppo basso")

                if args.apply:
                    if args.backup:
                        backup_path = Path(".image-optimizer-backup") / path
                        backup_path.parent.mkdir(parents=True, exist_ok=True)
                        if not backup_path.exists():
                            shutil.copy2(path, backup_path)

                    shutil.copystat(path, tmp_path)
                    shutil.move(str(tmp_path), path)
                    return ImageResult(path, before, after, True, "ottimizzata")

                tmp_path.unlink(missing_ok=True)
                return ImageResult(path, before, after, True, "ottimizzabile")
            finally:
                tmp_path.unlink(missing_ok=True)
    except (OSError, UnidentifiedImageError, ValueError) as error:
        return ImageResult(path, before, before, False, f"errore: {error}")


def human_size(size: int) -> str:
    value = float(size)
    for unit in ("B", "KB", "MB", "GB"):
        if value < 1024 or unit == "GB":
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{value:.1f} GB"


def main() -> int:
    args = parse_args()

    if not 1 <= args.quality <= 95:
        print("--quality deve essere tra 1 e 95.", file=sys.stderr)
        return 2

    images = iter_images(args.paths)
    if not images:
        print("Nessuna immagine trovata.")
        return 0

    mode = "APPLICO" if args.apply else "SIMULAZIONE"
    print(f"{mode}: trovate {len(images)} immagini.")

    results = [optimization_candidate(path, args) for path in images]
    changed = [result for result in results if result.changed]
    before_total = sum(result.before for result in results)
    after_total = sum(result.after for result in results)
    saved_total = before_total - after_total

    for result in results:
        if result.changed or args.verbose:
            prefix = "OK" if result.changed else "--"
            print(
                f"{prefix} {result.path} | "
                f"{human_size(result.before)} -> {human_size(result.after)} | "
                f"{result.reason}"
            )

    print()
    print(f"Immagini ottimizzabili/ottimizzate: {len(changed)}")
    print(f"Peso prima: {human_size(before_total)}")
    print(f"Peso dopo:  {human_size(after_total)}")
    print(f"Risparmio:  {human_size(saved_total)}")

    if not args.apply:
        print()
        print("Per applicare davvero le modifiche, rilancia aggiungendo --apply.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
