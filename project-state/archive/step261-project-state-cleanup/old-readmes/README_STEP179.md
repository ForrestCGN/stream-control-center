# STEP179 - Unmatched Provider Events ignorieren

## Problem
Ein korrektes Twitch-Follow-Event konnte kurz danach noch einmal als Tipeee-Alert erscheinen, obwohl fuer Tipeee keine passende Follow-Regel aktiv war.

Ursache im Alert-Core: Events ohne passende Regel wurden trotzdem in die Queue gelegt und mit Fallback-Design abgespielt. Dadurch konnte jedes Provider-Event, das /api/alerts/enqueue erreicht, sichtbar werden.

## Fix
- Live-/Provider-Events ohne aktive passende Regel werden nicht mehr abgespielt.
- Sie werden optional als `ignored` in `alert_events` protokolliert.
- Config-Schalter `playUnmatchedAlerts` ist standardmaessig `false`.
- Bestehende Regeln, Designs, Sounds, Chat-Textbloecke und Overlay bleiben unveraendert.

## Betroffene Datei
- backend/modules/alert_system.js

## Einbau
Datei ersetzen, Node neu starten.
