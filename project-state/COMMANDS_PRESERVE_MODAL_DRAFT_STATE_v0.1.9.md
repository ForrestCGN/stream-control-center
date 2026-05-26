# Commands Dashboard v0.1.9 — Preserve Modal Draft State

## Zweck
Fix fuer den Command-Modal-Editor: Beim Auswaehlen eines Mediums ueber den MediaPicker duerfen ungespeicherte Formularwerte nicht verloren gehen.

## Fix
- Modal-Entwurf wird vor MediaPicker-Auswahl/Action-Wechsel synchronisiert.
- Trigger, Aliase, Rechte, Cooldowns, Aktiv-Status und technische Felder bleiben erhalten.
- Sound-/Video-Auswahl aktualisiert nur die Medien-/Routing-Daten.
- Speichern synchronisiert den aktuellen Entwurf erneut vor dem API-Request.

## Betroffene Datei
- htdocs/dashboard/modules/commands.js

## Keine Aenderung
- Keine DB-Migration.
- Keine Backend-Aenderung.
- Keine bestehende Funktionalitaet entfernt.
