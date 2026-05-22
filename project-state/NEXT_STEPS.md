# NEXT_STEPS – Birthday-System

## Als nächstes testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue"
```

Dann zwei unterschiedliche Shows starten und prüfen, ob die zweite in der Sound-System-Queue landet. Danach denselben User erneut starten und prüfen, ob blockiert wird.

## Danach sinnvoll

- Celebration-Styles optisch weiter polishen.
- Dashboard-Queue mit Skip/Clear vorbereiten.
- Später Party-Bilder pro Party ergänzen.


## Nach STEP_BIRTHDAY_005D testen
- `/api/birthday/show/queue` aufrufen.
- Dedupe testen: gleicher User blockt, anderer User queued.

## Nach STEP_BIRTHDAY_005E
- Birthday-Show erneut testen: erster User startet, gleicher User wird blockiert, anderer User wird über Sound-System-Queue eingereiht.
- Danach Celebration-Styles optisch weiter polieren.

## Nach STEP_BIRTHDAY_005F
- Dashboard testen: Birthday-System → Partys.
- Prüfen, ob neu angelegte Partys auswählbar und editierbar sind.
- Danach Party-Overlay/Styles weiter polieren.
