# CURRENT CHAT HANDOFF – CAN44.32 AutoShoutout StreamDay Reliability

## Ausgangslage
AutoShoutout war unzuverlässig: Freitag lief es, am Folgetag wurde nichts getriggert, obwohl normale Shoutouts und andere Twitch-Event-Module funktionierten.

Live-Status zeigte korrekt offline/known, AutoShoutout hatte aber einen alten StreamDay vom 12.06. weiterverwendet. Dadurch konnten StreamDay-Duplikatregeln eingetragene Streamer blockieren, ohne dass dies sichtbar wurde, weil `storeSkippedEvents` in der vorhandenen DB auf `False` stand.

## Fix in diesem STEP
- `clip_shoutout.js` Version `0.2.46`.
- Alte aktive AutoShoutout-StreamDays werden nicht mehr nach langer Zeit in Grace übernommen.
- Neue Twitch-Stream-ID erzeugt neuen StreamDay.
- Abgelaufene Grace-StreamDays werden geschlossen.
- AutoShoutout-Status zeigt StreamDay-Entscheidung unter `autoShoutout.state.streamDay`.
- Default für `storeSkippedEvents` ist für neue/fehlende Configs `true`.

## Noch offen / nächster Schritt
- Falls Live-Status-Monitor weiterhin `EventSub: UNBEKANNT` zeigt, gezielt Dashboard-/Monitor-Dateien prüfen.
- Nach Deploy `storeSkippedEvents` per Settings-Route aktivieren, falls die DB noch `False` enthält.
- Danach Live-Test im echten Stream.

## StepDone
`.\stepdone.cmd "CAN44.32 AutoShoutout StreamDay Reliability Fix"`
