# CURRENT_STATUS – Birthday-System

Aktueller Stand: `STEP_BIRTHDAY_005D`

- Birthday-Registrierung und kleine Auto-Gratulation aktiv.
- Optionales Jahr/Alter aktiv.
- Dashboard mit Settings, Textvarianten, Usern und Party-Show aktiv.
- Manuelle Show läuft über `!birthday party username`.
- Intro-Video und Song laufen als locked Birthday-Bundle über das Sound-System.
- Sound-System übernimmt die Medien-Queue.
- Gleicher User wird während aktiver/queued Show blockiert.
- Andere User werden als Birthday-Bundle in die Sound-System-Queue gelegt.
- Overlay eskaliert erst bei Songphase (`phase=party`).


## STEP_BIRTHDAY_005D
- Birthday-System: Sound-System Bundle Queue aktiv.
- Fix: `/api/birthday/show/queue` ist jetzt registriert.
