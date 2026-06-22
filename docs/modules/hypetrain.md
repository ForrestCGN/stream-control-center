# HypeTrain-Modul – aktueller Stand HT3.3.1

Version Backend: `0.2.3`
Build Backend: `STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`
Dashboard-Step: `HT3.3.1_HYPETRAIN_DASHBOARD_EVENT_ACTIONS_TAB`

## Aktueller Stand

- HypeTrain-Ende schreibt über das Tagebuch-System.
- Discord sichtbarer Name kommt vom Tagebuch-Webhook (`CGN Posty`).
- Direkt-Discord bleibt deaktiviert/skipped.
- Rekord-Sound bleibt deaktiviert/skipped, solange nicht konfiguriert.
- Event-Actions für Start, Stufenaufstieg, Ende und Rekord sind backendseitig vorbereitet.
- Sound-Aufrufe laufen ausschließlich über `sound_system` (`/api/sound/play`).
- Overlay-Events sind vorbereitet.
- HypeTrain-Overlay kann sich registrieren und Heartbeat senden.
- Dashboard-Event-Actions liegen ab HT3.3.1 in einem eigenen Tab `Event-Actions`.

## Dashboard

Im HypeTrain-Modul gibt es jetzt getrennte Tabs:

- Übersicht
- Config
- Event-Actions
- Texte
- Statistik
- Tests

Der Tab `Event-Actions` enthält Start, Stufenaufstieg, Ende und Rekord mit Sound-/Overlay-Schaltern, Media-Auswahl und Dry-Run.

## Wichtig

Alles bleibt standardmäßig deaktiviert. Aktivieren speichert nur Config und löst keine produktive Aktion aus.


## HT3.3.3 Dashboard-Fix

Event-Actions sind ein eigener Tab-only Bereich. Der Block wird nicht mehr unten an die Übersicht gehängt. Backend bleibt unverändert.
