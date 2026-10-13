#!/usr/bin/env python3
"""Check local references and, optionally, external links in this skill."""

from __future__ import annotations

import argparse
import concurrent.futures
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parents[1]
MARKDOWN_LINK = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
URL = re.compile(r"https?://[^\s)|>]+")
TRAILING_PUNCTUATION = ".,;:!?`\"'"
USER_AGENT = "open-source-ui-resources-catalog-check/1.0"


def markdown_files() -> list[Path]:
    return [SKILL_DIR / "SKILL.md", *sorted((SKILL_DIR / "references").glob("*.md"))]


def check_local_references(files: list[Path]) -> list[str]:
    errors: list[str] = []
    for source in files:
        text = source.read_text(encoding="utf-8")
        for target in MARKDOWN_LINK.findall(text):
            target = target.strip()
            if target.startswith(("https://", "http://", "mailto:")) or target.startswith("#"):
                continue
            path = target.split("#", 1)[0].split("?", 1)[0]
            if not path:
                continue
            resolved = (source.parent / path).resolve()
            if not resolved.is_file():
                errors.append(f"Missing local reference: {source.relative_to(SKILL_DIR)} -> {target}")
    return errors


def catalog_urls(files: list[Path]) -> list[str]:
    found: set[str] = set()
    for source in files:
        text = source.read_text(encoding="utf-8")
        text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
        text = re.sub(r"`[^`]*`", "", text)
        for raw in URL.findall(text):
            found.add(raw.rstrip(TRAILING_PUNCTUATION))
        for target in MARKDOWN_LINK.findall(text):
            target = target.strip()
            if target.startswith(("https://", "http://")):
                found.add(target.rstrip(TRAILING_PUNCTUATION))
    return sorted(found)


def validate_catalog(files: list[Path]) -> list[str]:
    errors: list[str] = []
    skill_md = SKILL_DIR / "SKILL.md"
    if not skill_md.is_file():
        return ["Missing SKILL.md"]

    text = skill_md.read_text(encoding="utf-8")
    frontmatter = re.match(r"\A---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not frontmatter:
        errors.append("SKILL.md is missing YAML frontmatter")
    else:
        metadata = frontmatter.group(1)
        name = re.search(r"^name:\s*([a-z0-9-]+)\s*$", metadata, re.MULTILINE)
        description = re.search(r"^description:\s*\S", metadata, re.MULTILINE)
        if not name:
            errors.append("SKILL.md frontmatter is missing a valid name")
        elif name.group(1) != SKILL_DIR.name:
            errors.append(f"Skill name '{name.group(1)}' does not match folder '{SKILL_DIR.name}'")
        if not description:
            errors.append("SKILL.md frontmatter is missing a description")

    expected_refs = [SKILL_DIR / "references" / "ui-libraries.md", SKILL_DIR / "references" / "ui-websites.md"]
    for ref in expected_refs:
        if not ref.is_file():
            errors.append(f"Missing expected catalog: {ref.relative_to(SKILL_DIR)}")

    for source in files:
        if re.search(r"\b(?:TODO|TBD|PLACEHOLDER)\b|<skill-name>|<description>", source.read_text(encoding="utf-8"), re.IGNORECASE):
            errors.append(f"Unfinished placeholder found in {source.relative_to(SKILL_DIR)}")

    return errors


def request_status(url: str, timeout: float) -> tuple[str, str]:
    headers = {"User-Agent": USER_AGENT}
    for method in ("HEAD", "GET"):
        request_headers = dict(headers)
        if method == "GET":
            request_headers["Range"] = "bytes=0-0"
        request = urllib.request.Request(url, headers=request_headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return "ok", str(response.status)
        except urllib.error.HTTPError as error:
            if method == "HEAD" and error.code in (405, 501):
                continue
            if error.code in (401, 403, 429):
                return "unverified", f"HTTP {error.code} ({method} blocked)"
            if error.code in (404, 410):
                return "broken", f"HTTP {error.code}"
            if 500 <= error.code <= 599:
                return "unverified", f"HTTP {error.code}"
            return "ok", f"HTTP {error.code}"
        except (TimeoutError, urllib.error.URLError, OSError) as error:
            if method == "HEAD":
                continue
            reason = getattr(error, "reason", error)
            if isinstance(reason, TimeoutError):
                return "unverified", "timeout"
            return "unverified", "network error"
    return "unverified", "no response"


def check_external_links(urls: list[str], timeout: float, workers: int) -> tuple[list[str], int, int]:
    broken: list[str] = []
    unverified = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(request_status, url, timeout): url for url in urls}
        for future in concurrent.futures.as_completed(futures):
            url = futures[future]
            status, detail = future.result()
            if status == "broken":
                broken.append(f"{detail}: {url}")
            elif status == "unverified":
                unverified += 1
                print(f"UNVERIFIED {detail}: {url}")
    return broken, unverified, len(urls)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check-links", action="store_true", help="check external links; requires network access")
    parser.add_argument("--timeout", type=float, default=8.0, help="per-request timeout in seconds (default: 8)")
    parser.add_argument("--workers", type=int, default=8, help="parallel requests for external checks (default: 8)")
    args = parser.parse_args()
    if args.timeout <= 0 or args.workers < 1:
        parser.error("--timeout must be positive and --workers must be at least 1")

    files = markdown_files()
    errors = validate_catalog(files) + check_local_references(files)
    if errors:
        for error in errors:
            print(f"ERROR {error}")
        return 1

    print(f"Local catalog checks passed ({len(files)} Markdown files).")
    if args.check_links:
        urls = catalog_urls(files)
        broken, unverified, total = check_external_links(urls, args.timeout, args.workers)
        for item in broken:
            print(f"BROKEN {item}")
        print(f"External links: {total} checked, {len(broken)} broken, {unverified} unverified.")
        if broken:
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
