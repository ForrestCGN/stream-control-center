# CHANGELOG

## CAN-35.4

- Erfolgreiche Sicht- und Stabilitätsprüfung von CAN-35.3 dokumentiert.
- Bestätigt sichtbar:
  - `Tagebuch Read-only Diagnose`
  - `READ-ONLY OK`
  - `Schema 5`
  - `Soll 5`
  - Status OK: ja
  - Schema OK: ja
  - Integration OK: ja
  - DB: ok / sqlite
  - Aktuelle Seite: 36
  - Seitendatum: 2026-06-02
  - Heute lokal: 2026-06-02
  - Nächste Seite: 36
  - Stream aktiv: nein
  - Einträge heute: ja
  - Leer-Hinweis gepostet: nein
  - State: 1
  - Runtime-Events: 265
  - User-Stats: 11
  - Daily-Stats: 42
  - Settings: 20
  - Textvarianten: 17
  - Text-Kategorien: 5
  - Config-Quelle: database_with_json_fallback
- Bestätigt:
  - Eigener Diagnose-Tab.
  - Mehrere getrennte Abschnitte/Karten.
  - Kein Firefox-Hänger gemeldet.
  - Keine Entry-/Stream-/Reset-/Reload-/Admin-POST-Buttons in der Diagnosekarte.
  - Keine produktive Aktion.
- Keine Codeänderung in CAN-35.4.

## CAN-35.3

- Tagebuch-Dashboard Read-only-Diagnosekarte umgesetzt.
- Neue Dateien:
  - `htdocs/dashboard/modules/tagebuch_readonly_diagnostics.js`
  - `htdocs/dashboard/modules/tagebuch_readonly_diagnostics.css`
- `htdocs/dashboard/index.html` lädt CSS/JS.
- Keine Änderung an `backend/modules/tagebuch.js`.
- Keine Änderung an `htdocs/dashboard/modules/tagebuch.js`.

## CAN-35.2

- Tagebuch-Modul-Doku ergänzt:
  - `docs/modules/tagebuch.md`
- Read-only-/Write-Regeln dokumentiert.

## CAN-35.1

- Tagebuch-Modul analysiert.
