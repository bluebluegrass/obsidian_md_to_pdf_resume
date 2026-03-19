#!/usr/bin/env python3
import argparse
import re
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

LEFT = 42
RIGHT = 42
TOP = 34
BOTTOM = 30
BULLET_INDENT = 11
SECTION_BREAK_LINES = 1.0
BASE_SIZE = {
    'name': 17.2,
    'contact': 10.4,
    'section': 10.8,
    'role': 10.0,
    'text': 9.0,
    'bullet': 9.0,
}
BASE_LEAD = {
    'name': 19.2,
    'contact': 12.0,
    'section': 12.0,
    'role': 11.4,
    'text': 10.3,
    'bullet': 10.3,
}
FONTS = {
    'name': 'Times-Bold',
    'contact': 'Times-Roman',
    'section': 'Times-Bold',
    'role': 'Times-Bold',
    'text': 'Times-Roman',
    'bullet': 'Times-Roman',
}
SPACE = {
    'header': 9.5,
    'section': 2.6,
    'role': 2.2,
    'text': 1.3,
    'bullet': 1.0,
}


def normalize_lines(raw_text: str):
    lines = []
    for line in raw_text.splitlines():
        line = re.sub(r'^\s*-\s*###\s+', '### ', line)
        line = re.sub(r'\*\*(.*?)\*\*', r'\1', line)
        line = re.sub(r'__(.*?)__', r'\1', line)
        lines.append(line.rstrip())
    return lines


def parse_resume(raw_text: str):
    lines = normalize_lines(raw_text)
    name = ''
    contact = ''
    items = []
    found_name = False
    awaiting_contact = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith('# '):
            name = stripped[2:].strip()
            found_name = True
            awaiting_contact = True
            continue
        if awaiting_contact:
            if stripped.startswith('## ') or stripped.startswith('### ') or stripped.startswith('- '):
                raise ValueError('Resume is missing a contact line.')
            contact = stripped
            awaiting_contact = False
            continue
        if stripped.startswith('## '):
            items.append(('section', stripped[3:].strip()))
        elif stripped.startswith('### '):
            items.append(('role', stripped[4:].strip()))
        elif stripped.startswith('- '):
            items.append(('bullet', stripped[2:].strip()))
        else:
            items.append(('text', stripped))

    if not name:
        raise ValueError("Resume is missing a '# Name' heading.")
    if not contact:
        raise ValueError('Resume is missing a contact line.')
    if not items:
        raise ValueError('Resume is missing body content.')

    return name, contact, items


def wrap_text(text, font, size, max_width):
    words = text.split()
    if not words:
        return ['']
    wrapped = []
    current = words[0]
    for word in words[1:]:
        candidate = f'{current} {word}'
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
        else:
            wrapped.append(current)
            current = word
    wrapped.append(current)
    return wrapped


def build_layout(name, contact, items, scale, usable_width):
    sizes = {k: v * scale for k, v in BASE_SIZE.items()}
    leads = {k: v * scale for k, v in BASE_LEAD.items()}
    section_break_gap = leads['text'] * SECTION_BREAK_LINES
    elements = [
        ('name', [name], sizes['name'], leads['name'], 0),
        ('contact', [contact], sizes['contact'], leads['contact'], 0),
    ]
    for idx, (kind, text) in enumerate(items):
        max_width = usable_width - BULLET_INDENT if kind == 'bullet' else usable_width
        lines = wrap_text(text, FONTS[kind], sizes[kind], max_width)
        extra_before = section_break_gap if kind == 'section' and idx > 0 else 0
        elements.append((kind, lines, sizes[kind], leads[kind], extra_before))
    return elements, sizes, leads


def measure_height(layout, page_height, scale):
    y = page_height - TOP
    y -= layout[0][3] * len(layout[0][1])
    y -= SPACE['header'] * scale
    y -= layout[1][3] * len(layout[1][1])
    y -= SPACE['header'] * scale
    for kind, lines, _size, lead, extra_before in layout[2:]:
        y -= extra_before
        y -= lead * len(lines)
        y -= SPACE[kind] * scale
    return (page_height - TOP) - y


def choose_scale(name, contact, items, page_width, page_height):
    usable_width = page_width - LEFT - RIGHT
    available_height = page_height - TOP - BOTTOM

    def used(scale):
        layout, _, _ = build_layout(name, contact, items, scale, usable_width)
        return measure_height(layout, page_height, scale)

    lo, hi = 0.70, 1.50
    best = lo
    for _ in range(28):
        mid = (lo + hi) / 2
        if used(mid) <= available_height:
            best = mid
            lo = mid
        else:
            hi = mid

    ratio = used(best) / available_height
    if ratio < 0.94:
        lo2, hi2 = best, min(best * 1.08, 1.50)
        candidate = best
        for _ in range(20):
            mid = (lo2 + hi2) / 2
            current_used = used(mid)
            current_ratio = current_used / available_height
            if current_used <= available_height and current_ratio <= 0.97:
                candidate = mid
                lo2 = mid
            else:
                hi2 = mid
        best = candidate

    if used(best) > available_height:
        raise ValueError('Resume content does not fit on one page.')

    return best


def render_pdf(input_path: Path, output_path: Path):
    name, contact, items = parse_resume(input_path.read_text(encoding='utf-8'))
    page_width, page_height = A4
    usable_width = page_width - LEFT - RIGHT
    scale = choose_scale(name, contact, items, page_width, page_height)
    layout, _, _ = build_layout(name, contact, items, scale, usable_width)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(output_path), pagesize=A4)
    y = page_height - TOP

    for idx, (kind, lines, size, lead, extra_before) in enumerate(layout):
        pdf.setFont(FONTS[kind], size)
        if idx >= 2:
            y -= extra_before
        for line_idx, line in enumerate(lines):
            baseline = y - lead + 2
            if kind in ('name', 'contact'):
                pdf.drawCentredString(page_width / 2, baseline, line)
            elif kind == 'bullet':
                if line_idx == 0:
                    pdf.drawString(LEFT, baseline, u'•')
                pdf.drawString(LEFT + BULLET_INDENT, baseline, line)
            else:
                pdf.drawString(LEFT, baseline, line)
            y -= lead
        y -= SPACE['header'] * scale if kind in ('name', 'contact') else SPACE[kind] * scale

    if y < BOTTOM:
        raise ValueError('Resume content overflowed the page during render.')

    pdf.save()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()

    render_pdf(Path(args.input), Path(args.output))
    print(args.output)


if __name__ == '__main__':
    main()
