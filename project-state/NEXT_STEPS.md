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


## Nach STEP_BIRTHDAY_005B testen
- `/api/birthday/show/queue` aufrufen.
- Dedupe testen: gleicher User blockt, anderer User queued.
