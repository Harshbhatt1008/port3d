"""Extract the owner-authorized CV and redact its public PDF contact number."""
import re
import sys
from pathlib import Path
from pypdf import PdfReader
import pymupdf as fitz

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
text = "\n".join(page.extract_text() for page in PdfReader(source).pages)
phone_pattern = re.compile(r"\+?\d[\d ()-]{8,}\d")
phones = phone_pattern.findall(text[:500])
public = text
for phone in phones:
    public = public.replace(phone, "")
public = public.replace("\x7f", "- ").replace("\ufffd", " · ")
public = re.sub(r"·\s*·", "·", public)
public = "# CV | Harsh Bhatt\n\nSource: owner-supplied Harsh-Bhatt-CV (3).pdf. Phone omitted from the public source and download.\n\n" + public
(root / "CV.md").write_text(public, encoding="utf-8")
document = fitz.open(source)
redactions = 0
for page in document:
    for phone in phones:
        for area in page.search_for(phone):
            page.add_redact_annot(area, fill=(1, 1, 1))
            redactions += 1
    page.apply_redactions()
document.save(root / "public" / "Harsh-Bhatt-CV.pdf", garbage=4, deflate=True)
assert all(phone not in "".join(page.get_text() for page in document) for phone in phones)
print(f"CV.md extracted; {redactions} phone field(s) removed from the public PDF.")
