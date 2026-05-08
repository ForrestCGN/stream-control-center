# NEXT_STEPS Ergänzung – nach STEP198

Stand: 2026-05-08

## Neuer Architektur-Standard

Künftig sollen alle größeren Module auf den globalen Modul-/DB-/Dashboard-Standard gebracht werden:

- DB für dashboardfähige Einstellungen
- JSON nur Seed/Fallback/technische Boot-Konfiguration
- Secrets nur ENV/Secret-Dateien
- gleiche Basis-Endpunkte je Modul
- Dashboard nur über Backend-APIs
- Installer muss JSON-Seed in DB übernehmen können

## Nächste fachliche Schritte

### STEP199 – TTS API/Settings Standardisierung planen

Ziel:

- echte Dateien prüfen
- vorhandene TTS-Routen dokumentieren
- fehlende Standardrouten planen:
  - `/api/tts/config`
  - `/api/tts/settings`
  - `/api/tts/reload`
  - `/api/tts/integration-check`
  - optional `/api/tts/voices`
- prüfen, ob TTS separat abspielt oder ins Sound-System integriert werden soll
- DB/JSON/ENV-Trennung planen
- Dashboard-Anpassungen für TTS berücksichtigen

Benötigte Dateien:

```text
backend/modules/tts_system.js
config/tts_system.json oder vorhandene TTS-Konfig
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_config.js
backend/core/database.js
```

### Danach mögliche Kandidaten

- Sound-System Settings-Dashboard
- Alert-System Settings-Dashboard nach DB-Quelle darstellen
- Message-Rotator Standardisierung
- VIP-Sound-Overlay Standardisierung
- Twitch-Chat-Overlay Standardisierung
- Discord/Sound-Output-Konfiguration
