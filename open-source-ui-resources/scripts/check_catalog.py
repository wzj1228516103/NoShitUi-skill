#!/usr/bin/env python3
"""Check local references and, optionally, external links in this skill."""

from __future__ import annotations

import argparse
import concurrent.futures
import html
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


SKILL_DIR = Path(__file__).resolve().parents[1]
MARKDOWN_LINK = re.compile(
    r'!?\[[^\]]*\]\(\s*(<[^>\n]+>|(?:\\.|[^()\s\\]|\([^()\n]*\))+)'
    r'''(?:[ \t]+(?:"[^"\n]*"|'[^'\n]*'|\([^()\n]*\)))?\s*\)'''
)
HTML_TAG = re.compile(r"<[a-zA-Z][^>]*>")
HTML_LINK_ATTRIBUTE = re.compile(r'''\b(?:src|href)\s*=\s*(["'])(.*?)\1''', re.IGNORECASE)
URL = re.compile(r"https?://[^\s)|>]+")
TRAILING_PUNCTUATION = ".,;:!?`\"'"
USER_AGENT = "open-source-ui-resources-catalog-check/1.0"


def repository_root() -> Path | None:
    """Detect the bundled repository, including a deleted root entrypoint, but allow standalone skills."""
    parent = SKILL_DIR.parent
    if SKILL_DIR.name != "open-source-ui-resources":
        return None
    if ((parent / "SKILL.md").is_file() or (parent / ".git").exists()
            or ((parent / "README.md").is_file() and (parent / "agents/openai.yaml").is_file())):
        return parent
    return None


def skill_entrypoints() -> list[Path]:
    entrypoints = [SKILL_DIR / "SKILL.md"]
    if root := repository_root():
        entrypoints.append(root / "SKILL.md")
    return entrypoints


def markdown_files(include_readmes: bool = True) -> list[Path]:
    files = [*skill_entrypoints(), *sorted((SKILL_DIR / "references").rglob("*.md"))]
    if include_readmes:
        root = repository_root() or SKILL_DIR
        files.extend(sorted(root.glob("README*.md")))
    return files


def display_path(source: Path) -> str:
    root = repository_root() or SKILL_DIR
    return str(source.relative_to(root))


def link_targets(text: str) -> list[str]:
    targets = [re.sub(r"\\([\\`*{}\[\]()#+\-.!_<>])", r"\1", target.strip("<>"))
               for target in MARKDOWN_LINK.findall(text)]
    for tag in HTML_TAG.findall(text):
        targets.extend(html.unescape(value) for _, value in HTML_LINK_ATTRIBUTE.findall(tag))
    return targets


def check_local_references(files: list[Path]) -> list[str]:
    errors: list[str] = []
    for source in files:
        if not source.is_file():
            continue  # validate_catalog reports missing files.
        text = re.sub(r"```.*?```", "", source.read_text(encoding="utf-8"), flags=re.DOTALL)
        for target in link_targets(text):
            parsed = urllib.parse.urlsplit(target)
            if parsed.scheme or parsed.netloc:
                continue
            path = urllib.parse.unquote(parsed.path)
            if not path:
                continue
            resolved = (source.parent / path).resolve()
            if not resolved.exists():
                errors.append(f"Missing local reference: {display_path(source)} -> {target}")
    return errors


def catalog_urls(files: list[Path]) -> list[str]:
    found: set[str] = set()
    for source in files:
        if not source.is_file():
            continue
        text = source.read_text(encoding="utf-8")
        text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
        text = re.sub(r"`[^`]*`", "", text)
        for target in link_targets(text):
            if target.startswith(("https://", "http://")):
                found.add(target)
        for raw in URL.findall(HTML_TAG.sub("", MARKDOWN_LINK.sub("", text))):
            found.add(raw.rstrip(TRAILING_PUNCTUATION))
    return sorted(found)


def validate_catalog(files: list[Path]) -> list[str]:
    errors: list[str] = []
    for skill_md in skill_entrypoints():
        label = display_path(skill_md)
        if not skill_md.is_file():
            errors.append(f"Missing {label}")
            continue

        text = skill_md.read_text(encoding="utf-8")
        frontmatter = re.match(r"\A---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
        if not frontmatter:
            errors.append(f"{label} is missing YAML frontmatter")
        else:
            metadata = frontmatter.group(1)
            name = re.search(r"^name:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$", metadata, re.MULTILINE)
            description = re.search(r"^description:\s*\S", metadata, re.MULTILINE)
            if not name:
                errors.append(f"{label} frontmatter is missing a valid name")
            elif skill_md.parent == SKILL_DIR and name.group(1) != SKILL_DIR.name:
                errors.append(f"Skill name '{name.group(1)}' does not match folder '{SKILL_DIR.name}'")
            if not description:
                errors.append(f"{label} frontmatter is missing a description")

    expected_refs = [SKILL_DIR / "references" / "ui-libraries.md", SKILL_DIR / "references" / "ui-websites.md"]
    for ref in expected_refs:
        if not ref.is_file():
            errors.append(f"Missing expected catalog: {display_path(ref)}")

    for source in files:
        if not source.is_file():
            continue
        if re.search(r"\b(?:TODO|TBD|PLACEHOLDER)\b|<skill-name>|<description>", source.read_text(encoding="utf-8"), re.IGNORECASE):
            errors.append(f"Unfinished placeholder found in {display_path(source)}")

    return errors


def classify_http_status(code: int) -> str:
    if 200 <= code < 400:
        return "ok"
    if code in (404, 410):
        return "broken"
    return "unverified"


def request_status(url: str, timeout: float) -> tuple[str, str]:
    headers = {"User-Agent": USER_AGENT}
    for method in ("HEAD", "GET"):
        request_headers = dict(headers)
        if method == "GET":
            request_headers["Range"] = "bytes=0-0"
        request = urllib.request.Request(url, headers=request_headers, method=method)
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return classify_http_status(response.status), str(response.status)
        except urllib.error.HTTPError as error:
            if method == "HEAD" and error.code in (405, 501):
                continue
            if error.code in (401, 403, 429):
                return "unverified", f"HTTP {error.code} ({method} blocked)"
            # HTTPError can also report a redirect loop that urllib could not follow.
            status = "broken" if error.code in (404, 410) else "unverified"
            return status, f"HTTP {error.code}"
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
        # README screenshots and demo URLs need local validation, not repeated catalog reachability checks.
        urls = catalog_urls(markdown_files(include_readmes=False))
        broken, unverified, total = check_external_links(urls, args.timeout, args.workers)
        for item in broken:
            print(f"BROKEN {item}")
        print(f"External links: {total} checked, {len(broken)} broken, {unverified} unverified.")
        if broken:
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
