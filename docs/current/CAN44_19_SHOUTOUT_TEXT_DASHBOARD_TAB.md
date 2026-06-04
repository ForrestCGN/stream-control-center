# CAN-44.19 – Shoutout Text Dashboard Tab

Stand: 2026-06-04

## Ziel

Dieser Schritt baut den gemeinsamen Texte-Tab im bestehenden Shoutout-Dashboard ein.

Es wird bewusst **nicht** das komplette Shoutout-Dashboard neu organisiert. Der große Dashboard-Umbau folgt später.

## Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/shoutout_texts.js
htdocs/dashboard/modules/shoutout_texts.css
docs/current/CAN44_19_SHOUTOUT_TEXT_DASHBOARD_TAB.md
docs/current/CAN44_19_README.md
docs/modules/SHOUTOUT_TEXT_DASHBOARD_TAB.md
```

## Änderungen

- Neuer Dashboard-Tab `Texte` im bestehenden Shoutout-System.
- Der Tab wird über ein separates Dashboard-Modul `shoutout_texts.js` ergänzt.
- Neue CSS-Datei `shoutout_texts.css`.
- `index.html` lädt CSS und JS.
- Nutzung der bestehenden Backend-Routen aus CAN-44.18:
  - `GET /api/clip-shoutout/texts`
  - `POST /api/clip-shoutout/texts`
  - `GET /api/clip-shoutout/texts/migration`

## Funktionsumfang

- Kategorien anzeigen:
  - Chat-Shoutout
  - AutoShoutout
  - Offizieller Twitch-Shoutout
  - Dashboard
  - System
- Textkeys je Kategorie anzeigen.
- Aktive Varianten je Textkey als Textarea bearbeiten.
- Eine Variante pro Zeile.
- Speichern über `POST /api/clip-shoutout/texts` mit `action=replaceKeyVariants`.
- Migrations-/Kompatibilitätsstatus anzeigen.

## Keine Änderungen

- Keine Runtime-Umstellung auf `shoutout.*` Keys.
- Alte Config-Texte bleiben Fallback.
- Alte `/api/clip-shoutout/auto/texts` Route bleibt bestehen.
- Kein kompletter Dashboard-Umbau.
- Keine DB-Schemaänderung.

## Tests

```powershell
node -c htdocs\dashboard\modules\shoutout_texts.js
```

Erwartet: keine Ausgabe / Exitcode 0.

Nach Deploy/Node-Neustart im Browser testen:

```text
Dashboard öffnen → Shoutout-System → Tab Texte
```

Dann:

1. Kategorie auswählen.
2. Textkey auswählen.
3. Variante ändern.
4. Speichern.
5. `/api/clip-shoutout/texts` erneut prüfen.

## Nächster Schritt

CAN-44.20 sollte das Shoutout-Dashboard insgesamt neu organisieren:

```text
Übersicht
Chat-Shoutout
AutoShoutout
Queues
Texte
Verlauf
Statistik
Eingehend
Diagnose
Einstellungen
```
