#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
docs/business/*.md 를 제출 가능한 문서 형식으로 변환한다.

  DOCX  python-docx            (표·제목·강조를 네이티브 요소로)
  PPTX  python-pptx            (IR 전용 — H2 = 슬라이드)
  HWPX  한컴오피스 COM 자동화   (정부 서식 제출용 · DOCX를 열어 HWPX로 저장)

사용법:
  python scripts/export-docs.py            # 전부
  python scripts/export-docs.py --no-hwpx  # 한글 없이 DOCX/PPTX만

출력: docs/business/out/
"""
import os
import re
import sys
import glob

# Windows 콘솔(cp949)은 em dash 같은 문자를 못 찍고 UnicodeEncodeError로 죽는다.
# 진행 메시지 하나 때문에 변환 전체가 중단됐었다.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from pptx import Presentation
from pptx.util import Inches, Pt as PPt
from pptx.dml.color import RGBColor as PRGB

SRC = "docs/business"
OUT = os.path.join(SRC, "out")

INK = RGBColor(0x0D, 0x1B, 0x2A)      # 본문 제목
ACCENT = RGBColor(0x8F, 0x3A, 0x26)   # 강조 (제품 팔레트의 mineral)
MUTED = RGBColor(0x64, 0x74, 0x8B)


# ── 마크다운 파싱 ────────────────────────────────────────────────────────────
def strip_inline(text):
    """굵게/기울임/코드/링크 마크업을 벗기고 순수 텍스트만 남긴다."""
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"\1", text)
    text = text.replace("<br>", " ").replace("&lt;", "<").replace("&gt;", ">")
    return text.strip()


def parse_blocks(md):
    """마크다운을 (종류, 내용) 블록 목록으로 만든다."""
    blocks = []
    lines = md.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()

        if not s:
            i += 1
            continue

        # 표: 헤더줄 + 구분줄(---) 이 이어질 때만
        if s.startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                raw = lines[i].strip().strip("|")
                if not re.match(r"^[\s:|-]+$", raw):
                    rows.append([strip_inline(c) for c in raw.split("|")])
                i += 1
            if rows:
                blocks.append(("table", rows))
            continue

        m = re.match(r"^(#{1,4})\s+(.*)", s)
        if m:
            blocks.append((f"h{len(m.group(1))}", strip_inline(m.group(2))))
            i += 1
            continue

        if s.startswith(">"):
            blocks.append(("quote", strip_inline(s.lstrip("> ").strip())))
            i += 1
            continue

        if re.match(r"^[-*]\s+", s) or re.match(r"^\d+\.\s+", s):
            blocks.append(("bullet", strip_inline(re.sub(r"^([-*]|\d+\.)\s+", "", s))))
            i += 1
            continue

        if re.match(r"^-{3,}$", s):
            i += 1
            continue

        blocks.append(("p", strip_inline(s)))
        i += 1
    return blocks


# ── DOCX ────────────────────────────────────────────────────────────────────
def build_docx(md_path, docx_path, title):
    doc = Document()

    st = doc.styles["Normal"]
    st.font.name = "맑은 고딕"
    st.font.size = Pt(10)
    st._element.rPr.rFonts.set(
        __import__("docx.oxml.ns", fromlist=["qn"]).qn("w:eastAsia"), "맑은 고딕"
    )

    for s in doc.sections:
        s.top_margin = s.bottom_margin = Cm(2.0)
        s.left_margin = s.right_margin = Cm(2.2)

    h = doc.add_heading(title, level=0)
    for r in h.runs:
        r.font.color.rgb = INK

    sub = doc.add_paragraph("GloSource AI · 사실기반 문서 (docs/business/00-FACTBASE.md 근거)")
    sub.runs[0].font.size = Pt(8)
    sub.runs[0].font.color.rgb = MUTED
    doc.add_paragraph()

    with open(md_path, encoding="utf-8") as f:
        blocks = parse_blocks(f.read())

    for kind, content in blocks:
        if kind.startswith("h"):
            lvl = min(int(kind[1]), 4)
            p = doc.add_heading(content, level=lvl)
            for r in p.runs:
                r.font.color.rgb = INK if lvl <= 2 else ACCENT
        elif kind == "table":
            cols = max(len(r) for r in content)
            t = doc.add_table(rows=0, cols=cols)
            t.style = "Light Grid Accent 1"
            t.alignment = WD_TABLE_ALIGNMENT.CENTER
            for ri, row in enumerate(content):
                cells = t.add_row().cells
                for ci in range(cols):
                    txt = row[ci] if ci < len(row) else ""
                    cells[ci].text = txt
                    for p in cells[ci].paragraphs:
                        for r in p.runs:
                            r.font.size = Pt(9)
                            if ri == 0:
                                r.font.bold = True
            doc.add_paragraph()
        elif kind == "bullet":
            doc.add_paragraph(content, style="List Bullet")
        elif kind == "quote":
            p = doc.add_paragraph(content)
            p.paragraph_format.left_indent = Cm(0.6)
            for r in p.runs:
                r.font.italic = True
                r.font.color.rgb = ACCENT
        else:
            doc.add_paragraph(content)

    doc.save(docx_path)
    return docx_path


# ── PPTX (IR 전용) ──────────────────────────────────────────────────────────
def build_pptx(md_path, pptx_path, title):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    with open(md_path, encoding="utf-8") as f:
        blocks = parse_blocks(f.read())

    # 표지
    s = prs.slides.add_slide(prs.slide_layouts[6])
    tb = s.shapes.add_textbox(Inches(1), Inches(2.6), Inches(11.3), Inches(2))
    tf = tb.text_frame
    tf.text = "GloSource AI"
    tf.paragraphs[0].runs[0].font.size = PPt(54)
    tf.paragraphs[0].runs[0].font.bold = True
    tf.paragraphs[0].runs[0].font.color.rgb = PRGB(0x0D, 0x1B, 0x2A)
    p = tf.add_paragraph()
    p.text = "해외 바이어가 한국 공급사를 찾을 때, 그것이 진짜 공장인지 정부 원장으로 대조한다"
    p.runs[0].font.size = PPt(18)
    p.runs[0].font.color.rgb = PRGB(0x8F, 0x3A, 0x26)

    # H2 = 슬라이드
    cur = None
    body = []

    def flush():
        if cur is None:
            return
        sl = prs.slides.add_slide(prs.slide_layouts[6])
        ttl = sl.shapes.add_textbox(Inches(0.7), Inches(0.45), Inches(12), Inches(0.9))
        tf = ttl.text_frame
        tf.text = cur
        tf.paragraphs[0].runs[0].font.size = PPt(30)
        tf.paragraphs[0].runs[0].font.bold = True
        tf.paragraphs[0].runs[0].font.color.rgb = PRGB(0x0D, 0x1B, 0x2A)

        items = [b for b in body if b[0] in ("bullet", "quote", "p")][:8]
        tables = [b for b in body if b[0] == "table"]

        top = Inches(1.6)
        if items:
            bx = sl.shapes.add_textbox(Inches(0.8), top, Inches(11.8), Inches(2.6))
            btf = bx.text_frame
            btf.word_wrap = True
            for i, (k, c) in enumerate(items):
                para = btf.paragraphs[0] if i == 0 else btf.add_paragraph()
                para.text = ("• " if k == "bullet" else "") + c[:150]
                para.runs[0].font.size = PPt(14 if k != "quote" else 13)
                para.runs[0].font.color.rgb = (
                    PRGB(0x8F, 0x3A, 0x26) if k == "quote" else PRGB(0x33, 0x41, 0x55)
                )
                if k == "quote":
                    para.runs[0].font.bold = True
            top = Inches(1.6) + Inches(0.32) * len(items) + Inches(0.25)

        if tables:
            rows = tables[0][1][:7]
            cols = max(len(r) for r in rows)
            h = min(Inches(0.35) * len(rows), Inches(3.4))
            shp = sl.shapes.add_table(len(rows), cols, Inches(0.8), top, Inches(11.8), h)
            tbl = shp.table
            for ri, row in enumerate(rows):
                for ci in range(cols):
                    cell = tbl.cell(ri, ci)
                    cell.text = (row[ci] if ci < len(row) else "")[:60]
                    for p2 in cell.text_frame.paragraphs:
                        for r2 in p2.runs:
                            r2.font.size = PPt(11)
                            r2.font.bold = ri == 0

    for kind, content in blocks:
        if kind == "h1":
            continue
        if kind == "h2":
            flush()
            cur = content
            body = []
        else:
            body.append((kind, content))
    flush()

    prs.save(pptx_path)
    return pptx_path


# ── HWPX (한컴오피스 COM) ───────────────────────────────────────────────────
def md_to_html(md_path, html_path, title):
    """한글이 대화상자 없이 읽어들일 수 있는 중간 HTML. DOCX 가져오기 필터는 모달 창을 띄워
    자동화가 멈추므로 쓰지 않는다."""
    with open(md_path, encoding="utf-8") as f:
        blocks = parse_blocks(f.read())

    def esc(t):
        return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    h = [
        "<!DOCTYPE html><html><head><meta charset='utf-8'>",
        f"<title>{esc(title)}</title>",
        "<style>body{font-family:'맑은 고딕';font-size:10pt;}"
        "h1{font-size:20pt;}h2{font-size:15pt;}h3{font-size:12pt;}"
        "table{border-collapse:collapse;}td,th{border:1px solid #888;padding:4px;font-size:9pt;}"
        "th{background:#eee;}blockquote{color:#8F3A26;font-style:italic;}</style></head><body>",
        f"<h1>{esc(title)}</h1>",
    ]
    open_ul = False
    for kind, content in blocks:
        if kind != "bullet" and open_ul:
            h.append("</ul>")
            open_ul = False
        if kind.startswith("h"):
            lvl = min(int(kind[1]) + 1, 6)
            h.append(f"<h{lvl}>{esc(content)}</h{lvl}>")
        elif kind == "table":
            h.append("<table>")
            for ri, row in enumerate(content):
                tag = "th" if ri == 0 else "td"
                cells = "".join(f"<{tag}>{esc(c)}</{tag}>" for c in row)
                h.append(f"<tr>{cells}</tr>")
            h.append("</table>")
        elif kind == "bullet":
            if not open_ul:
                h.append("<ul>")
                open_ul = True
            h.append(f"<li>{esc(content)}</li>")
        elif kind == "quote":
            h.append(f"<blockquote>{esc(content)}</blockquote>")
        else:
            h.append(f"<p>{esc(content)}</p>")
    if open_ul:
        h.append("</ul>")
    h.append("</body></html>")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write("\n".join(h))
    return html_path


def build_hwpx(md_paths):
    """HWPX를 한글 없이 직접 생성한다 (python-hwpx).

    한컴오피스 COM 자동화도 가능하지만 한글은 파일 '쓰기'에 보안 승인 대화상자를 띄워 자동화가
    멈춘다. 널리 쓰이는 우회법은 출처 불명의 FilePathCheckerModule.dll을 내려받아 등록하는 것인데,
    정체를 알 수 없는 DLL을 시스템에 등록하지 않는다. 순수 파이썬으로 생성하면 그 문제가 없고
    결과물을 검증까지 할 수 있다.
    """
    from hwpx.builder import Document, Section, Heading, Paragraph, Table, Bullet, Metadata

    made = []
    for md in md_paths:
        stem = os.path.splitext(os.path.basename(md))[0]
        title = TITLES.get(stem, stem)
        hwpx = os.path.join(OUT, stem + ".hwpx")

        with open(md, encoding="utf-8") as f:
            blocks = parse_blocks(f.read())

        children = [Heading(level=1, text=title)]
        pending_bullets = []

        def flush_bullets():
            if pending_bullets:
                children.append(Bullet(items=list(pending_bullets)))
                pending_bullets.clear()

        for kind, content in blocks:
            if kind == "bullet":
                pending_bullets.append(content)
                continue
            flush_bullets()

            if kind.startswith("h"):
                # HWPX 제목 수준은 1~3만 허용된다. 더 깊은 마크다운 제목은 3으로 접는다.
                children.append(Heading(level=min(int(kind[1]), 3), text=content))
            elif kind == "table" and content:
                header = content[0]
                rows = [r + [""] * (len(header) - len(r)) for r in content[1:]]
                rows = [r[: len(header)] for r in rows]
                if rows:
                    children.append(Table(header=header, rows=rows))
                else:
                    children.append(Table(header=header, rows=[[""] * len(header)]))
            elif kind == "quote":
                children.append(Paragraph(text="※ " + content))
            elif content:
                children.append(Paragraph(text=content))
        flush_bullets()

        doc = Document(
            sections=[Section(children=children)],
            metadata=Metadata(title=title),
        )
        try:
            doc.save_to_path(hwpx)
            made.append(hwpx)
            print(f"  HWPX  {os.path.basename(hwpx)}", flush=True)
        except Exception as e:
            print(f"  HWPX  FAIL {stem}: {str(e)[:120]}", flush=True)

    return made


# ── main ────────────────────────────────────────────────────────────────────
TITLES = {
    "00-FACTBASE": "GloSource AI — 사실기반 (FACTBASE)",
    "01-사업계획서_정부서식_PSST": "사업계획서 (정부 표준서식 · PSST)",
    "02-정부R&D_기술개발계획서": "기술개발계획서 (정부 R&D)",
    "03-투자계획서_IR": "투자계획서 (IR)",
    "04-일반사업계획서": "사업계획서 (일반)",
    "05-사업제안서": "사업제안서",
}


def main():
    os.makedirs(OUT, exist_ok=True)
    no_hwpx = "--no-hwpx" in sys.argv

    docx_paths = []
    for md in sorted(glob.glob(os.path.join(SRC, "*.md"))):
        stem = os.path.splitext(os.path.basename(md))[0]
        title = TITLES.get(stem, stem)
        dx = os.path.join(OUT, stem + ".docx")
        build_docx(md, dx, title)
        docx_paths.append(dx)
        print(f"  DOCX  {os.path.basename(dx)}")

        if stem.startswith("03-"):  # IR 만 슬라이드로
            px = os.path.join(OUT, stem + ".pptx")
            build_pptx(md, px, title)
            print(f"  PPTX  {os.path.basename(px)}")

    if not no_hwpx:
        print("\n한글(HWPX) 변환 — 한컴오피스 자동화")
        print("  ※ 한글 창에 보안 승인 대화상자가 뜨면 [허용]을 눌러주세요 (최초 1회)")
        mds = sorted(glob.glob(os.path.join(SRC, "*.md")))
        build_hwpx(mds)

    print(f"\n출력 위치: {OUT}")


if __name__ == "__main__":
    main()
