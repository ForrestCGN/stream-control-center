# CURRENT_STATUS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-23b – Completion Documentation

## Aktueller Stand

```text
MODULE_VERSION: 0.5.17
MODULE_BUILD: STEP_EVS_23_LIVE_SWITCH_CONCEPT_DASHBOARD_PREP
```

## Bestätigt bis EVS-23b

- EVS-19e: Sound/Text Parallel-UND-Regel fachlich bestätigt. Eine Chatnachricht kann Sound UND Text lösen.
- EVS-20: ChatOutput Dispatcher Prep bestätigt. Outputs werden gefunden, geprüft und blockiert.
- EVS-21: Event Archive/Delete Lifecycle bestätigt.
- EVS-22b: Dashboard Safety View bestätigt.
  - Tab `Sicherheit` ist vorhanden.
  - TESTMODUS/LIVE AKTIV ist sichtbar.
  - ChatOutput-Zähler und Blockiergründe sind sichtbar.
  - Event-Lifecycle-Regeln sind sichtbar.
  - Löschen im Dashboard nutzt genau eine normale Bestätigung ohne Texteingabe.
- EVS-23: Live-Schalter-Konzept im Dashboard bestätigt.
  - Bereich `Live-Schalter Konzept` ist im Tab `Sicherheit` sichtbar.
  - Statusbadge `gesperrt` ist sichtbar.
  - Hinweis `EVS-23 bleibt Testmodus` ist sichtbar.
  - Geplante Freigabe-Kette ist sichtbar.
  - Aktuelle Schutzschalter sind nur Anzeige/deaktiviert.

## Weiterhin NICHT produktiv aktiv

- Keine direkte Twitch-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Kein echter Live-Sendeschalter aktiv.

## Nächste Entscheidung

EVS-24 sollte bewusst gewählt werden:

1. Rollen-/Audit-/Config-Endpoint für spätere Live-Schalter vorbereiten.
2. ChatOutput-Dry-Run-Vorschau/Preview weiter verbessern.

Vor echtem Live-Senden ist erneut eine explizite Entscheidung nötig.
