#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Structural QA for the generated GloSource AI sales whitepaper."""

from __future__ import annotations

import json
import os
import zipfile

from docx import Document
from docx.oxml.ns import qn


DOCX_PATH = os.path.join(
    "docs", "whitepapers", "GloSource_AI_SNS_영업_백서_KR_EN.docx"
)
REPORT_PATH = os.path.join("C:\\tmp", "glosource-whitepaper-structural-audit.json")


def integer_attr(element, name):
    value = element.get(qn(name))
    return int(value) if value is not None else None


def main():
    checks = []

    def check(name, passed, detail):
        checks.append({"name": name, "passed": bool(passed), "detail": detail})

    with zipfile.ZipFile(DOCX_PATH) as archive:
        bad = archive.testzip()
        names = set(archive.namelist())
        check("zip_integrity", bad is None, f"bad_member={bad}")
        check(
            "required_parts",
            {
                "[Content_Types].xml",
                "word/document.xml",
                "word/styles.xml",
                "word/numbering.xml",
                "word/_rels/document.xml.rels",
            }.issubset(names),
            f"parts={len(names)}",
        )
        xml_text = archive.read("word/document.xml").decode("utf-8")
        numbering_text = archive.read("word/numbering.xml").decode("utf-8")
        rels_text = archive.read("word/_rels/document.xml.rels").decode("utf-8")

    doc = Document(DOCX_PATH)
    full_text = "\n".join(p.text for p in doc.paragraphs)
    full_text += "\n" + "\n".join(
        cell.text
        for table in doc.tables
        for row in table.rows
        for cell in row.cells
    )
    headings = [
        p.text
        for p in doc.paragraphs
        if p.style and p.style.name.startswith("Heading")
    ]

    expected = [
        "01. 제품 포트폴리오와 영업 전제",
        "02. KR·EN 고객과 구매동기",
        "03. 핵심 가치제안과 증거 설계",
        "04. 공통 콘텐츠 생산 시스템",
        "05. YouTube Shorts",
        "06. Instagram Reels",
        "07. TikTok",
        "08. Reddit",
        "09. Threads",
        "10. X",
        "11. Instagram 피드·스토리",
        "12. Facebook",
        "13. LinkedIn",
        "14. 공통·기본 영업 스크립트",
        "15. 30일 실행 캘린더",
        "16. 전환 측정과 UTM",
        "17. 표현·신뢰·운영 가드레일",
    ]
    missing = [item for item in expected if item not in headings]
    check("required_sections", not missing, f"missing={missing}")
    check("content_volume", len(full_text) > 20000, f"characters={len(full_text)}")
    check("paragraph_count", len(doc.paragraphs) > 180, f"paragraphs={len(doc.paragraphs)}")
    check("table_count", 20 <= len(doc.tables) <= 30, f"tables={len(doc.tables)}")

    required_terms = [
        "숏츠",
        "릴스",
        "틱톡",
        "레딧",
        "쓰레드",
        "인스타그램",
        "페이스북",
        "국내 업체 대상 영업",
        "해외 바이어",
        "공통 30초 영상 골격",
        "UTM 표준",
        "30일 실행 캘린더",
    ]
    missing_terms = [term for term in required_terms if term not in full_text]
    check("user_requirements_coverage", not missing_terms, f"missing={missing_terms}")

    dangerous_claims = [
        "100% verified Korean suppliers.",
        "Government-approved suppliers.",
        "Guaranteed safe manufacturers.",
        "We guarantee supplier quality.",
    ]
    present_claims = [claim for claim in dangerous_claims if claim in full_text]
    check("no_live_dangerous_claims", not present_claims, f"present={present_claims}")
    check(
        "current_en_free_contract",
        "이메일 인증 회원 월 3회" in full_text and "5 free anonymous searches" not in full_text,
        "EN free contract language audited",
    )

    section = doc.sections[0]
    geometry = {
        "page_width": section.page_width,
        "page_height": section.page_height,
        "top_margin": section.top_margin,
        "bottom_margin": section.bottom_margin,
        "left_margin": section.left_margin,
        "right_margin": section.right_margin,
    }
    geometry_ok = (
        section.page_width == 7772400
        and section.page_height == 10058400
        and section.left_margin == 914400
        and section.right_margin == 914400
    )
    check("page_geometry", geometry_ok, geometry)

    table_errors = []
    for ti, table in enumerate(doc.tables):
        tbl_pr = table._tbl.tblPr
        tbl_w = tbl_pr.find(qn("w:tblW"))
        tbl_ind = tbl_pr.find(qn("w:tblInd"))
        grid = table._tbl.tblGrid
        grid_widths = [integer_attr(col, "w:w") for col in grid.findall(qn("w:gridCol"))]
        if tbl_w is None or integer_attr(tbl_w, "w:w") != 9360:
            table_errors.append(f"table {ti}: tblW")
        if tbl_ind is None or integer_attr(tbl_ind, "w:w") != 120:
            table_errors.append(f"table {ti}: tblInd")
        if sum(x or 0 for x in grid_widths) != 9360:
            table_errors.append(f"table {ti}: grid={grid_widths}")
        for ri, row in enumerate(table.rows):
            if len(row.cells) != len(grid_widths):
                table_errors.append(f"table {ti} row {ri}: cell/grid mismatch")
                continue
            for ci, cell in enumerate(row.cells):
                tc_w = cell._tc.get_or_add_tcPr().find(qn("w:tcW"))
                if tc_w is None or integer_attr(tc_w, "w:w") != grid_widths[ci]:
                    table_errors.append(f"table {ti} row {ri} cell {ci}: tcW")
    check("table_geometry", not table_errors, table_errors[:20])

    hyperlink_count = rels_text.count("relationships/hyperlink")
    check("official_source_links", hyperlink_count >= 15, f"hyperlinks={hyperlink_count}")
    check(
        "real_numbering_part",
        "<w:num " in numbering_text and 'w:numFmt w:val="bullet"' in numbering_text,
        "numbering.xml contains decimal and bullet definitions",
    )
    check(
        "no_fake_bullets",
        not any(p.text.lstrip().startswith(("• ", "● ", "- ")) for p in doc.paragraphs),
        "paragraph text inspected",
    )
    check(
        "metadata",
        doc.core_properties.title == "글로소스 AI SNS 영업 백서",
        {
            "title": doc.core_properties.title,
            "author": doc.core_properties.author,
        },
    )

    report = {
        "document": os.path.abspath(DOCX_PATH),
        "file_size": os.path.getsize(DOCX_PATH),
        "passed": all(item["passed"] for item in checks),
        "checks": checks,
    }
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
