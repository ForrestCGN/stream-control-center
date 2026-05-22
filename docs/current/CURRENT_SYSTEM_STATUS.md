# CURRENT_SYSTEM_STATUS – Birthday-System

Aktueller Birthday-Stand: `STEP_BIRTHDAY_005D`.

Das Birthday-System unterstützt Registrierung, kleine automatische Gratulation, Dashboard-Konfiguration, Party-Presets und manuelle Shows. Shows werden jetzt als locked Birthday-Bundles an das Sound-System übergeben. Das Sound-System übernimmt die Medien-Queue; Birthday verwaltet User-/Party-Logik, Dedupe und Overlay-State.


## STEP_BIRTHDAY_005D
Birthday-Queue-Route `/api/birthday/show/queue` ist registriert.

## Birthday-System STEP_BIRTHDAY_005E
Aktueller Stand: Party-Presets + Sound-System-Bundle-Queue + Stale-Cleanup. `/api/birthday/show/queue` bereinigt hängende Queue-Einträge automatisch, sofern keine aktive Birthday-Show und keine Birthday-Arbeit im Sound-System vorhanden ist.
