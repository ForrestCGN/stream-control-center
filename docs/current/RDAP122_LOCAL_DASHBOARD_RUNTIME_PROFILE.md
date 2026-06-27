# RDAP122 - Lokales Dashboard-Profil

Stand: 2026-06-27  
Version: `0.2.3`  
Sichtbarer Buildname: `Lokales Dashboard-Profil`  
Interner Step: `RDAP122_LOCAL_DASHBOARD_RUNTIME_PROFILE`

## Ziel

RDAP122 bereitet den lokalen Betriebsmodus fuer das Remote-Modboard sauber vor, ohne produktive Aktionen zu aktivieren.

## Umgesetzt

- `REMOTE_MODBOARD_MODE=online|local|lan` bleibt die zentrale Runtime-Quelle.
- `lan` wird intern zu `local` normalisiert.
- `localLan` wurde als oeffentliche, sichere Konfigurationszusammenfassung erweitert.
- `localDashboardProfile` wurde in Config und Status-API ergaenzt.
- `/api/remote/status` meldet Version `0.2.3`, Buildname `Lokales Dashboard-Profil`, Runtime-Modus und Local-Dashboard-Profil.
- UI zeigt einen Modus-Chip: `Onlinemodus` oder `Lokalmodus`.
- Frontend markiert Navigationspunkte anhand `runtime: online|local|both`.
- Sprachdateien `de.js` und `en.js` enthalten Runtime-Texte.
- Modulmanifest bleibt zentrale Quelle fuer Modul-/Seiten-Metadaten.

## Sicherheitsgrenze

Nicht umgesetzt und weiterhin gesperrt:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-/Channelpoints-Steuerung,
- keine Shell-/Datei-/Prozess-Actions.

Frontend-Metadaten steuern nur Anzeige und Navigation. Backend-Routen bleiben fuer echte Sicherheit und Berechtigungen massgeblich.

## Betroffene Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/runtime-profile.js
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/public/assets/languages/de.js
remote-modboard/backend/public/assets/languages/en.js
docs/current/RDAP122_LOCAL_DASHBOARD_RUNTIME_PROFILE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Erwartete Statuswerte

```json
{
  "version": "0.2.3",
  "buildName": "Lokales Dashboard-Profil",
  "moduleBuild": "Lokales Dashboard-Profil",
  "runtimeMode": "online",
  "localDashboardProfile": {
    "prepared": true,
    "active": false,
    "visibleLabel": "Onlinemodus",
    "actionsEnabled": false,
    "productiveWritesEnabled": false,
    "agentActionsEnabled": false
  }
}
```

Bei lokaler Env-Konfiguration `REMOTE_MODBOARD_MODE=local` muss sichtbar `Lokalmodus` erscheinen.
