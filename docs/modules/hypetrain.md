# HypeTrain-Modul – aktueller Stand HT3.4

Version Backend: `0.2.3`
Build Backend: `STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`
Dashboard-Step: `HT3.4_HYPETRAIN_DASHBOARD_MERGE_CLEANUP`

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

Der Tab `Event-Actions` enthält Start, Stufenaufstieg, Ende und Rekord mit Sound-/Overlay-Schaltern und Media-Auswahl. Test-/Diagnosefunktionen liegen getrennt im Tests-Tab.

## Wichtig

Alles bleibt standardmäßig deaktiviert. Aktivieren speichert nur Config und löst keine produktive Aktion aus.


## HT3.3.3 Dashboard-Fix

Event-Actions sind ein eigener Tab-only Bereich. Der Block wird nicht mehr unten an die Übersicht gehängt. Backend bleibt unverändert.


## HT3.4 Dashboard-Merge/Cleanup

Die vorher separat eingebundenen Dateien `hypetrain_event_actions.js` und `hypetrain_event_actions.css` wurden wieder in das normale HypeTrain-Dashboard-Modul integriert.

Aktive Dashboard-Dateien:

```text
htdocs/dashboard/modules/hypetrain.js
htdocs/dashboard/modules/hypetrain.css
```

`index.html` lädt keine separaten HypeTrain-Event-Actions-Dateien mehr. Der Tab `Event-Actions` ist ein echter Tab innerhalb von `hypetrain.js`.


## HT3.5 Event-Actions UX Cleanup

- Event-Actions sind weiterhin im normalen HypeTrain-Dashboardmodul integriert.
- Der Event-Actions-Tab enthält nur Konfiguration und Status.
- Test-/Diagnosefunktionen liegen im Tests-Tab.
- In den Event-Actions-Karten werden keine Dry-Run-/Debug-Buttons mehr angezeigt.
- Backend bleibt unverändert bei 0.2.3 / STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX.


## HT3.5.2 Overlay-Architektur-Wording

- Finale HypeTrain-Anzeige: ja.
- Aber nicht als eigenes paralleles Overlay-System.
- HypeTrain sendet bei aktivierter Overlay-Option Bus-Events an das zentrale Overlay-System.
- Das zentrale Stream-/Event-Overlay rendert daraus später die HypeTrain-Anzeige als Template/Modus für Start, Stufenaufstieg, Ende und Rekord.
- Die bisherige HypeTrain-Overlay-Datei bleibt nur technische Basis/Diagnose für Anmeldung, Heartbeat und Bus-Empfang.
- Dashboard-Wording wurde auf „Zentrales Overlay / Bus“ korrigiert.


## HT3.6 Dashboard-Wording / Diagnose-Cleanup

- Event-Actions bleiben im normalen HypeTrain-Modul (`hypetrain.js`/`hypetrain.css`).
- Keine separaten `hypetrain_event_actions.*` Dateien.
- Event-Actions-Tab bleibt normale Konfiguration: Sound, Medium, Overlay-Bus-Event, Status.
- Tests/Prüfungen liegen getrennt im Tab `Tests` und werden nicht in den normalen Event-Actions-Karten angezeigt.
- User-facing Wording wurde von Dry-Run/Entwicklerbegriffen auf `Prüfen`, `Prüfung` und `Diagnose` umgestellt.
- Backend bleibt unverändert bei `0.2.3 / STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`.
