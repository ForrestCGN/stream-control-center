# STEP192.3.1 - Globaler DB-Portability-Standard

Stand: 2026-05-06

## Zweck

Dieser Doku-STEP ergaenzt die Projektregel, dass MariaDB-Tauglichkeit kuenftig fuer alle Module mitgedacht werden muss.

## Wichtig

Das ist kein aktiver MariaDB-Umbau. SQLite bleibt aktuell die produktive Datenbank und muss weiterhin funktionieren.

## Globale Regel

Fuer alle Module gilt ab jetzt:

- SQLite ist aktuell aktiv und bleibt Standard/Fallback.
- Neue Module und neue DB-Features sollen spaeter MariaDB-tauglich bleiben.
- Neue DB-Zugriffe sollen bevorzugt ueber `backend/core/database.js` oder vorhandene Helper laufen.
- Direkte neue Kopplung an `sqlite_core.js` soll vermieden werden, wenn ein zentraler Core-/Helper-Weg moeglich ist.
- Neue dashboardfaehige Settings sollen ueber `helper_settings.js` oder eine zentrale Settings-Schicht laufen.
- Neue dashboardfaehige Texte sollen ueber `helper_texts.js` oder eine zentrale Text-Schicht laufen.
- SQLite-spezifische SQL-Syntax im Modulcode soll vermieden oder dokumentiert werden.
- MariaDB wird erst aktiv genutzt, wenn der echte Adapter in `backend/core/database.js` implementiert und getestet ist.
- Keine bestehende SQLite-Funktionalitaet darf fuer eine theoretische MariaDB-Vorbereitung gebrochen werden.

## Aktualisierte Dateien

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP192_3_1_GLOBAL_DB_PORTABILITY_STANDARD_2026-05-06.md`

## Keine Codeaenderung

Dieser STEP enthaelt ausschliesslich Doku-Aenderungen.

## Naechster Schritt

Nach dem Commit kann fachlich mit STEP193 SoundAlerts Inbox / Auto Entries weitergearbeitet werden.
