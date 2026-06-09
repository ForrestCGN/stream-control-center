# CURRENT CHAT HANDOFF – LWG-4L.12

## Aktueller Stand
LWG-4L.12 ist ein Code-Fix für den Wheel/Rad Runtime-Pfad.

## Änderung
`!wheel` / `!rad` sucht ohne explizite `giveawayUid` nicht mehr nach einem offenen Giveaway, sondern nach einer pending Wheel-Permission für den ausführenden User.

## Warum
Nach einem Wheel-Giveaway-Draw steht das Giveaway auf `waiting_for_wheel`. Ein Lookup nur auf `status=open` wäre für echte Chat-Claims falsch.

## Geänderte Datei
- `backend/modules/loyalty_giveaways.js`

## Build
- `MODULE_BUILD = STEP_LWG_4L_12`

## Nicht geändert
- Keine Command-Aktivierung
- Keine Punktebuchung
- Keine Dashboard-Änderung
- Kein Streamer.bot

## Nächster Test
1. StepDone ausführen.
2. Node neu starten.
3. Status prüfen.
4. `!wheel` temporär aktivieren.
5. Ohne Permission prüfen: `wheel_no_permission`.
6. Rollback: `!wheel enabled=false`.
7. Danach separater Step für echten Permission-Spin-Test.
