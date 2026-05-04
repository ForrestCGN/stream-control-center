# STEP019 - VIP Sound Override und Doku-Abgleich

Stand: 2026-05-04

## Ziel

VIP-Sound-Override als aktuellen Projektstand dokumentieren und die mitgelieferten Statusdateien in den bestehenden GitHub/dev-Dokumentationsstand einarbeiten, ohne historische Detailinformationen zu überschreiben.

## Ergebnis

- Moderatoren und Broadcaster duerfen VIP-/Mod-Sounds erneut ausloesen, auch wenn fuer den Zieluser am selben Tag bereits eine Daily-Usage existiert.
- Die erlaubten Override-Rollen werden ueber `VIP_OVERRIDE_ALLOWED_ROLES` konfiguriert.
- Standardwert laut aktuellem Modulstand: `moderator,mod,broadcaster`.
- Nicht berechtigte Override-Versuche werden abgelehnt und ueber Heimleitungs-/Chat-Output beantwortet.
- Daily-Usage wird weiterhin nur fuer normale gueltige Ausloesungen geschrieben.
- Beim erlaubten Override wird die Daily-Usage-Pruefung bewusst uebersprungen, damit Mods/Broadcaster eine Sonderfreigabe ausloesen koennen.

## Gepruefter GitHub/dev-Stand

Bereits im Repo vorhanden:

- `backend/modules/vip_sound_overlay.js`
  - enthaelt `VIP_OVERRIDE_ALLOWED_ROLES`
  - enthaelt Rollenauswertung fuer Moderator/Mod/Broadcaster
  - enthaelt getrennte Event-Keys fuer accepted/denied override
  - schreibt VIP-Daily-Usage weiter in `vip_sound_daily_usage`
- `htdocs/overlays/vip_sound_overlay_v2.html`
  - Overlay V2 fuer VIP-/Mod-Sound-Anzeige vorhanden
  - reagiert auf Sound-System-Status/WebSocket-Events

## Betroffene Dateien

Code/Overlay:

- `backend/modules/vip_sound_overlay.js`
- `htdocs/overlays/vip_sound_overlay_v2.html`

Dokumentation:

- `project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Bewusst nicht gemacht

- Keine SQLite-Datei erstellt, ersetzt oder committed.
- Keine Secrets, `.env`, Tokens, Backups oder temporären Dateien committed.
- Historische Analyse-Snapshots nicht ueberschrieben.
- Keine alte Funktionalitaet entfernt.
- Keine neue parallele Sound-Queue gebaut.

## Noch offen / Live-Pruefung durch Forrest

Da das Live-System nur lokal bei Forrest sichtbar ist, muessen die Live-Tests per PowerShell auf `D:\Streaming\stramAssets` erfolgen.

Empfohlene Checks:

```powershell
cd /d D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/db/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
```

Zusatztests nach Deploy:

- Normaler VIP-Sound fuer User, der heute noch keinen Sound hatte.
- Duplicate fuer denselben User ohne Override muss blocken.
- Override durch Moderator/Broadcaster auf Zieluser muss akzeptiert werden.
- Override durch normalen User auf Zieluser muss abgelehnt werden.

## Naechster sinnvoller Schritt

STEP020 klein halten:

1. Live gegen Repo deployen.
2. Backend neu starten.
3. VIP-Override mit realen Streamer.bot-Parametern testen.
4. Falls noetig nur Parameter-Namen fuer Rollen/Badges nachziehen, keine Queue-/Sound-System-Logik umbauen.
