# CHANGELOG

## STEP277A_FIX1
- Fix: `!vso @user` wurde über das Command-System als auslösender User statt Zieluser interpretiert.
- `parseTarget()` priorisiert jetzt Zielargumente vor Actor-Feldern.
- Erwartbare Modulfehler (`target_required`, `target_user_not_found`, `no_clips_found`) werden als HTTP 200 JSON zurückgegeben.
- Status-Debug erweitert: `lastRun` wird auch bei erwartbaren Fehlern gesetzt.
- Keine Änderung am Sound-System, Overlay-Design oder TTS-Ablauf.

## STEP277A
- Neues Modul `backend/modules/clip_shoutout.js` vorbereitet.
- Command `!vso` mit Aliasen `!clipso` und `!videoso` registriert.
- Video-Shoutout läuft über Sound-System-Bundle.
- Bestehendes Clip-Shoutout-Design im Sound-System-Overlay ergänzt.
- Optionaler TTS-Baustein nach dem Clip vorbereitet, standardmäßig deaktiviert.
