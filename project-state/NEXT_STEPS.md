# NEXT_STEPS – Birthday-System

## Aktueller Stand

Aktuell: `STEP_BIRTHDAY_005`.

Das Birthday-System hat jetzt:

- Registrierung per `!birthday set`
- kleine automatische Chat-Gratulation
- Tagebuch-Anbindung
- manuelle Show per `!birthday party username`
- globales Intro-Video
- Standardsong
- User-Songs
- Party-Presets
- User→Party-Zuordnung
- mehrere Celebration-Styles

## Sofort testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/assets"
```

Dashboard:

```text
http://127.0.0.1:8080/dashboard
Community → Birthday-System → Party-Show
```

Show-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday party araglor","userLogin":"forrestcgn","displayName":"ForrestCGN"}'
```

## Danach sinnvoll

### STEP_BIRTHDAY_006 – Party-Bilder

- Bilder pro Party hochladen
- Bilder während der Partyphase rotieren lassen
- Polaroid-/Card-Look
- optional Bild-Zeitpunkte/Szenen konfigurieren

### STEP_BIRTHDAY_007 – Party-Editor Polish

- bessere Vorschau pro Style
- Intensität der Effekte im Dashboard editieren
- Drag/Drop Reihenfolge für spätere Bilder/Szenen
