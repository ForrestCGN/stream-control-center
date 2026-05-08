# CURRENT_STATUS Ergänzung – STEP198

Stand: 2026-05-08

## Architekturentscheidung

Für alle künftigen Modulumbauten gilt:

```text
ENV / Secrets > DB > JSON > Code-Default
```

Dashboardfähige Einstellungen gehören in die DB. JSON bleibt Seed/Fallback/technische Boot-Konfiguration.

## Dashboard

Dashboard-Module sollen langfristig einheitlich aufgebaut werden:

- Status
- Einstellungen
- Regeln/Zuordnungen
- Texte/Varianten
- Assets/Medien
- Historie/Events
- Integration/Diagnose

Dashboard darf keine direkten SQLite-/Datei-Zugriffe nutzen.

## Aktueller Stand nach Alert-Fix

Alerts/Sound-System-Integration ist funktional grün:

- Alert-System liest DB-Setting `livealert.soundSystemEnabled=true` korrekt in Runtime-Config `liveAlert.soundSystemEnabled=true`.
- Alert-Sound wird über Sound-System/Device ausgegeben.
- `_AlertsV2` zeigt nur noch Bild/Text/Animation.
- Cleanup von Alert und Sound ist sauber.

## Nächster Kandidat

TTS-System muss gegen den neuen Standard geprüft und geplant werden.
