# Design System — Maine Records Management System

## Direction

**Who:** State archivists, records officers, agency staff. Government professionals managing physical and digital records — transfers, retention schedules, dispositions, barcode scanning. They need trust and clarity. This is a tool they use daily in an institutional context.

**Personality:** Sophistication & Trust — institutional, authoritative, calm. Like a well-organized archive: ordered, dignified, no clutter.

**Foundation:** Cool (slate-blue). Maine's identity: pine forests, Atlantic coast, granite. The palette references the state seal and flag — deep navy blue and forest pine.

**Depth:** Borders-only. Government tool, density matters. Shadows add visual weight without information.

**Signature:** The "Records lifecycle" workflow bar — a stepped progress indicator unique to records management showing Created → Classified → Stored → Retention → Disposition.

## Tokens

### Spacing
Base: 4px
Scale: 4, 8, 12, 16, 24, 32, 48, 64

### Colors
```
--navy-500: #003366 (primary brand — Maine state blue)
--pine-500: #2E5A3E (secondary — Maine pine green)
--foreground: slate-800 (#1e293b)
--secondary: slate-600 (#475569)
--muted: slate-400 (#94a3b8)
--faint: slate-200 (#e2e8f0)
--surface: white
--canvas: slate-50 (#f8fafc)
--accent: navy-500 (#003366)
--accent-hover: navy-600 (#002e5c)
--success: pine-500 (#2E5A3E)
--warning: amber-500 (#f59e0b)
--destructive: red-600 (#dc2626)
```

### Radius
Scale: 4px (inputs/buttons), 6px (cards), 8px (modals)
Approach: Sharp-to-medium. Institutional, not playful.

### Typography
Font: Inter (system fallback: -apple-system, sans-serif)
Scale: 11 (micro), 12 (label), 13 (small), 14 (base), 16 (subtitle), 18 (section), 24 (page title), 30 (hero)
Weights: 400 (body), 500 (label/emphasis), 600 (heading), 700 (page title)

## Patterns

### Button Primary
- Height: 36px
- Padding: 8px 16px
- Radius: 4px
- Font: 14px, 500 weight
- Background: navy-500
- Hover: navy-600
- Usage: Primary actions (Save, Submit, Create)

### Button Secondary
- Height: 36px
- Padding: 8px 16px
- Radius: 4px
- Font: 14px, 500 weight
- Border: 1px solid slate-300
- Hover: bg-slate-50
- Usage: Secondary actions (Cancel, Edit, Filter)

### Card Default
- Border: 1px solid slate-200
- Padding: 24px
- Radius: 6px
- Background: white
- Usage: Content containers, detail panels

### Sidebar Navigation
- Background: navy-500
- Active item: navy-400 bg, white text
- Inactive: navy-100 text, hover navy-400
- Width: 256px (w-64)

### Data Table
- Header: slate-50 bg, slate-600 text, 12px uppercase
- Row: white bg, border-b slate-100
- Hover: slate-50
- Padding: 12px 16px per cell

### Status Badge
- Radius: 9999px (full pill)
- Padding: 2px 10px
- Font: 12px, 500 weight
- Colors: status-specific bg tints with darker text

### Form Input
- Height: 36px
- Border: 1px solid slate-300
- Radius: 4px
- Focus: ring-2 navy-500, border-navy-500
- Padding: 8px 12px

## Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Navy + Pine palette | Maine state colors — institutional trust, brand recognition for evaluators | 2026-05-25 |
| Borders-only depth | Government records tool — density and clarity over visual flourish | 2026-05-25 |
| 4px spacing base | Allows tight data tables while maintaining readable spacing | 2026-05-25 |
| Inter font | Professional, highly readable at small sizes, excellent for data-heavy UI | 2026-05-25 |
| Sharp radius (4-6px) | Institutional tone — not playful, not harsh | 2026-05-25 |