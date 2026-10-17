"""Offline regression tests for catalog scope, local links, and HTTP outcomes."""

from __future__ import annotations

import contextlib
import io
import tempfile
import unittest
import urllib.error
from pathlib import Path
from unittest import mock

import check_catalog as checker


class LocalCatalogTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.repository = Path(self.temporary.name)
        self.skill = self.repository / "open-source-ui-resources"
        (self.skill / "references").mkdir(parents=True)
        self.write("SKILL.md", "---\nname: open-source-ui-resources\ndescription: A useful catalog.\n---\n")
        self.write("references/ui-libraries.md", "# Libraries\n")
        self.write("references/ui-websites.md", "# Websites\n")
        skill_dir_patch = mock.patch.object(checker, "SKILL_DIR", self.skill)
        skill_dir_patch.start()
        self.addCleanup(skill_dir_patch.stop)

    def write(self, relative: str, text: str) -> Path:
        path = self.skill / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path

    def add_repository_entrypoint(self, text: str = "") -> Path:
        path = self.repository / "SKILL.md"
        path.write_text("---\nname: noshit-ui-skill\ndescription: Repository entrypoint.\n---\n" + text,
                        encoding="utf-8")
        return path

    def test_standalone_install_does_not_require_parent_skill(self) -> None:
        files = checker.markdown_files()
        self.assertEqual(len(files), 3)
        self.assertEqual(checker.validate_catalog(files), [])
        self.assertEqual(checker.check_local_references(files), [])

    def test_repository_entrypoint_is_checked_without_matching_checkout_name(self) -> None:
        root = self.add_repository_entrypoint("[Missing](missing.md)\n")
        files = checker.markdown_files()
        self.assertIn(root, files)
        self.assertEqual(checker.validate_catalog(files), [])
        self.assertEqual(checker.check_local_references(files),
                         ["Missing local reference: SKILL.md -> missing.md"])

    def test_repository_entrypoint_frontmatter_is_validated(self) -> None:
        root = self.add_repository_entrypoint()
        root.write_text("# No metadata\n", encoding="utf-8")
        self.assertIn("SKILL.md is missing YAML frontmatter",
                      checker.validate_catalog(checker.markdown_files()))

    def test_missing_skill_reports_failure_instead_of_crashing(self) -> None:
        (self.skill / "SKILL.md").unlink()
        with mock.patch("sys.argv", ["check_catalog.py"]), contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(checker.main(), 1)
        self.assertIn("ERROR Missing SKILL.md", output.getvalue())

    def test_deleted_repository_entrypoint_is_detected_in_git_checkout(self) -> None:
        (self.repository / ".git").mkdir()
        self.assertIn(self.repository / "SKILL.md", checker.markdown_files())
        self.assertIn("Missing SKILL.md", checker.validate_catalog(checker.markdown_files()))

    def test_deleted_repository_entrypoint_is_detected_in_source_archive(self) -> None:
        (self.repository / "README.md").write_text("# Repository\n", encoding="utf-8")
        (self.repository / "agents").mkdir()
        (self.repository / "agents/openai.yaml").write_text("interface: {}\n", encoding="utf-8")
        self.assertIn("Missing SKILL.md", checker.validate_catalog(checker.markdown_files()))

    def test_missing_required_catalog_and_nested_reference_are_checked(self) -> None:
        (self.skill / "references/ui-websites.md").unlink()
        nested = self.write("references/archive/notes.md", "[Broken](missing.md)\n")
        files = checker.markdown_files()
        self.assertIn(nested, files)
        self.assertTrue(any("Missing expected catalog" in error for error in checker.validate_catalog(files)))
        self.assertTrue(any("archive" in error for error in checker.check_local_references(files)))

    def test_relative_targets_allow_titles_angles_escapes_encoding_and_directories(self) -> None:
        self.write("references/a file.md", "# A\n")
        self.write("references/with(parentheses).md", "# B\n")
        source = self.write("references/links.md", """[Encoded](a%20file.md#heading)
[Angle](<a file.md> "A title")
[Title](ui-libraries.md 'Library title')
[Balanced](with(parentheses).md)
[Escaped](with\\(parentheses\\).md)
[Directory](../references/)
[Fragment](#top)
[Query](?view=all)
[External](mailto:team@example.com)
""")
        self.assertEqual(checker.check_local_references([source]), [])

    def test_repository_readmes_check_markdown_images_and_html_assets(self) -> None:
        self.add_repository_entrypoint()
        readme = self.repository / "README.en.md"
        readme.write_text('![Missing](missing.png)\n<img src="missing%20image.png">\n<a href="open-source-ui-resources/">Catalog</a>\n',
                          encoding="utf-8")
        self.assertNotIn(readme, checker.markdown_files(include_readmes=False))
        files = checker.markdown_files()
        self.assertIn(readme, files)
        errors = checker.check_local_references(files)
        self.assertEqual(len(errors), 2)
        self.assertTrue(any("missing%20image.png" in error for error in errors))

    def test_documentation_code_examples_are_not_local_links(self) -> None:
        source = self.write("references/code.md", "```md\n[Example](not-a-real-file.md)\n```\n")
        self.assertEqual(checker.check_local_references([source]), [])

    def test_external_targets_preserve_parentheses_and_ignore_code(self) -> None:
        source = self.write("references/urls.md", """[Docs](https://example.com/api(v2) "Title")
<a href="https://example.com/path?a=1&amp;b=2">Example</a>
Bare https://example.com/plain.
`https://example.com/inline`
```
https://example.com/code
```
""")
        self.assertEqual(checker.catalog_urls([source]), [
            "https://example.com/api(v2)", "https://example.com/path?a=1&b=2", "https://example.com/plain",
        ])


class HttpStatusTests(unittest.TestCase):
    def response(self, status: int) -> mock.MagicMock:
        response = mock.MagicMock()
        response.__enter__.return_value.status = status
        return response

    def http_error(self, status: int) -> urllib.error.HTTPError:
        return urllib.error.HTTPError("https://example.com", status, "Error", {}, None)

    def test_only_success_and_redirect_statuses_are_successful(self) -> None:
        for code in (200, 204, 206, 301, 302, 304, 399):
            with self.subTest(code=code), mock.patch.object(checker.urllib.request, "urlopen", return_value=self.response(code)):
                self.assertEqual(checker.request_status("https://example.com", 1)[0], "ok")

    def test_error_codes_are_never_mistaken_for_success(self) -> None:
        for code, expected in ((302, "unverified"), (307, "unverified"),
                               (400, "unverified"), (401, "unverified"), (402, "unverified"),
                               (403, "unverified"), (404, "broken"), (406, "unverified"),
                               (410, "broken"), (418, "unverified"), (429, "unverified"),
                               (500, "unverified"), (503, "unverified")):
            with self.subTest(code=code), mock.patch.object(checker.urllib.request, "urlopen", side_effect=self.http_error(code)):
                self.assertEqual(checker.request_status("https://example.com", 1)[0], expected)

    def test_unexpected_non_success_response_is_unverified(self) -> None:
        with mock.patch.object(checker.urllib.request, "urlopen", return_value=self.response(400)):
            self.assertEqual(checker.request_status("https://example.com", 1)[0], "unverified")

    def test_unsupported_head_falls_back_to_get(self) -> None:
        for code in (405, 501):
            with self.subTest(code=code), mock.patch.object(checker.urllib.request, "urlopen",
                    side_effect=[self.http_error(code), self.response(206)]) as urlopen:
                self.assertEqual(checker.request_status("https://example.com", 1), ("ok", "206"))
                requests = [call.args[0] for call in urlopen.call_args_list]
                self.assertEqual([request.method for request in requests], ["HEAD", "GET"])
                self.assertEqual(requests[1].get_header("Range"), "bytes=0-0")

    def test_network_failures_are_unverified_after_head_fallback(self) -> None:
        with mock.patch.object(checker.urllib.request, "urlopen", side_effect=urllib.error.URLError("offline")) as urlopen:
            self.assertEqual(checker.request_status("https://example.com", 1), ("unverified", "network error"))
            self.assertEqual(urlopen.call_count, 2)


if __name__ == "__main__":
    unittest.main()
