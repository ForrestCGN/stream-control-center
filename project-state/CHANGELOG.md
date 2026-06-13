# CHANGELOG – stream_events / Event-System

Stand: 2026-06-13

## EVS-22c – Completion Documentation

- EVS-22b als bestätigt dokumentiert.
- Doku korrigiert: Dashboard-Löschen nutzt genau eine normale Bestätigung.
- Doku korrigiert: keine `DELETE`-Eingabe und keine doppelte Bestätigung im Dashboard.
- Nächster Schritt EVS-23 als Live-Schalter-Konzept Dashboard Prep festgehalten.

## EVS-22b – Dashboard Single Delete Confirm UX

- Dashboard-Tab `Sicherheit` ergänzt.
- ChatOutput Safety View ergänzt.
- TESTMODUS/LIVE AKTIV sichtbar gemacht.
- Dispatcher-Blockiergründe streamerfreundlich angezeigt.
- Output-Preview als Dry-Run angezeigt.
- Event-Lifecycle-Regeln sichtbar gemacht.
- Archivieren nur bei `finished` als UI-Regel.
- Löschen im Dashboard auf eine normale Bestätigung ohne Texteingabe umgestellt.
- Keine direkte Twitch-Ausgabe aktiviert.
- Kein Sound-Playback aktiviert.

## EVS-21 – Event Archive/Delete Lifecycle Prep

- Archive/Delete-Routen vorbereitet und fachlich bestätigt.
- Archivieren nur bei `finished`.
- Löschen mit JSON-Body `{ "confirm": "DELETE" }`.

## EVS-20 – ChatOutput Dispatcher Prep

- ChatOutput-Status/Report/Test-Dispatch vorbereitet.
- Alle Outputs bleiben blockiert/prepared-only.

## EVS-19e – Sound/Text Parallel AND Runtime

- Eine Chatnachricht wird für Sound UND Text geprüft.
- Doppel-Treffer bestätigt.
