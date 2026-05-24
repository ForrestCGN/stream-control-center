# Module Versioning Display Standard

## Verbindlicher Standard

Für das gesamte `stream-control-center` gilt:

```text
Module / Code / API / UI:
- sichtbar nur Versionsnummern verwenden
- keine sichtbaren STEP-Angaben
- keine Anzeigen im Muster `vX / STEP...`

STEPs:
- nur für Doku, Projektstand, Changelog, ZIP-Namen und Übergaben
```

Neue oder überarbeitete Modul-Meta-Daten sollen `version` verwenden. STEP-Bezüge bleiben in Projektdateien, Changelogs und ZIP-Namen.


## STEP278W Hinweis

Diagnosefelder wie `timing`, `moduleVersion` oder Runtime-Stats dürfen in APIs angezeigt werden. STEP-Bezeichnungen bleiben weiterhin nur in Doku, Projektstand, Changelog und ZIP-Namen.
