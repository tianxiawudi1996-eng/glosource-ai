#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Build the GloSource AI KR/EN social sales whitepaper as a polished DOCX."""

from __future__ import annotations

import os
from datetime import date

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


OUT_DIR = os.path.join("docs", "whitepapers")
OUT_PATH = os.path.join(OUT_DIR, "GloSource_AI_SNS_영업_백서_KR_EN.docx")

# launch_messaging_guide token map + named Korean font/brand overrides.
PAGE_W = 12240
PAGE_H = 15840
CONTENT_W = 9360
TABLE_INDENT = 120
CELL_TOP_BOTTOM = 100
CELL_START_END = 120

NAVY = "0D1B2A"
MINERAL = "8F3A26"
GREEN = "0F7A55"
BLUE = "2E74B5"
INK = "172033"
MUTED = "64748B"
LIGHT_BLUE = "E8EEF5"
LIGHT_GRAY = "F2F4F7"
LIGHT_GREEN = "EAF6F1"
LIGHT_ORANGE = "F9EEE9"
WHITE = "FFFFFF"
RULE = "D8DEE8"
CAUTION = "7A5A00"
RED = "9B1C1C"


def rgb(hex_value: str) -> RGBColor:
    return RGBColor.from_string(hex_value)


def set_run_font(run, size=None, bold=None, color=None, italic=None, name="Calibri"):
    run.font.name = name
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:hAnsi"), name)
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), "맑은 고딕")
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    if color is not None:
        run.font.color.rgb = rgb(color)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def shade_cell(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=CELL_TOP_BOTTOM, start=CELL_START_END,
                     bottom=CELL_TOP_BOTTOM, end=CELL_START_END):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths):
    assert sum(widths) == CONTENT_W, widths
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr

    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(CONTENT_W))
    tbl_w.set(qn("w:type"), "dxa")

    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), str(TABLE_INDENT))
    tbl_ind.set(qn("w:type"), "dxa")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)

    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            width = widths[idx]
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(width))
            tc_w.set(qn("w:type"), "dxa")
            cell.width = Inches(width / 1440)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)


def set_cell_border(cell, **kwargs):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in("w:tcBorders")
    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)
    for edge in ("top", "start", "bottom", "end", "insideH", "insideV"):
        if edge in kwargs:
            tag = f"w:{edge}"
            element = tc_borders.find(qn(tag))
            if element is None:
                element = OxmlElement(tag)
                tc_borders.append(element)
            for key in ("val", "sz", "space", "color"):
                if key in kwargs[edge]:
                    element.set(qn(f"w:{key}"), str(kwargs[edge][key]))


def set_table_borders(table, color=RULE, size=6):
    spec = {"val": "single", "sz": size, "space": "0", "color": color}
    for row in table.rows:
        for cell in row.cells:
            set_cell_border(cell, top=spec, start=spec, bottom=spec, end=spec)


def add_hyperlink(paragraph, text, url, color=BLUE):
    part = paragraph.part
    rel_id = part.relate_to(
        url,
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
        is_external=True,
    )
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rel_id)
    run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), "Calibri")
    r_fonts.set(qn("w:hAnsi"), "Calibri")
    r_fonts.set(qn("w:eastAsia"), "맑은 고딕")
    r_pr.append(r_fonts)
    c = OxmlElement("w:color")
    c.set(qn("w:val"), color)
    r_pr.append(c)
    u = OxmlElement("w:u")
    u.set(qn("w:val"), "single")
    r_pr.append(u)
    run.append(r_pr)
    t = OxmlElement("w:t")
    t.text = text
    run.append(t)
    hyperlink.append(run)
    paragraph._p.append(hyperlink)
    return hyperlink


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run()
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = " PAGE "
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char1)
    run._r.append(instr_text)
    run._r.append(fld_char2)
    set_run_font(run, size=8.5, color=MUTED)


def keep_with_next(paragraph):
    paragraph.paragraph_format.keep_with_next = True


def add_rule(paragraph, color=RULE, size=8):
    p_pr = paragraph._p.get_or_add_pPr()
    borders = p_pr.find(qn("w:pBdr"))
    if borders is None:
        borders = OxmlElement("w:pBdr")
        p_pr.append(borders)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(size))
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), color)
    borders.append(bottom)


def style_box_paragraph(paragraph, fill, border_color):
    p_pr = paragraph._p.get_or_add_pPr()
    shd = p_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        p_pr.append(shd)
    shd.set(qn("w:fill"), fill)
    borders = p_pr.find(qn("w:pBdr"))
    if borders is None:
        borders = OxmlElement("w:pBdr")
        p_pr.append(borders)
    for edge in ("top", "start", "bottom", "end"):
        node = OxmlElement(f"w:{edge}")
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), "8")
        node.set(qn("w:space"), "8")
        node.set(qn("w:color"), border_color)
        borders.append(node)
    paragraph.paragraph_format.left_indent = Inches(0.12)
    paragraph.paragraph_format.right_indent = Inches(0.12)
    paragraph.paragraph_format.keep_together = True


def add_title(doc, text, subtitle=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(text)
    set_run_font(r, size=30, bold=True, color=NAVY)
    if subtitle:
        p2 = doc.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_after = Pt(18)
        r2 = p2.add_run(subtitle)
        set_run_font(r2, size=14, color=MINERAL)


def add_kicker(doc, text, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text.upper())
    set_run_font(r, size=9, bold=True, color=MINERAL)
    return p


def add_body(doc, text, bold_lead=None, color=INK, italic=False, after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.25
    if bold_lead and text.startswith(bold_lead):
        r1 = p.add_run(bold_lead)
        set_run_font(r1, size=10.5, bold=True, color=color)
        r2 = p.add_run(text[len(bold_lead):])
        set_run_font(r2, size=10.5, color=color, italic=italic)
    else:
        r = p.add_run(text)
        set_run_font(r, size=10.5, color=color, italic=italic)
    return p


def add_bullet(doc, text, level=0, color=INK, bold_lead=None):
    p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.left_indent = Inches(0.375 if level == 0 else 0.65)
    p.paragraph_format.first_line_indent = Inches(-0.188)
    if bold_lead and text.startswith(bold_lead):
        r1 = p.add_run(bold_lead)
        set_run_font(r1, size=10.2, bold=True, color=color)
        r2 = p.add_run(text[len(bold_lead):])
        set_run_font(r2, size=10.2, color=color)
    else:
        r = p.add_run(text)
        set_run_font(r, size=10.2, color=color)
    return p


def add_number(doc, text):
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.left_indent = Inches(0.375)
    p.paragraph_format.first_line_indent = Inches(-0.188)
    r = p.add_run(text)
    set_run_font(r, size=10.2, color=INK)
    return p


def add_callout(doc, label, text, fill=LIGHT_BLUE, accent=BLUE):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.2
    style_box_paragraph(p, fill, accent)
    r1 = p.add_run(label + "  ")
    set_run_font(r1, size=10, bold=True, color=accent)
    r2 = p.add_run(text)
    set_run_font(r2, size=10, color=INK)
    return p


def add_table(doc, headers, rows, widths, header_fill=LIGHT_BLUE, font_size=8.9):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    for idx, text in enumerate(headers):
        cell = hdr.cells[idx]
        shade_cell(cell, header_fill)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.1
        r = p.add_run(str(text))
        set_run_font(r, size=font_size, bold=True, color=NAVY)
    for row_idx, row in enumerate(rows):
        cells = table.add_row().cells
        for col_idx, value in enumerate(row):
            cell = cells[col_idx]
            if row_idx % 2 == 1:
                shade_cell(cell, "FAFBFC")
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.12
            p.alignment = (
                WD_ALIGN_PARAGRAPH.CENTER
                if col_idx == 0 and len(headers) >= 3
                else WD_ALIGN_PARAGRAPH.LEFT
            )
            r = p.add_run(str(value))
            set_run_font(r, size=font_size, color=INK)
    set_table_geometry(table, widths)
    set_table_borders(table)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_script_box(doc, title, lines, language="KR"):
    accent = MINERAL if language == "KR" else GREEN
    fill = LIGHT_ORANGE if language == "KR" else LIGHT_GREEN
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.18
    style_box_paragraph(p, fill, accent)
    r0 = p.add_run(title)
    set_run_font(r0, size=10.2, bold=True, color=MINERAL if language == "KR" else GREEN)
    for line in lines:
        p.add_run().add_break()
        r = p.add_run(line)
        set_run_font(r, size=9.7, color=INK)
    return p


def h1(doc, text, new_page=True):
    if new_page:
        doc.add_page_break()
    p = doc.add_paragraph(style="Heading 1")
    r = p.add_run(text)
    set_run_font(r, size=16, bold=True, color=BLUE)
    keep_with_next(p)
    return p


def h2(doc, text):
    p = doc.add_paragraph(style="Heading 2")
    r = p.add_run(text)
    set_run_font(r, size=13, bold=True, color=BLUE)
    keep_with_next(p)
    return p


def h3(doc, text):
    p = doc.add_paragraph(style="Heading 3")
    r = p.add_run(text)
    set_run_font(r, size=11.5, bold=True, color=MINERAL)
    keep_with_next(p)
    return p


def setup_styles(doc):
    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = rgb(INK)
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25

    tokens = {
        "Heading 1": (16, BLUE, 18, 10),
        "Heading 2": (13, BLUE, 14, 7),
        "Heading 3": (11.5, MINERAL, 10, 5),
    }
    for style_name, (size, color, before, after) in tokens.items():
        st = doc.styles[style_name]
        st.font.name = "Calibri"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = rgb(color)
        st._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
        st._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(after)
        st.paragraph_format.keep_with_next = True

    for style_name in ("List Bullet", "List Bullet 2", "List Number"):
        st = doc.styles[style_name]
        st.font.name = "Calibri"
        st.font.size = Pt(10.2)
        st._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
        st._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "맑은 고딕")
        st.paragraph_format.space_after = Pt(4)
        st.paragraph_format.line_spacing = 1.25


def setup_page(doc):
    for section in doc.sections:
        section.page_width = Inches(8.5)
        section.page_height = Inches(11)
        section.top_margin = Inches(0.82)
        section.bottom_margin = Inches(0.82)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        section.header_distance = Inches(0.42)
        section.footer_distance = Inches(0.42)
        header = section.header
        p = header.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run("GloSource AI  |  KR·EN SNS Sales White Paper")
        set_run_font(r, size=8.2, color=MUTED)
        add_rule(p, RULE, 5)
        footer = section.footer
        fp = footer.paragraphs[0]
        left = fp.add_run("glosourceai.com")
        set_run_font(left, size=8.2, color=MUTED)
        tab_stops = fp.paragraph_format.tab_stops
        tab_stops.add_tab_stop(Inches(6.0))
        fp.add_run("\t")
        add_page_number(fp)


def add_profile_settings(doc):
    h2(doc, "계정 구조: ‘한 계정에 두 시장을 섞지 않는다’")
    add_callout(
        doc,
        "권장 구조",
        "상용 전환이 가능한 EN을 브랜드 메인 계정으로 우선 운영하고, KR은 무료 베타 학습 채널로 분리한다. "
        "운영 인력이 부족하면 플랫폼별 계정을 무리하게 두 개 만들지 말고, EN 메인 + KR 전용 재생목록·하이라이트·고정글로 시작한 뒤 성과가 확인되면 분리한다.",
        LIGHT_GREEN,
        GREEN,
    )
    add_table(
        doc,
        ["구분", "EN 상용 퍼널", "KR 베타 퍼널"],
        [
            ["프로필명", "GloSource AI | Korean Supplier Research", "글로소스 AI | 중국 소싱 리서치"],
            ["주 링크", "https://glosourceai.com/en", "https://glosourceai.com/"],
            ["바이오 핵심", "Find Korean supplier candidates with public source evidence and an editable English RFQ.", "1688·Alibaba·WeChat 기반 중국 공급사 후보 탐색과 비교 리포트."],
            ["고정 콘텐츠", "Korean OEM demo / registry evidence / RFQ", "제품 이미지 검색 / 1688 비교 / 공급사 위험 신호"],
            ["전환", "가입 → 검색 → 결과 미리보기 → 결제", "익명 검색 → 가입/대기자 → 베타 재사용"],
        ],
        [1320, 4020, 4020],
        font_size=8.5,
    )
    add_body(
        doc,
        "이름과 로고는 통일하되 소개 문구·프로필 링크·고정글·CTA는 절대 혼합하지 않는다. "
        "영문 게시물에서 한국어 홈으로, 국내 게시물에서 /en 결제 페이지로 보내면 클릭은 생겨도 전환 데이터가 오염된다."
    )


def add_channel_section(doc, channel):
    h1(doc, channel["title"])
    add_kicker(doc, channel["role"])
    add_callout(doc, "한 줄 원칙", channel["principle"], channel["fill"], channel["accent"])
    add_table(
        doc,
        ["항목", "권장 설정", "측정 지표"],
        channel["settings"],
        [1680, 5280, 2400],
        header_fill=channel["fill"],
        font_size=8.7,
    )
    h2(doc, "콘텐츠 구성")
    for item in channel["content"]:
        add_bullet(doc, item)
    h2(doc, "KR 맞춤 스크립트")
    add_script_box(doc, channel["kr_title"], channel["kr_lines"], "KR")
    h2(doc, "EN 맞춤 스크립트")
    add_script_box(doc, channel["en_title"], channel["en_lines"], "EN")
    h2(doc, "게시 전 체크")
    for item in channel["check"]:
        add_bullet(doc, item)


def build_document():
    os.makedirs(OUT_DIR, exist_ok=True)
    doc = Document()
    setup_styles(doc)
    setup_page(doc)

    # Cover: editorial_cover pattern, with restrained commercial treatment.
    for _ in range(4):
        doc.add_paragraph().paragraph_format.space_after = Pt(12)
    add_kicker(doc, "SALES & SOCIAL OPERATING WHITE PAPER", WD_ALIGN_PARAGRAPH.CENTER)
    add_title(
        doc,
        "글로소스 AI SNS 영업 백서",
        "KR·EN 이중 퍼널과 플랫폼별 맞춤 영업 실행안",
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("숏츠 · 릴스 · 틱톡 · 레딧 · 쓰레드 · X · 인스타그램 · 페이스북 · 링크드인")
    set_run_font(r, size=10, bold=True, color=MUTED)
    doc.add_paragraph().paragraph_format.space_after = Pt(30)
    add_callout(
        doc,
        "문서 목적",
        "국내 기업과 해외 바이어를 서로 다른 고객으로 정의하고, 같은 제품 증거를 각 SNS의 문법에 맞게 재가공하여 "
        "검색·가입·RFQ·결제로 연결하는 실행 표준을 제공한다.",
        LIGHT_GRAY,
        NAVY,
    )
    doc.add_paragraph().paragraph_format.space_after = Pt(80)
    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run_font(meta.add_run("작성 기준  2026-07-29\n"), size=9.2, bold=True, color=NAVY)
    set_run_font(meta.add_run("GloSource AI · glosourceai.com"), size=9, color=MUTED)

    # Contents
    h1(doc, "이 백서의 사용법")
    add_body(
        doc,
        "이 문서는 ‘브랜드 소개서’와 ‘영업 운영 매뉴얼’을 결합한 자료다. 대표자는 1~4장을 통해 메시지를 정렬하고, "
        "콘텐츠 담당자는 5~13장의 플랫폼별 세팅과 스크립트를 그대로 실행하며, 운영자는 14~17장의 캘린더·측정·가드레일로 품질을 통제한다."
    )
    for idx, section in enumerate([
        "01  제품 포트폴리오와 영업 전제",
        "02  KR·EN 고객과 구매동기",
        "03  핵심 가치제안과 증거 설계",
        "04  공통 콘텐츠 생산 시스템",
        "05  YouTube Shorts",
        "06  Instagram Reels",
        "07  TikTok",
        "08  Reddit",
        "09  Threads",
        "10  X",
        "11  Instagram 피드·스토리",
        "12  Facebook",
        "13  LinkedIn",
        "14  공통·기본 영업 스크립트",
        "15  30일 실행 캘린더",
        "16  전환 측정과 UTM",
        "17  표현·신뢰·운영 가드레일",
        "부록  체크리스트와 출처",
    ]):
        add_number(doc, section)
    add_callout(
        doc,
        "운영 우선순위",
        "EN은 결제 가능한 상용 서비스이므로 글로벌 바이어 전환을 1순위로 둔다. KR은 무료 베타이므로 검색 완료·가입·대기자·재사용을 학습 지표로 본다.",
        LIGHT_ORANGE,
        MINERAL,
    )

    # 1
    h1(doc, "01. 제품 포트폴리오와 영업 전제")
    add_body(
        doc,
        "GloSource AI는 하나의 브랜드 안에 방향이 반대인 두 제품을 운영한다. 따라서 ‘AI 소싱’이라는 공통 문구만 반복하면 "
        "누가 무엇을 사는지 불명확해진다. 모든 콘텐츠는 게시 전에 반드시 Surface, Persona, Proof, CTA 네 가지를 확정해야 한다."
    )
    add_table(
        doc,
        ["구분", "KR 서비스 (/)", "EN 서비스 (/en)"],
        [
            ["고객", "해외 공급사를 찾는 국내 기업", "한국 제조사·K-Product 공급사를 찾는 해외 바이어"],
            ["현재 방향", "중국 중심: 1688·Alibaba·WeChat·이미지 검색", "K-Beauty·K-Food 등 한국 공급사 후보 조사"],
            ["상태", "무료 베타 / 대기자", "상용 서비스 / USD 결제"],
            ["무료 사용", "익명 일 5회, 회원 월 5회", "이메일 인증 회원 월 3회"],
            ["핵심 결과", "공급사 비교·위험 신호·소싱 리포트", "공공 레지스트리 근거·후보 비교·영문 RFQ"],
            ["CTA", "무료로 해외 공급사 탐색", "Start a free Korean supplier search"],
        ],
        [1320, 4020, 4020],
        font_size=8.5,
    )
    h2(doc, "영업 메시지 4요소")
    for text in [
        "Surface: KR 또는 EN 중 하나만 선택한다.",
        "Persona: ‘소싱이 필요한 사람’인지 확인한다. 업계 종사자라는 이유만으로 타깃이 되는 것은 아니다.",
        "Proof: 실제 UI, 원장 대조 근거, 출처 URL, RFQ 초안처럼 보여줄 수 있는 증거를 사용한다.",
        "CTA: 한 게시물에는 행동 하나만 둔다. 검색, 샘플 리포트, 답글, 데모 요청 중 하나다.",
    ]:
        add_number(doc, text)
    add_callout(
        doc,
        "현재 광고 원칙",
        "EN 퍼널·결제 감사는 통과했지만 2026-07-29 기준 획득 준비 게이트는 일일 성장 실행 리포트 누락으로 미통과다. "
        "유료 광고는 전환 추적과 획득 게이트가 모두 통과한 뒤 집행한다.",
        LIGHT_ORANGE,
        CAUTION,
    )

    # 2
    h1(doc, "02. KR·EN 고객과 구매동기")
    h2(doc, "KR: 국내 업체 대상 영업")
    add_body(
        doc,
        "국내 서비스의 고객은 ‘중국 소싱을 더 싸게 하고 싶은 사람’이 아니라, 외국어·플랫폼 분산·공급사 진위·견적 비교 때문에 "
        "첫 후보군을 만드는 데 시간을 쓰는 실무자다. 무료 베타에서는 매출보다 반복 사용과 문제 강도를 검증한다."
    )
    add_table(
        doc,
        ["ICP", "상황 신호", "제안할 결과물"],
        [
            ["중소 제조·유통사 구매담당", "1688/Alibaba 후보를 엑셀로 수작업 비교", "동일 품목 공급사 비교 리포트"],
            ["온라인 셀러·브랜드 운영자", "사진은 있으나 정확한 제품명을 모름", "이미지 분석 → 유사 제품 후보 탐색"],
            ["무역 초보 창업자", "중국어·MOQ·견적 문의가 부담", "연락 가능한 후보 + RFQ 초안"],
            ["원가 절감 프로젝트 담당", "기존 공급사 외 대안이 필요", "가격·MOQ·리드타임 비교 후보군"],
        ],
        [2280, 3720, 3360],
        font_size=8.7,
    )
    h3(doc, "KR 문제 문장")
    add_script_box(
        doc,
        "국내 영업 오프닝",
        [
            "“1688에서 제품은 찾았는데, 공장인지 무역상인지 확인하느라 시간이 더 걸리지 않으세요?”",
            "“사진 한 장만 있는데 중국어 품목명과 공급사 후보를 찾느라 막히셨다면, 먼저 비교 가능한 후보군부터 만들어보세요.”",
            "“글로소스 AI는 거래를 대신하는 업체가 아니라, 첫 소싱 리서치를 빠르게 정리하는 도구입니다.”",
        ],
        "KR",
    )
    h2(doc, "EN: 해외 바이어 대상 영업")
    add_body(
        doc,
        "EN의 핵심 고객은 한국 공급망이 이미 완성된 대형 유통사가 아니다. 한국 OEM/ODM을 처음 탐색하거나, K-Product 카테고리를 "
        "테스트하며, 제조사와 중개상을 구분하고 문서 요청을 시작해야 하는 소규모 바이어다."
    )
    add_table(
        doc,
        ["Strong fit", "Intent signal", "First offer"],
        [
            ["Indie / DTC beauty founder", "Exploring Korean OEM/ODM for a new SKU", "Category sample report + editable RFQ"],
            ["Amazon FBA seller", "Testing a Korean beauty or food line", "Shortlist with source and MOQ context"],
            ["Small importer / retailer", "Adding Korea for the first time", "Supplier candidates + due-diligence checklist"],
            ["New procurement owner", "Assigned to source from Korea", "Evidence-led comparison workflow"],
        ],
        [2400, 3660, 3300],
        font_size=8.7,
    )
    h3(doc, "Anti-ICP: 영업하지 않을 대상")
    for text in [
        "이미 한국 공급망을 확보한 대형 유통사",
        "소싱 에이전시·무역상·수출 운영사 — 고객보다 동종 사업자에 가깝다",
        "한국 제조사 본인 — /en의 구매자가 아니다",
        "‘K-beauty 업계’라는 사실만 있고 한국 공급사 탐색 의도가 보이지 않는 계정",
    ]:
        add_bullet(doc, text)
    add_script_box(
        doc,
        "Global positioning line",
        [
            "GloSource AI helps international buyers find Korean supplier candidates, review public registry evidence, and prepare an English RFQ.",
            "It is a first-pass research tool—not a factory audit, certification service, or transaction guarantee.",
        ],
        "EN",
    )

    # 3
    h1(doc, "03. 핵심 가치제안과 증거 설계")
    add_callout(
        doc,
        "브랜드 약속",
        "‘빨리 찾는다’보다 ‘근거를 보면서 먼저 연락할 후보를 좁힌다’가 더 강한 메시지다. 속도는 보조 효익이고, 출처·위험 신호·RFQ가 구매 이유다.",
        LIGHT_GREEN,
        GREEN,
    )
    add_table(
        doc,
        ["문제", "GloSource가 제공하는 것", "콘텐츠로 보여줄 증거"],
        [
            ["탭과 플랫폼이 분산됨", "제품 브리프 기반 후보군 정리", "검색 전/후 화면 녹화"],
            ["제조사인지 중개상인지 불명확", "공공 원장·회사·출처 신호 구분", "Registry Match와 source URL 화면"],
            ["MOQ·인증·리드타임 비교가 어려움", "비교 맥락과 위험 메모", "공급사 카드 2~3개 비교"],
            ["영문 첫 문의 작성이 부담", "수정 가능한 RFQ 초안", "RFQ 생성·복사 장면"],
            ["근거 없는 AI 결과가 불안", "죽은 링크 강등·품질 게이트", "결과 없음/경고도 숨기지 않는 데모"],
        ],
        [2500, 3400, 3460],
        font_size=8.5,
    )
    h2(doc, "증거 콘텐츠의 기본 단위")
    for text in [
        "실제 검색 1건: 입력 브리프, 후보 3개, 출처 링크, 위험 신호, RFQ까지 캡처한다.",
        "공식 레지스트리 설명 1건: ‘무엇을 증명하고 무엇을 증명하지 않는지’를 함께 말한다.",
        "샘플 리포트 1건: 카테고리별로 PDF/이미지/캐러셀/게시물로 재활용한다.",
        "고객 반응 1건: 허락받은 원문 또는 익명화된 실제 피드백만 사용한다.",
    ]:
        add_bullet(doc, text)
    add_callout(
        doc,
        "중요한 표현",
        "Registry Match는 ‘해당 후보의 신원이 적용 가능한 공개 한국 레지스트리 기록과 일치했다’는 근거다. "
        "GloSource가 공급사를 감사·보증·추천한다는 뜻이 아니다.",
        LIGHT_ORANGE,
        CAUTION,
    )

    # 4
    h1(doc, "04. 공통 콘텐츠 생산 시스템")
    add_body(
        doc,
        "콘텐츠를 플랫폼마다 새로 만들지 않는다. 실제 검색 1건을 ‘원본 증거’로 만들고, 길이·말투·CTA만 바꿔 8개 채널로 분배한다. "
        "이렇게 해야 메시지가 일관되고, 제작 시간이 줄며, 성과 비교가 가능하다."
    )
    add_table(
        doc,
        ["원본", "재가공 산출물", "핵심 변경"],
        [
            ["실제 검색 화면 3~5분", "Shorts / Reels / TikTok 25~35초", "첫 2초 Hook + 세로 화면 + 자막"],
            ["결과 카드·RFQ 캡처", "Instagram carousel / Facebook post", "문제→증거→체크리스트 5~7장"],
            ["검색에서 발견한 교훈", "LinkedIn / Threads / X", "통찰 길이와 CTA 강도 조절"],
            ["질문·실패 사례", "Reddit 답변", "링크 없이 완결된 교육형 답변"],
            ["샘플 리포트", "DM / cold email", "개인화된 1개 제안으로 축소"],
        ],
        [2520, 3480, 3360],
        font_size=8.6,
    )
    h2(doc, "모든 게시물의 5단 구조")
    for text in [
        "Hook — 구체적인 상황 또는 질문: ‘공장인가, 중개상인가?’",
        "Pain — 지금 방식의 비용: 탭, 번역, 비교, 회신 없는 RFQ.",
        "Proof — 실제 UI·출처·위험 신호·문서 초안.",
        "Boundary — 리서치 도구이며 감사·보증이 아님.",
        "CTA — 한 번의 다음 행동: 검색, 샘플, 댓글, 저장.",
    ]:
        add_number(doc, text)
    h2(doc, "콘텐츠 기둥 6개")
    for text in [
        "Problem: 공급사 탐색의 숨은 비용",
        "Proof: 실제 검색·원장 대조·출처 URL",
        "Education: MOQ, RFQ, 인증·문서 확인법",
        "Comparison: Before/After, 제조사/중개상, 후보 A/B",
        "Build in public: 제품을 만든 이유와 개선 과정",
        "Offer: 무료 검색·샘플 리포트·데모",
    ]:
        add_bullet(doc, text)
    add_profile_settings(doc)

    channels = [
        {
            "title": "05. YouTube Shorts",
            "role": "검색 자산 + 반복 노출",
            "principle": "30초 안에 실제 검색 한 번을 완결한다. 제목은 검색 의도를 담고, 영상은 Hook–Demo–Evidence–CTA로 간다.",
            "fill": LIGHT_BLUE,
            "accent": BLUE,
            "settings": [
                ["포맷", "9:16 세로, 1080×1920 권장, 25~40초 중심", "Engaged views, 평균 시청률"],
                ["채널 구조", "EN 메인 채널 + KR 재생목록 또는 KR 별도 채널", "구독자 언어, 재방문 시청자"],
                ["제목", "검색형: Korean sunscreen OEM / 1688 공장 찾기", "검색 유입, CTR"],
                ["설명·링크", "첫 두 줄에 가치 + UTM 링크 + 면책", "링크 클릭, 가입"],
                ["고정댓글", "질문 1개 + 동일 UTM CTA", "댓글률, 검색 시작"],
            ],
            "content": [
                "첫 2초: 큰 자막으로 문제를 보여준다.",
                "3~20초: 실제 입력→결과→출처 링크/위험 신호를 화면 녹화한다.",
                "20~28초: RFQ 또는 비교표를 보여준다.",
                "마지막 3초: URL과 행동 하나만 제시한다.",
            ],
            "kr_title": "KR Shorts 30초",
            "kr_lines": [
                "“1688에서 이 제품을 찾았는데, 공장인지 무역상인지 모르겠다면?”",
                "“글로소스 AI에 제품명과 수량을 넣으면 1688·Alibaba 후보를 한 번에 비교할 수 있습니다.”",
                "“가격·MOQ·위험 신호를 보고, 먼저 연락할 후보를 좁혀보세요.”",
                "“거래 보증이 아닌 1차 소싱 리서치 도구입니다. 무료 베타는 glosourceai.com.”",
            ],
            "en_title": "EN Shorts 30 seconds",
            "en_lines": [
                "“Finding Korean manufacturers shouldn’t take ten tabs.”",
                "“Enter a product brief. GloSource AI builds a Korean supplier candidate shortlist.”",
                "“Review public registry evidence, source links, risk notes, MOQ context, and an editable English RFQ.”",
                "“Start a free search at glosourceai.com/en. Research first—verify before ordering.”",
            ],
            "check": [
                "자막이 음소거 상태에서도 이해되는가?",
                "실제 제품 화면이 10초 이상 보이는가?",
                "오래된 ‘EN 익명 5회’ 문구를 쓰지 않았는가? 현재 EN 무료는 이메일 인증 회원 월 3회다.",
                "1분을 넘는 경우 음악 권리와 Content ID를 다시 확인한다.",
            ],
        },
        {
            "title": "06. Instagram Reels",
            "role": "시각적 신뢰 + 프로필 전환",
            "principle": "광고처럼 보이는 완벽한 영상보다 제품 화면·사람의 설명·큰 자막이 섞인 ‘실무 데모’가 낫다.",
            "fill": LIGHT_ORANGE,
            "accent": MINERAL,
            "settings": [
                ["포맷", "9:16 세로, 20~35초, 원본/로열티 프리 음원", "3초·완주·재생 시간"],
                ["프로필", "Business 계정, Facebook Page 연결, Contact 버튼", "프로필 방문, 링크 클릭"],
                ["커버", "문제 문장 4~7단어, 제품 화면 포함", "프로필 그리드 CTR"],
                ["링크", "bio link를 KR/EN로 분리; 게시물 CTA와 일치", "세션·검색 시작"],
                ["재활용", "Reels를 Story에 공유하고 질문 스티커 추가", "답장·DM"],
            ],
            "content": [
                "커버 예시: ‘Manufacturer or middleman?’ / ‘1688 공장, 어떻게 구분할까?’",
                "세로 안전 영역에 자막·로고·CTA를 배치한다.",
                "리얼 화면과 제품 B-roll을 2~3초 간격으로 전환한다.",
                "Caption은 핵심 체크리스트 3개와 면책, CTA 순서로 쓴다.",
            ],
            "kr_title": "KR Reels Caption",
            "kr_lines": [
                "중국 공급사 검색, ‘최저가’보다 먼저 볼 것은 공장 여부·MOQ·연락 가능성입니다.",
                "글로소스 AI로 제품 브리프를 넣고 후보·가격 맥락·위험 신호를 비교해보세요.",
                "무료 베타 → 프로필 링크. 실제 거래 전에는 사업자·샘플·계좌·검품을 직접 확인하세요.",
            ],
            "en_title": "EN Reels Caption",
            "en_lines": [
                "Before you email 20 Korean suppliers, compare the same evidence across three candidates.",
                "GloSource AI organizes public source links, registry signals, MOQ context, risk notes, and an editable English RFQ.",
                "Start free from the link in bio. It’s a research shortcut—not a supplier audit.",
            ],
            "check": [
                "커버 제목만 보고 KR/EN 타깃이 구분되는가?",
                "프로필 링크가 해당 언어 랜딩으로 연결되는가?",
                "음원은 원본 또는 광고 사용이 허용된 로열티 프리인가?",
                "DM을 유도한다면 답변 SLA와 저장 답변이 준비됐는가?",
            ],
        },
        {
            "title": "07. TikTok",
            "role": "빠른 Hook 검증 + 창업자·셀러 도달",
            "principle": "브랜드 필름이 아니라 ‘한 사람이 한 문제를 해결하는 화면’으로 만든다. Hook·캡션·첫 장면을 여러 버전으로 테스트한다.",
            "fill": LIGHT_GREEN,
            "accent": GREEN,
            "settings": [
                ["포맷", "9:16 전체화면, 720p 이상, 21~34초 우선 테스트", "2초·6초·완주율"],
                ["화자", "대표/운영자가 카메라에 직접 설명 + 화면 녹화", "댓글·프로필 방문"],
                ["자막", "첫 문장 즉시 노출, 한 화면 1메시지", "시청 유지"],
                ["프로필", "가치제안 1문장 + 언어별 랜딩 링크", "링크 클릭"],
                ["테스트", "Hook 3개 × 본문 1개 × CTA 2개", "검색 시작/1,000뷰"],
            ],
            "content": [
                "검색창 또는 공급사 카드로 바로 시작하고 로고 인트로는 생략한다.",
                "실패·경고 화면도 콘텐츠로 사용한다: ‘왜 이 후보가 강등됐는가’.",
                "댓글 질문을 다음 영상으로 답변하여 시리즈화한다.",
                "유료 집행 전 TikTok Pixel/Events API와 핵심 이벤트를 검증한다.",
            ],
            "kr_title": "KR TikTok Hook 3종",
            "kr_lines": [
                "A. “1688 최저가 업체, 정말 공장일까요?”",
                "B. “사진 한 장으로 중국 공급사를 찾는 과정을 보여드릴게요.”",
                "C. “중국어를 못해도 첫 공급사 후보군은 만들 수 있습니다.”",
                "본문: 입력 → 후보 비교 → 위험 신호 → 무료 베타 CTA.",
            ],
            "en_title": "EN TikTok Hook 3 variants",
            "en_lines": [
                "A. “Manufacturer—or just another trader?”",
                "B. “Here’s how I research a Korean sunscreen OEM in 30 seconds.”",
                "C. “Don’t send an RFQ until you compare these three signals.”",
                "Body: product brief → evidence cards → editable RFQ → start free.",
            ],
            "check": [
                "첫 프레임에 문제와 제품이 동시에 보이는가?",
                "영상이 광고 문체보다 사람의 설명처럼 들리는가?",
                "해시태그보다 검색어가 대사·자막·Caption에 자연스럽게 들어갔는가?",
                "유료 증폭은 획득 준비 게이트와 픽셀 이벤트 검증 후인가?",
            ],
        },
        {
            "title": "08. Reddit",
            "role": "고의도 질문 대응 + 신뢰 축적",
            "principle": "링크보다 답변이 먼저다. 제품을 언급하지 않아도 도움이 되는 완결된 답변을 작성하고, 허용되는 경우에만 관계를 공개한 뒤 링크를 붙인다.",
            "fill": LIGHT_ORANGE,
            "accent": MINERAL,
            "settings": [
                ["탐색", "Korean supplier, OEM, MOQ, private label 질문 모니터링", "적합 스레드 수"],
                ["참여", "주 3~5개 고품질 답변, 대량 자동화 금지", "업보트·답글"],
                ["링크", "서브레딧 규칙 확인 후 최소 사용", "프로필·링크 클릭"],
                ["공개", "‘I build GloSource AI’라고 관계 공개", "삭제율·신고율"],
                ["CTA", "무료 체크리스트/질문 답변; 무단 DM 금지", "대화 지속률"],
            ],
            "content": [
                "질문을 supplier·compliance·marketplace 문제로 분리해서 답한다.",
                "같은 질문을 3개 후보에게 동일하게 보내라고 안내한다.",
                "인증 로고보다 번호·범위·발급기관·유효기간을 요청하게 한다.",
                "결제 전 샘플·계약 상대·계좌 명의·검품을 확인하도록 말한다.",
            ],
            "kr_title": "KR 커뮤니티 답변 템플릿",
            "kr_lines": [
                "“먼저 공급사 문제와 통관/판매 규정 문제를 분리해서 보시는 게 좋습니다.”",
                "“공급사에는 제조 주체, MOQ, 샘플, 인증번호, 견적 포함 범위, 계좌 명의를 같은 양식으로 물어보세요.”",
                "“저는 글로소스 AI를 만들고 있습니다. 관련이 있고 규칙상 링크가 허용된다면 리서치 도구를 공유드릴 수 있지만, 거래나 공급사를 보증하지는 않습니다.”",
            ],
            "en_title": "EN Reddit answer template",
            "en_lines": [
                "“I would compare the same facts across at least three candidates: manufacturer of record, MOQ by SKU, current certificate numbers, sample terms, formula ownership, and the company name on the quote and bank account.”",
                "“Disclosure: I build GloSource AI, a research tool for organizing Korean supplier candidates and RFQ questions. It is not a verification or sourcing-agent service.”",
            ],
            "check": [
                "스레드가 열려 있고 질문이 아직 유효한가?",
                "서브레딧 규칙과 자기홍보 정책을 게시 직전에 확인했는가?",
                "제품 링크 없이도 답변이 완결되는가?",
                "동일 문구를 여러 커뮤니티에 반복 게시하지 않는가?",
            ],
        },
        {
            "title": "09. Threads",
            "role": "짧은 통찰 + 대화형 리드",
            "principle": "짧은 관찰 하나를 던지고 답글에서 구체화한다. 링크 게시물보다 질문·경험·반론이 대화를 만든다.",
            "fill": LIGHT_GREEN,
            "accent": GREEN,
            "settings": [
                ["프로필", "bio에 최대 5개 링크 활용: EN, KR, 샘플, 블로그", "프로필 링크 방문"],
                ["주제", "Sourcing / K-beauty / Small business 관련 topic 사용", "조회·팔로우"],
                ["게시", "하루 1개 통찰 + 관련 대화 3개 답글", "답글·인용"],
                ["형식", "1문장 Hook + 2~4문장 맥락 + 질문", "대화율"],
                ["분석", "주간 Insights로 조회·답글·신규 팔로워 비교", "주간 증감"],
            ],
            "content": [
                "관찰형: ‘Most supplier lists fail before the RFQ.’",
                "논쟁형: ‘A certificate logo is not supplier verification.’",
                "빌드인퍼블릭형: 검색에서 탈락시킨 후보와 이유.",
                "질문형: ‘What’s the hardest part of sourcing from Korea?’",
            ],
            "kr_title": "KR Threads 3종",
            "kr_lines": [
                "“중국 소싱에서 가장 싼 업체가 아니라, 질문에 가장 명확히 답하는 업체가 첫 후보가 되어야 합니다.”",
                "“1688에서 공급사를 볼 때 여러분은 가격, 공장 여부, MOQ 중 무엇부터 확인하시나요?”",
                "“글로소스 AI 무료 베타를 만들며 가장 자주 보는 문제는 ‘후보는 많지만 비교 기준이 없다’는 것입니다.”",
            ],
            "en_title": "EN Threads 3 variants",
            "en_lines": [
                "“A supplier list is not due diligence. The useful part is the evidence you can compare before the first email.”",
                "“Manufacturer or trader? What’s the hardest signal to verify when sourcing from Korea?”",
                "“I’m building GloSource AI to turn a product brief into supplier candidates, public evidence, and an editable RFQ—not a false guarantee.”",
            ],
            "check": [
                "topic을 하나만 명확히 붙였는가?",
                "게시물 끝에 답하기 쉬운 질문이 있는가?",
                "첫 글부터 외부 링크를 강요하지 않는가?",
                "답글에서 실제 사례·체크리스트를 제공할 준비가 됐는가?",
            ],
        },
        {
            "title": "10. X",
            "role": "실시간 통찰 + 창업자 네트워크",
            "principle": "짧고 대화체로 쓴다. 한 포스트에 하나의 주장만 두고, 15초 이하 영상 또는 근거 이미지로 타임라인에서 멈추게 한다.",
            "fill": LIGHT_BLUE,
            "accent": BLUE,
            "settings": [
                ["텍스트", "간결한 주장 + 명확한 CTA, 해시태그 최소화", "노출·프로필 방문"],
                ["미디어", "텍스트가 과하지 않은 이미지, 대사는 자막 포함", "영상 완료·클릭"],
                ["영상", "핵심 장면 15초 이하 우선", "3초·완주"],
                ["운영", "키워드 모니터링 + 관련 대화에 맥락 답글", "답글·팔로우"],
                ["링크", "UTM 링크; 가능하면 클릭 가능한 Website Card", "세션·검색 시작"],
            ],
            "content": [
                "데이터 포스트: 제조사/중개상 구분에 필요한 근거 3개.",
                "Build log: 이번 주 품질 게이트에서 제외된 후보 유형.",
                "미니 스레드: 한국 OEM RFQ에 반드시 포함할 7개 필드.",
                "짧은 데모: 제품 입력→근거 카드→RFQ 15초.",
            ],
            "kr_title": "KR X 포스트",
            "kr_lines": [
                "“1688 공급사 비교에서 가격만 보면 안 되는 이유:”",
                "“1) 공장/무역상  2) MOQ 기준  3) 견적 포함 범위  4) 계좌 명의”",
                "“글로소스 AI 무료 베타로 첫 후보군을 정리해보세요 → [KR UTM 링크]”",
            ],
            "en_title": "EN X post",
            "en_lines": [
                "“A Korean supplier shortlist is only useful if you can inspect the evidence.”",
                "“Source links. Registry signals. Risk notes. MOQ context. An editable RFQ.”",
                "“Start a free search → [EN UTM link]. Research tool, not a supplier guarantee.”",
            ],
            "check": [
                "주장 하나만 남겼는가?",
                "대문자·해시태그·이모지가 과하지 않은가?",
                "영상 대사에 자막이 있는가?",
                "링크보다 대화가 유리한 게시물인지 판단했는가?",
            ],
        },
        {
            "title": "11. Instagram 피드·스토리",
            "role": "저장 가능한 교육 자료 + DM 전환",
            "principle": "피드는 저장할 자료, 스토리는 질문과 즉시 반응, 하이라이트는 상시 영업 페이지로 역할을 나눈다.",
            "fill": LIGHT_ORANGE,
            "accent": MINERAL,
            "settings": [
                ["피드", "5~7장 캐러셀: 문제→체크리스트→증거→CTA", "저장·공유"],
                ["스토리", "설문·질문 스티커 + 데모 클립 + 링크", "답장·링크 탭"],
                ["하이라이트", "EN: Demo/Evidence/RFQ/Pricing; KR: 사용법/1688/이미지/베타", "하이라이트 조회"],
                ["프로필", "Business 계정·Contact·언어별 bio link", "프로필→사이트"],
                ["검색 노출", "공개 프로 계정의 캡션에 검색 문구 자연 삽입", "검색 유입"],
            ],
            "content": [
                "캐러셀 제목: ‘Korean OEM에 첫 RFQ 보내기 전 7가지’.",
                "공급사 카드 스크린샷에는 개인정보·민감한 연락처를 가린다.",
                "Story에서 ‘어떤 카테고리를 찾고 있나요?’를 묻고 답변을 콘텐츠 백로그로 전환한다.",
                "프로필 하이라이트에 면책과 거래 전 확인 체크리스트를 고정한다.",
            ],
            "kr_title": "KR Carousel 6장",
            "kr_lines": [
                "1. 1688 공급사, 가격만 보면 안 되는 이유",
                "2. 공장인지 무역상인지",
                "3. MOQ가 SKU·색상·포장별인지",
                "4. 견적에 금형·인쇄·운송이 포함되는지",
                "5. 회사명·계좌명·샘플 조건이 일치하는지",
                "6. 비교 후보군 만들기 → 글로소스 AI 무료 베타",
            ],
            "en_title": "EN Carousel 6 slides",
            "en_lines": [
                "1. Before you contact a Korean OEM",
                "2. Manufacturer of record—or broker?",
                "3. MOQ by SKU, formula, and packaging",
                "4. Certificate number, scope, issuer, expiry",
                "5. Company name on quote, bank account, and export docs",
                "6. Build a research shortlist → glosourceai.com/en",
            ],
            "check": [
                "한 장에 문장 2개를 넘기지 않는가?",
                "첫 장은 질문 또는 구체적 숫자·상황인가?",
                "하이라이트의 링크와 최신 플랜·무료 사용량이 일치하는가?",
                "DM 저장 답변에 ‘보증 아님’ 경계가 포함되는가?",
            ],
        },
        {
            "title": "12. Facebook",
            "role": "그룹 교육 + Meta 리타게팅 기반",
            "principle": "페이지는 신뢰 허브, 그룹은 교육과 대화, Reels는 도달로 쓴다. 동일 영상을 무작정 복제하지 말고 Caption과 CTA를 그룹 맥락에 맞춘다.",
            "fill": LIGHT_BLUE,
            "accent": BLUE,
            "settings": [
                ["페이지", "Instagram Business와 연결, 소개·웹사이트·메시지 설정", "페이지 방문·메시지"],
                ["영상", "Facebook의 통합 Reels 흐름에 맞춰 세로 원본 사용", "3초·1분 조회"],
                ["그룹", "셀러·수입·K-beauty 그룹 규칙 확인 후 교육형 게시", "댓글·리드"],
                ["크로스포스트", "IG Reels 연동하되 Facebook용 첫 문단 수정", "도달·클릭"],
                ["광고 준비", "Meta Pixel + Conversions API, 이벤트 중복 제거", "검색·가입·구매"],
            ],
            "content": [
                "국내 그룹: ‘1688 견적 비교 체크리스트’와 실제 화면 데모.",
                "해외 그룹: ‘Korean OEM RFQ checklist’와 샘플 리포트.",
                "페이지 고정 게시물: 제품 경계·사용법·언어별 링크.",
                "Messenger 문의에는 카테고리·국가·MOQ·일정 네 질문으로 리드 자격을 확인한다.",
            ],
            "kr_title": "KR Facebook 그룹 글",
            "kr_lines": [
                "“중국 공급사를 찾을 때 같은 양식으로 3곳 이상 비교해보세요: 공장 여부, MOQ, 샘플, 견적 포함 범위, 계좌 명의.”",
                "“제품 사진이나 브리프가 있다면 글로소스 AI 무료 베타로 첫 후보군을 만들 수 있습니다.”",
                "“제가 만든 도구이며 거래를 중개하거나 공급사를 보증하지 않습니다.”",
            ],
            "en_title": "EN Facebook group post",
            "en_lines": [
                "“If you’re sourcing a Korean OEM for the first time, compare the same written questions across at least three candidates.”",
                "“I build GloSource AI, which organizes supplier candidates, public evidence, and an editable RFQ. It is a research tool—not an audit.”",
                "“If group rules allow, here is a free starting point: [EN UTM link].”",
            ],
            "check": [
                "그룹 규칙상 자기홍보·링크가 허용되는가?",
                "Instagram과 동일 게시물이라도 첫 문단을 Facebook 독자에 맞췄는가?",
                "메시지 문의를 영업 기록에 남길 필드가 준비됐는가?",
                "유료 캠페인 전 Pixel/CAPI 이벤트가 중복 없이 검증됐는가?",
            ],
        },
        {
            "title": "13. LinkedIn",
            "role": "B2B 의사결정자 + 직접 아웃바운드",
            "principle": "회사 페이지는 신뢰를 만들고, 대표 개인 계정은 관점과 대화를 만든다. cold DM은 업계가 아니라 ‘탐색 의도’가 확인된 사람에게만 보낸다.",
            "fill": LIGHT_GREEN,
            "accent": GREEN,
            "settings": [
                ["페이지", "Website·Industry·Tagline·설명 완성", "검색 노출·방문"],
                ["CTA", "가능하면 custom button을 EN 무료 검색 또는 샘플로 연결", "버튼 클릭"],
                ["콘텐츠", "대표 관점 2회/주 + 제품 증거 1회/주", "댓글·CTR"],
                ["아웃바운드", "강한 의도 리드만 1차+1회 후속", "긍정 답변율"],
                ["분석", "직무·산업·지역·CTR·참여율 확인", "ICP 도달률"],
            ],
            "content": [
                "개인 계정: 제조사와 중개상을 구분하며 배운 실제 교훈.",
                "회사 페이지: 샘플 리포트·제품 데모·체크리스트.",
                "리드 탐색: ‘exploring Korean OEM’, 신제품 런칭, 신규 구매 역할 같은 신호.",
                "첫 DM에서 가격을 팔지 말고 카테고리에 맞는 샘플 한 개를 제안한다.",
            ],
            "kr_title": "KR LinkedIn 메시지",
            "kr_lines": [
                "“안녕하세요 [이름]님. [회사/제품]의 해외 소싱 업무를 보고 연락드렸습니다.”",
                "“1688·Alibaba 후보를 비교할 때 공장 여부·MOQ·견적 범위를 정리하는 데 시간이 드신다면, [품목] 기준 무료 샘플 리포트를 만들어드릴 수 있습니다.”",
                "“필요하시면 ‘[품목]’이라고만 답 주세요. 베타 피드백 한 가지만 여쭙겠습니다.”",
            ],
            "en_title": "EN LinkedIn first touch",
            "en_lines": [
                "“Hi [First name]—saw you’re exploring [category] for [brand]. Quick question: how are you handling the manufacturer-vs-trader problem when sourcing a Korean OEM?”",
                "“I can send a free one-page [category] sample report with candidate signals, MOQ context, risk notes, and an editable RFQ. Want the [category] version?”",
            ],
            "check": [
                "한국 소싱 탐색 의도가 실제 게시물·역할·런칭에서 확인되는가?",
                "대형 유통사·소싱 에이전시·한국 제조사를 제외했는가?",
                "첫 메시지 CTA가 샘플 하나로 제한됐는가?",
                "3~4일 후 1회만 후속하고 거절·무응답을 존중하는가?",
            ],
        },
    ]
    for channel in channels:
        add_channel_section(doc, channel)

    # 14 Scripts
    h1(doc, "14. 공통·기본 영업 스크립트")
    h2(doc, "공통 30초 영상 골격")
    add_table(
        doc,
        ["시간", "역할", "문장 공식"],
        [
            ["0–3초", "Hook", "[고객]이 [문제] 때문에 시간을 쓰고 있나요?"],
            ["3–8초", "Pain", "기존에는 [탭/번역/비교/문서]를 수작업으로 해야 합니다."],
            ["8–22초", "Proof", "제품 브리프 → 후보 → 출처/위험 → RFQ 화면"],
            ["22–27초", "Boundary", "첫 리서치 도구이며 거래·품질 보증이 아닙니다."],
            ["27–32초", "CTA", "[KR 또는 EN 링크]에서 첫 검색을 시작하세요."],
        ],
        [1320, 1800, 6240],
        font_size=8.8,
    )
    h2(doc, "공통 소개 문구")
    add_script_box(
        doc,
        "한국어 한 줄",
        ["글로소스 AI는 제품 브리프나 이미지를 바탕으로 해외 공급사 후보와 비교 근거를 정리하는 1차 소싱 리서치 도구입니다."],
        "KR",
    )
    add_script_box(
        doc,
        "English one-liner",
        ["GloSource AI helps global buyers research Korean supplier candidates with public source evidence, risk signals, MOQ context, and an editable English RFQ."],
        "EN",
    )
    h2(doc, "KR 기본 세일즈 콜 스크립트")
    add_script_box(
        doc,
        "5분 Discovery",
        [
            "오프닝: “어떤 품목을 어느 국가에서 찾고 계시고, 현재 가장 시간이 많이 드는 단계가 어디인가요?”",
            "진단: “후보 찾기 / 공장 여부 / 가격·MOQ / 연락·RFQ / 검품 중 어디가 병목인가요?”",
            "데모: 고객 품목으로 검색하고 후보 2개만 비교한다.",
            "경계: “저희는 거래 중개나 공장 감사를 대신하지 않고, 첫 후보군과 확인 질문을 정리합니다.”",
            "다음 단계: “이 결과가 실무에 도움이 된다면 다음 검색도 사용해보시고, 빠진 비교 항목 하나만 알려주세요.”",
        ],
        "KR",
    )
    h2(doc, "EN 기본 세일즈 콜 스크립트")
    add_script_box(
        doc,
        "10-minute demo",
        [
            "“What product are you trying to source from Korea, and what makes the first shortlist difficult today?”",
            "“Do you already have direct factory relationships, or are you still exploring candidates?”",
            "Run one live search and inspect source links, registry evidence, risk notes, MOQ context, and the editable RFQ.",
            "“This is first-pass research. You still confirm capacity, samples, compliance, commercial terms, and payment details directly.”",
            "“Would you like the search output or a category sample report after this call?”",
        ],
        "EN",
    )
    h2(doc, "Cold email")
    add_script_box(
        doc,
        "EN first touch",
        [
            "Subject: quick question on your Korean [category] sourcing",
            "Hi [First name],",
            "I saw that [brand] is [specific intent signal]. The time-consuming part of Korean OEM sourcing is often separating manufacturers from traders, comparing public evidence, and writing an RFQ that gets a useful reply.",
            "I made a free one-page [category] sample report with supplier-candidate signals, MOQ context, risk notes, and an editable RFQ. It’s a research shortcut—not an audit.",
            "Want me to send the [category] version? Just reply “[category].”",
            "[Name] · GloSource AI · https://glosourceai.com/en",
        ],
        "EN",
    )
    add_script_box(
        doc,
        "KR 제휴/베타 메일",
        [
            "제목: [품목] 중국 소싱 후보 비교 베타 제안",
            "안녕하세요 [이름]님. [회사/제품]에서 해외 공급사를 탐색하시는 것으로 보여 연락드렸습니다.",
            "글로소스 AI는 제품명·수량 또는 이미지를 바탕으로 1688·Alibaba 등의 후보를 비교하고, 가격·MOQ·위험 신호·RFQ 초안을 정리하는 무료 베타입니다.",
            "[품목]으로 실제 검색 리포트를 만들어드리고, 실무에서 빠진 항목 한 가지만 피드백 받고 싶습니다. 받아보시겠어요?",
        ],
        "KR",
    )
    h2(doc, "문의 응답 공통")
    add_table(
        doc,
        ["상황", "답변"],
        [
            ["‘검증된 업체인가요?’", "공개 원장·출처와 일치 여부를 근거로 보여드리지만, 품질·납기·계좌·거래 안전까지 보증하는 검증 서비스는 아닙니다."],
            ["‘MOQ가 정확한가요?’", "공개 정보와 검색 맥락을 바탕으로 한 참고값입니다. SKU·포장·커스텀 범위에 따라 달라지므로 RFQ에서 재확인하세요."],
            ["‘대신 연락해주나요?’", "현재는 연락 대행보다 후보 조사와 수정 가능한 RFQ 초안 제공에 집중합니다."],
            ["‘왜 결과가 없나요?’", "근거 URL이나 품질 기준을 충족하지 못한 후보를 억지로 보여주지 않습니다. 브리프를 구체화해 다시 검색해보세요."],
        ],
        [2340, 7020],
        font_size=8.7,
    )

    # 15 Calendar
    h1(doc, "15. 30일 실행 캘린더")
    add_callout(
        doc,
        "현실적인 운영량",
        "1인 팀 기준 주 2개 원본 검색을 만들고, 각각을 영상 3개·텍스트 4개·커뮤니티 답변 2개로 재가공한다. "
        "채널 수보다 실제 증거와 응답 속도를 우선한다.",
        LIGHT_GREEN,
        GREEN,
    )
    add_table(
        doc,
        ["주차", "EN 상용 퍼널", "KR 베타 퍼널", "영업 행동"],
        [
            ["1주", "K-beauty OEM 데모 2건; Shorts/Reels/TikTok", "1688 이미지 검색 데모 1건", "ICP 리드 20명 조사, 직접 발송 5건"],
            ["2주", "Registry evidence 교육 캐러셀; Reddit 3답변", "MOQ·견적 비교 체크리스트", "샘플 리포트 요청자 24시간 내 응답"],
            ["3주", "RFQ 작성 데모; LinkedIn/X mini-thread", "중국어 없이 후보 찾기 데모", "강한 의도 리드 5건 + 1회 후속"],
            ["4주", "Best-performing Hook 재제작; case-study 후보", "베타 피드백 요약", "전환 리뷰, 다음 달 카테고리 결정"],
        ],
        [1080, 2880, 2880, 2520],
        font_size=8.4,
    )
    h2(doc, "주간 리듬")
    add_table(
        doc,
        ["요일", "제작·게시", "커뮤니티·영업"],
        [
            ["월", "실제 검색 1건 녹화, 스크립트 3종", "지난주 지표·리드 검토"],
            ["화", "LinkedIn + Threads 통찰", "의도 기반 리드 3~5명 접촉"],
            ["수", "Shorts + Reels + TikTok", "댓글·DM 24시간 내 응답"],
            ["목", "Instagram carousel + Facebook", "Reddit/그룹 교육 답변"],
            ["금", "X mini-thread + Story Q&A", "후속 1회, 사례 후보 정리"],
            ["주말", "Evergreen 재편집 1개", "다음 주 제품·키워드 선정"],
        ],
        [1200, 4080, 4080],
        font_size=8.5,
    )
    h2(doc, "첫 30일 목표")
    for text in [
        "원본 검색 증거 8건",
        "숏폼 영상 12~16개",
        "교육형 텍스트/캐러셀 16개",
        "고의도 커뮤니티 답변 12개",
        "강한 의도 리드 직접 접촉 20건 이하",
        "샘플 리포트 요청·첫 검색·RFQ 복사 등 행동 데이터 확보",
    ]:
        add_bullet(doc, text)

    # 16 Metrics
    h1(doc, "16. 전환 측정과 UTM")
    add_body(
        doc,
        "조회수는 콘텐츠 신호일 뿐 영업 성과가 아니다. KR과 EN을 분리하고, 게시물 단위 UTM을 사용해 검색·가입·결제까지 연결한다."
    )
    add_table(
        doc,
        ["단계", "KR 핵심 이벤트", "EN 핵심 이벤트"],
        [
            ["획득", "세션, 콘텐츠별 랜딩 방문", "/en 세션, 콘텐츠별 랜딩 방문"],
            ["활성", "검색 시작·완료", "sign_up, 이메일 인증, 첫 검색"],
            ["가치", "후보 상세, 리포트/공유, 재검색", "공급사 상세, RFQ/export 사용"],
            ["전환", "가입·대기자", "begin_checkout, purchase"],
            ["유지", "7일/30일 재검색", "30일 유료 유지, USD MRR"],
        ],
        [1320, 4020, 4020],
        font_size=8.6,
    )
    h2(doc, "UTM 표준")
    add_table(
        doc,
        ["필드", "규칙", "예시"],
        [
            ["utm_source", "플랫폼별 소문자 고정", "youtube, instagram, tiktok, reddit, threads, x, facebook, linkedin"],
            ["utm_medium", "organic_social / community / outbound / paid_social", "organic_social"],
            ["utm_campaign", "월-시장-주제", "2026-08-en-kbeauty-oem"],
            ["utm_content", "플랫폼-형식-각도-버전", "reels-demo-manufacturer-v1"],
            ["utm_term", "유료 타깃/키워드가 있을 때만", "korean_sunscreen_oem"],
        ],
        [1680, 3960, 3720],
        font_size=8.5,
    )
    add_script_box(
        doc,
        "EN URL example",
        [
            "https://glosourceai.com/en?utm_source=instagram&utm_medium=organic_social&utm_campaign=2026-08-en-kbeauty-oem&utm_content=reels-demo-manufacturer-v1"
        ],
        "EN",
    )
    add_script_box(
        doc,
        "KR URL example",
        [
            "https://glosourceai.com/?utm_source=youtube&utm_medium=organic_social&utm_campaign=2026-08-kr-china-sourcing&utm_content=shorts-image-search-v1"
        ],
        "KR",
    )
    h2(doc, "주간 대시보드")
    add_table(
        doc,
        ["지표", "정의", "의사결정"],
        [
            ["검색 시작률", "랜딩 세션 중 검색 시작 비율", "낮으면 Hero·CTA·데모 정렬"],
            ["검색 완료율", "시작 대비 결과 도달", "낮으면 브리프·속도·오류 점검"],
            ["가입 전환", "방문/검색 대비 회원 가입", "EN 신뢰·무료 한도 메시지 개선"],
            ["RFQ 사용률", "검색 사용자 중 RFQ 복사/내보내기", "실무 가치가 전달되는지 판단"],
            ["긍정 답변율", "적합 아웃바운드 중 관심 답변", "ICP와 첫 제안 품질 판단"],
            ["유료 전환", "적격 무료 사용자 중 구매", "결제·가격·사용량 점검"],
        ],
        [1740, 3840, 3780],
        font_size=8.4,
    )
    add_callout(
        doc,
        "광고 재개 조건",
        "growth:payments와 growth:acquisition:gate가 모두 통과하고, UTM 테스트 방문이 GA4에서 source/medium/campaign과 search·sign_up·begin_checkout·purchase 이벤트로 확인되어야 한다.",
        LIGHT_ORANGE,
        CAUTION,
    )

    # 17 Guardrails
    h1(doc, "17. 표현·신뢰·운영 가드레일")
    add_table(
        doc,
        ["사용 금지", "대체 표현"],
        [
            ["100% verified Korean suppliers", "Korean supplier candidates with public source evidence"],
            ["Government-approved suppliers", "Government registry match / public data cross-check"],
            ["Guaranteed manufacturers", "Manufacturer signals to review"],
            ["Safe transaction guaranteed", "Risk signals and due-diligence questions"],
            ["정확한 MOQ·가격 보장", "공개 정보 기반 MOQ·가격 맥락; RFQ로 재확인"],
            ["AI가 국가 API로 공급사를 발굴", "AI가 후보를 발굴하고 적용 가능한 정부 원장에 대조"],
        ],
        [4080, 5280],
        font_size=8.6,
    )
    h2(doc, "게시 전 신뢰 체크")
    for text in [
        "실제 고객·매출·성과를 지어내지 않는다.",
        "후기·사례는 허락받은 실제 자료 또는 ‘데모’라고 명시한 샘플만 사용한다.",
        "인증·등록·사업 상태는 서로 다른 증거로 구분한다.",
        "K-Fashion처럼 공개 정부 원장으로 검증할 수 없는 카테고리는 한계를 숨기지 않는다.",
        "공급사 URL과 근거가 없으면 ‘검증됨’이라고 쓰지 않는다.",
        "거래 전 샘플·계약·계좌·규정·검품은 구매자 책임임을 안내한다.",
        "플랫폼 규칙과 광고·브랜디드 콘텐츠 공개 요건을 게시 직전에 확인한다.",
    ]:
        add_bullet(doc, text)
    h2(doc, "운영 리스크")
    add_table(
        doc,
        ["리스크", "통제"],
        [
            ["KR/EN 혼합", "언어별 링크·캠페인·고정글·이벤트를 분리"],
            ["콘텐츠 자동화가 스팸화", "초안 자동화만 사용하고 규칙·맥락·사실은 사람이 검수"],
            ["무료 사용량·가격 노후화", "게시 전 제품 계약 문서와 랜딩을 대조"],
            ["댓글·DM 미응답", "영업시간 내 24시간 SLA, 저장 답변 운영"],
            ["유료 광고 조기 집행", "결제·획득·전환 추적 게이트 통과 전 비용 0"],
            ["가짜 사회적 증거", "실제 사례가 없으면 검색 데모와 방법론을 증거로 사용"],
        ],
        [2760, 6600],
        font_size=8.6,
    )

    # Appendix checklists
    h1(doc, "부록 A. 계정 세팅 체크리스트")
    for text in [
        "브랜드명·로고·도메인을 GloSource AI / glosourceai.com으로 통일",
        "EN bio에 Korean supplier research, public evidence, editable RFQ를 포함",
        "KR bio에 중국 중심 해외 소싱, 1688·Alibaba·WeChat, 무료 베타를 포함",
        "각 프로필 링크에 UTM 적용",
        "Instagram Business ↔ Facebook Page 연결",
        "YouTube 재생목록과 Instagram 하이라이트를 KR/EN로 분리",
        "Threads bio 링크를 EN·KR·샘플·블로그로 구성",
        "LinkedIn Page의 Website·Tagline·Industry·About·CTA 확인",
        "Reddit은 제품 링크보다 계정의 진짜 참여 이력과 커뮤니티 규칙을 우선",
        "2단계 인증·관리자 권한·백업 코드를 안전하게 보관",
    ]:
        add_bullet(doc, text)
    h2(doc, "콘텐츠 게시 체크리스트")
    for text in [
        "표적 고객과 Surface가 한 문장으로 설명되는가?",
        "Hook이 추상적 ‘AI 혁신’이 아니라 실제 문제인가?",
        "실제 화면·출처·체크리스트 중 하나가 있는가?",
        "하나의 CTA만 있는가?",
        "표현 가드레일을 통과했는가?",
        "자막·세로 안전 영역·커버가 확인됐는가?",
        "UTM source/medium/campaign/content가 붙었는가?",
        "댓글·DM 후속 담당과 시간 기준이 있는가?",
    ]:
        add_bullet(doc, text)
    h2(doc, "영업 리드 자격 체크리스트")
    for text in [
        "한국 또는 해외 공급사를 ‘지금 탐색 중’이라는 근거가 있는가?",
        "구매자·리셀러·브랜드·조달 담당자인가?",
        "이미 직접 공급망을 확보한 사업자는 아닌가?",
        "소싱 에이전시·수출 운영사·한국 제조사는 아닌가?",
        "제품 카테고리와 다음 3~6개월의 실행 신호가 있는가?",
        "연락처의 공개 출처와 수신 거부를 기록할 수 있는가?",
    ]:
        add_bullet(doc, text)

    # Sources
    h1(doc, "부록 B. 작성 근거와 공식 참고자료")
    add_body(
        doc,
        "제품·가격·무료 사용량은 2026-07-29 저장소의 GLOSOURCE_PORTFOLIO, GLOSOURCE_KR_OUTBOUND, "
        "GLOSOURCE_EN_INBOUND 계약을 우선 기준으로 삼았다. 아래 플랫폼 자료는 게시 형식과 계정·측정 세팅을 위한 공식 참고자료다."
    )
    sources = [
        ("YouTube Help — Get started creating YouTube Shorts", "https://support.google.com/youtube/answer/10059070"),
        ("YouTube Help — Understand three-minute YouTube Shorts", "https://support.google.com/youtube/answer/15424877"),
        ("TikTok for Business — Creative advertising guide", "https://ads.tiktok.com/business/en/guides/what-is-ad-creative-guide"),
        ("TikTok Business Help — Website data connection setup methods", "https://ads.tiktok.com/help/article/website-data-connection-setup-methods?lang=en"),
        ("Instagram Help — Create Instagram Reels ads", "https://www.facebook.com/help/instagram/546362593027755"),
        ("Instagram Help — Professional accounts", "https://www.facebook.com/help/instagram/138925576505882"),
        ("Meta for Business — Instagram & Facebook Reels ads", "https://www.facebook.com/business/ads/facebook-instagram-reels-ads"),
        ("Meta Newsroom — Making it Easier to Create Videos on Facebook", "https://about.fb.com/news/2025/06/making-it-easier-create-videos-facebook/"),
        ("Meta Newsroom — New Threads features and Insights", "https://about.fb.com/news/2025/03/new-threads-features-more-personalized-experience-you-control/"),
        ("X Business — Organic best practices", "https://business.x.com/en/basics/organic-best-practices"),
        ("Reddit Help — Spam policy", "https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam"),
        ("LinkedIn Help — LinkedIn Page analytics", "https://www.linkedin.com/help/linkedin/answer/a547077/linkedin-page-analytics-overview"),
        ("LinkedIn Help — Add a custom CTA to a Page", "https://www.linkedin.com/help/linkedin/answer/a6249073"),
        ("Google Analytics Help — UTM URL builders and best practices", "https://support.google.com/analytics/answer/10917952"),
        ("Meta Business Help — Conversions API", "https://www.facebook.com/business/help/AboutConversionsAPI"),
    ]
    for label, url in sources:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(5)
        add_hyperlink(p, label, url)
    add_body(
        doc,
        "주의: 플랫폼 기능·정책·노출 방식은 변경될 수 있다. 실제 게시·광고 집행 직전에 각 공식 도움말과 커뮤니티별 규칙을 다시 확인한다.",
        color=MUTED,
        italic=True,
    )

    # Closing
    h1(doc, "결론: 하나의 증거, 두 개의 시장, 각기 다른 문법")
    add_body(
        doc,
        "GloSource AI의 영업 성패는 ‘얼마나 많은 채널에 올렸는가’보다 ‘누구의 어떤 문제를 실제 근거로 얼마나 명확히 보여줬는가’에 달려 있다. "
        "EN은 한국 공급사를 처음 찾는 해외 바이어에게 공공 근거와 RFQ를 팔고, KR은 중국 소싱을 시작하는 국내 실무자에게 비교 가능한 첫 후보군을 제공한다."
    )
    add_callout(
        doc,
        "다음 행동",
        "이번 주 실제 검색 2건을 선정한다. 각 검색을 30초 영상, 캐러셀, LinkedIn/Threads/X 통찰, Reddit 답변, DM 샘플로 재가공하고 "
        "서로 다른 UTM으로 배포한다. 7일 뒤 조회수가 아니라 검색·가입·RFQ·긍정 답변을 기준으로 다음 주제를 결정한다.",
        LIGHT_GREEN,
        GREEN,
    )

    # Document metadata.
    props = doc.core_properties
    props.title = "글로소스 AI SNS 영업 백서"
    props.subject = "KR·EN 이중 퍼널과 플랫폼별 맞춤 영업 실행안"
    props.author = "GloSource AI"
    props.keywords = "GloSource AI, SNS, Sales, KR, EN, Shorts, Reels, TikTok, Reddit"
    props.comments = "Generated from repository product contracts and official platform references."

    doc.save(OUT_PATH)
    print(os.path.abspath(OUT_PATH))
    return OUT_PATH


if __name__ == "__main__":
    build_document()
