# HypeTrain-Modul – aktueller Stand HT3.8

Backend-Version: `0.2.3`  
Backend-Build: `STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`

## Aktueller bestätigter Stand

- HypeTrain-Ende schreibt über das Tagebuch-System.
- Discord sichtbarer Name kommt vom Tagebuch-Webhook (`CGN Posty`).
- Direkt-Discord bleibt deaktiviert/skipped, sofern nicht bewusst konfiguriert.
- Event-Actions für Start, Stufenaufstieg, Ende und Rekord sind backendseitig vorbereitet.
- Sound-Aufrufe laufen ausschließlich über `sound_system` (`/api/sound/play`).
- HypeTrain sendet Overlay-Ereignisse als Bus-Events; die finale HypeTrain-Anzeige soll später als Template/Modus im zentralen Stream-/Event-Overlay dargestellt werden.
- Kein eigenes paralleles HypeTrain-Overlay-System.

## Dashboard

Das HypeTrain-Dashboard nutzt weiterhin nur das normale HypeTrain-Modul:

- `htdocs/dashboard/modules/hypetrain.js`
- `htdocs/dashboard/modules/hypetrain.css`

Es gibt keine separaten `hypetrain_event_actions.js/css` Dateien mehr.

Tabs:

- Übersicht
- Config
- Event-Actions
- Texte
- Statistik
- Tests

## HT3.8

Die Übersicht zeigt jetzt kompakt, was beim nächsten echten HypeTrain aktiv wäre:

- Start
- Stufenaufstieg
- Ende
- Rekord

Mögliche Statuswerte:

- Sound bereit
- Sound aktiv, Medium fehlt
- Overlay-Bus aktiv
- geplant/offen

## Aktuelle Event-Actions

- Start-Sound: aktiv, `mediaId 1618`, `hasMedia true`.
- Rekord-Sound: aktiv, `mediaId 1602`, `hasMedia true`.
- Stufenaufstieg: geplant/offen, noch ohne Sound.
- Ende: geplant/offen, noch ohne Sound.

## Wichtig

Speichern im Event-Actions-Tab ändert nur die Konfiguration. Produktive Aktionen werden durch echte HypeTrain-Events ausgelöst. Tests/Prüfungen liegen getrennt im Tests-Tab.
