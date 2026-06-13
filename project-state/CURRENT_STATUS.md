# CURRENT_STATUS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-23 – Live-Schalter-Konzept Dashboard Prep

## Aktueller Stand

```text
MODULE_VERSION: 0.5.17
MODULE_BUILD: STEP_EVS_23_LIVE_SWITCH_CONCEPT_DASHBOARD_PREP
```

## Bestätigt bis EVS-22c

- EVS-19e: Sound/Text Parallel-UND-Regel fachlich bestätigt. Eine Chatnachricht kann Sound UND Text lösen.
- EVS-20: ChatOutput Dispatcher Prep bestätigt. Outputs werden gefunden, geprüft und blockiert.
- EVS-21: Event Archive/Delete Lifecycle bestätigt.
- EVS-22b: Dashboard Safety View bestätigt.
  - Tab `Sicherheit` ist vorhanden.
  - TESTMODUS/LIVE AKTIV ist sichtbar.
  - ChatOutput-Zähler und Blockiergründe sind sichtbar.
  - Event-Lifecycle-Regeln sind sichtbar.
  - Löschen im Dashboard nutzt genau eine normale Bestätigung ohne Texteingabe.

## Neu in EVS-23

- Dashboard-Bereich `Live-Schalter Konzept` im Tab `Sicherheit` ergänzt.
- Geplante spätere Freigabe-Kette sichtbar gemacht.
- Aktuelle Schutzschalter als deaktivierte Checkboxen dargestellt.
- Safety-Tab lädt beim Öffnen den ChatOutput-Sicherheitsstatus.
- Keine Live-Schalter-Aktion eingebaut.

## Weiterhin NICHT produktiv aktiv

- Keine direkte Twitch-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Kein Live-Sendeschalter aktiv.

## Nächster Schritt

EVS-23 im Dashboard prüfen. Danach entscheiden: Rollen-/Audit-/Config-Endpoint vorbereiten oder Dry-Run-Vorschau weiter verbessern.
