# NEXT_STEPS – stream_events

Stand: 2026-06-13 nach EVS-25a

## Direkt als nächstes

EVS-25a einspielen und im Dashboard prüfen:

```powershell
cd /d D:\Git\stream-control-center
node -c .ackend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-25a Empty Overview Action Cleanup"
```

Danach prüfen:

- `Event-System → Übersicht` ist weiterhin die normale Start-/Statusseite.
- Der separate `Status`-Tab ist nicht sichtbar.
- Bei keinem aktiven Event gibt es keine doppelte Erklärung mehr.
- Der zweite Block heißt `Nächstes Event` und führt zu `Events öffnen`.
- Keine technischen Dispatcher-/DirectSend-/Prepared-only-Blöcke in der normalen Ansicht.

## Danach sinnvoll

1. Aktives Testevent starten und Übersicht prüfen:
   - Sound-Aufgaben gesamt/gelöst/offen.
   - Text-Aufgaben gesamt/gelöst/offen.
   - Teilnehmer / Top-Spieler.
2. Falls nötig kleine UI-Korrektur für aktive Event-Übersicht.
3. Erst danach wieder Funktionslogik planen.

## Bewusste Grenze

Live-Chatmeldungen und echtes Sound-Playback bleiben weiterhin aus, bis Forrest ausdrücklich den nächsten Live-Schritt freigibt.
