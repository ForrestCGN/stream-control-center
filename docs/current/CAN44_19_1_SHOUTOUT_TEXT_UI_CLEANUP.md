# CAN-44.19.1 – Shoutout Texte UI Cleanup

Stand: 2026-06-04

## Ziel

Der gemeinsame Texte-Tab aus CAN-44.19 wurde optisch und strukturell nachgeschärft, ohne Backend, Datenbank oder Runtime-Verhalten zu ändern.

## Änderungen

- Textarea-Höhe ist kompakter und abhängig von der Anzahl aktiver Varianten.
- `auto_shoutout` wird als Legacy-/Fallback-Kategorie markiert.
- Legacy-Keys erhalten einen sichtbaren Hinweis im Editor.
- Key-Liste und Kategorien sind kompakter.
- Migration/Kompatibilität ist als einklappbarer Diagnoseblock umgesetzt.
- Der gemeinsame Textbereich bleibt im bestehenden Shoutout-Dashboard integriert.

## Betroffene Dateien

- `htdocs/dashboard/modules/shoutout_texts.js`
- `htdocs/dashboard/modules/shoutout_texts.css`
- `docs/current/CAN44_19_1_SHOUTOUT_TEXT_UI_CLEANUP.md`
- `docs/current/CAN44_19_1_README.md`
- `docs/modules/SHOUTOUT_TEXT_DASHBOARD_TAB.md`

## Nicht geändert

- Keine Backend-Änderung.
- Keine DB-Änderung.
- Keine Runtime-Umstellung auf neue `shoutout.*` Keys.
- Keine Änderung an AutoShoutout- oder Chat-Shoutout-Abläufen.

## Test

```powershell
node -c htdocs\dashboard\modules\shoutout_texts.js
```

Erwartung: keine Ausgabe / Syntax OK.
