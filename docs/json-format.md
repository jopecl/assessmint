# Test JSON format

The mock tests in `sets/` and the tests users load on "Your tests" share the same format.

```json
{
  "title": "My test 1",
  "note": "Optional one-line description",
  "level": "realistic",
  "sections": {
    "NR":  { "minutes": 10, "contexts": { "g1": { "md": "table or text", "chart": { } } }, "questions": [ ] },
    "CT":  { "questions": [ ] },
    "WwD": { "questions": [ ] },
    "VR":  { "questions": [ ] }
  }
}
```

- `level` is only used in `sets/` (`realistic` or `challenging`). Sets in `sets/` also need a unique `id`.
- Sections: `NR` (12 questions, 10 min), `CT` (16, 12 min), `WwD` (12, 10 min), `VR` (15, 10 min). `minutes` overrides the default time.
- `contexts`: text, tables or charts shared by several questions (referenced with `ctx`).

## Question

```json
{
  "type": "Table",
  "ctx": "g1",
  "stem": "Question text in markdown",
  "options": ["...", "...", "...", "...", "..."],
  "answer": "B",
  "multi": false,
  "chart": { },
  "explain": "Short worked solution"
}
```

- `answer`: one letter, or several (`"ACD"`) with `"multi": true` for "Select all that apply".
- Supported markdown: `**bold**`, `*italic*`, lists with `- ` and tables with `|`.

## Chart

```json
{ "type": "line", "title": "Users (k)", "categories": ["Jan", "Feb"], "series": [{ "name": "X", "values": [40, 44] }], "unit": "%", "yMin": 0, "note": "Text under the chart" }
```

`type`: `line`, `bar` or `stacked` (100% stacked bars; each category's values must add up to 100).
