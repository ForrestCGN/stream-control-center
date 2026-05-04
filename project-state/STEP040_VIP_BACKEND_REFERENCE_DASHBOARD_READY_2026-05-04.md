# STEP040 - VIP Backend Reference / Dashboard Ready Status

Stand: 2026-05-04

## Zweck

Dieser STEP friert den aktuellen VIP-Backend-Stand als Referenz fuer den spaeteren VIP-Dashboard-Chat ein.

Das Dashboard wird bewusst in einem neuen Chat gebaut. Diese Datei dient dort als Einstiegspunkt fuer:

- aktueller VIP-Ablauf
- relevante Backend-Routen
- genutzte Datenbanktabellen
- vorhandene Dashboard-faehige APIs
- offene Punkte vor dem eigentlichen Dashboard-Bau

## Aktueller Modulstand

- Modul: `backend/modules/vip_sound_overlay.js`
- Live-Version getestet: `1.8.5`
- Aktive OBS-/Overlay-Basis: `htdocs/overlays/vip_sound_overlay_v2.html`
- Soundausgabe laeuft ueber `sound_system`
- Chat-Ausgabe laeuft zentral ueber `helper_chat_output.js` / Bot
- Settings-Grundlage: `helper_settings.js` + `vip_sound_settings`

## Verbindliche Architektur-Regel

Fuer VIP und spaeter weitere Systeme gilt:

1. Dashboard-faehige Werte primaer in die Datenbank.
2. JSON-Dateien nur fuer technische Configs, Imports oder Fallbacks.
3. Secrets/Tokens niemals in DB, Dashboard oder Repo.
4. Dashboard greift nicht direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt Backend-APIs.
6. Bestehende Systeme vor Dashboard-Ausbau pruefen und ggf. schrittweise angleichen.
7. Keine Funktionalitaet entfernen.

## Aktueller VIP-Ablauf

Normaler Ablauf fuer `!vip`:

1. Streamer.bot nimmt den Chat-Befehl an.
2. Streamer.bot sendet Minimaldaten an `GET/POST /api/vip-sound/command`.
3. Node/VIP loest Actor/Target/User auf.
4. Zieluser-Rolle wird ermittelt:
   - zuerst Twitch-Mod-Erkennung
   - danach DB-Rollen-Fallbacks
   - danach JSON-Fallback/Import
5. VIP prueft Daily-Usage.
6. VIP loest Sounddatei ueber DB-Settings auf.
7. VIP sendet an `POST /api/sound/play`.
8. Nur wenn Sound-System akzeptiert, wird Daily-Usage geschrieben.
9. Event/Statistik wird in `vip_sound_events` geschrieben.
10. Chat-Ausgabe erfolgt ueber zentrale Bot-Ausgabe.
11. Overlay V2 liest Visualdaten aus `sound_system.current.visual`.

Override/Target-Ausloesung:

- Wenn Forrest/Broadcaster/Mod fuer einen Zieluser ausloest, wird der Sound abgespielt.
- Diese Ausloesung verbraucht bewusst keine Daily-Usage.
- Daily-Usage wird nur bei normalem Self-Trigger geschrieben.

## Datenbanktabellen

Aktive VIP-Tabellen in `D:\Streaming\stramAssets\data\sqlite\app.sqlite`:

- `vip_sound_daily_usage`
  - Tageslimit pro User/Soundtyp
- `vip_sound_message_templates`
  - Chat- und Overlaytexte
- `vip_sound_settings`
  - dashboardfaehige VIP-Settings
- `vip_sound_events`
  - Event-/Audit-/Statistikbasis
- `vip_sound_role_overrides`
  - Rollen-Fallbacks/Overrides

Wichtig:

- `app.sqlite` niemals committen.
- Schema wurde migrationssicher erweitert.
- Keine bestehende SQLite-Datei ersetzen.

## Aktuelle DB-Settings

In `vip_sound_settings` vorhanden und aktiv genutzt:

- `enabled`
- `soundBaseDir`
- `fileNameMode`
- `fileExtension`
- `dailyUsageRetentionDays`
- `cleanupDailyUsageOnStartup`
- `autoDetectTargetRole`
- `fallbackRolesEnabled`

Aktueller Standard:

- `soundBaseDir = D:/Streaming/stramAssets/htdocs/assets/sounds/vip`
- `fileNameMode = displayName`
- `fileExtension = .mp3`

Diese Werte sind fuer das spaetere Dashboard vorbereitet und koennen ueber API geschrieben werden.

## Routen fuer das spaetere Dashboard

### Status / Summary

- `GET /api/vip-sound/status`
- `GET /api/vip-sound/db/status`
- `GET /api/vip-sound/admin/summary`

### Command / Test

- `GET/POST /api/vip-sound/command`
- `POST /api/vip-sound/test`
- `POST /api/vip-sound/admin/test`

### Daily-Usage

- `GET /api/vip-sound/daily-usage`
- `GET /api/vip-sound/daily-usage/today`
- `POST /api/vip-sound/daily-usage/reset`
- `POST /api/vip-sound/daily-usage/reset-today`
- `GET/POST /api/vip-sound/admin/reset-daily`

### Events / Statistik

- `GET /api/vip-sound/events`
- `GET /api/vip-sound/events/recent`
- `GET /api/vip-sound/stats`

### Settings

- `GET /api/vip-sound/settings`
- `GET /api/vip-sound/config`
- `POST /api/vip-sound/settings/upsert`
- `POST /api/vip-sound/settings/delete`
- `POST /api/vip-sound/settings/reset-defaults`

### Rollen

- `GET /api/vip-sound/roles`
- `POST /api/vip-sound/roles/upsert`
- `POST /api/vip-sound/roles/delete`
- `POST /api/vip-sound/roles/import-config`

### Texte

- `GET /api/vip-sound/texts`
- `GET /api/vip-sound/texts/event-keys`
- `POST /api/vip-sound/texts/upsert`
- `POST /api/vip-sound/texts/toggle`
- `POST /api/vip-sound/texts/delete`

## Getestete Live-Punkte

Bestaetigt:

- `1.8.5` live gestartet.
- `/api/vip-sound/admin/summary` liefert Status, Settings, Rollen, Daily-Usage, Events und Stats.
- `/api/vip-sound/admin/reset-daily` loescht heutige Daily-Usage.
- Settings lesen/schreiben funktioniert.
- Rollen-Fallbacks liegen in DB.
- JSON-Fallback fuer Rollen zeigt korrekt auf `D:\Streaming\stramAssets\config\vip_sound_roles.json`.
- Text-API funktioniert.
- Event-/Stats-API funktioniert.
- `!vip @araglor` wird als Mod-Sound erkannt.
- Self-Trigger schreibt Daily-Usage.
- Admin-/Override-Trigger verbraucht keine Daily-Usage.

## Wichtige offene Punkte fuer VIP-Dashboard

Dashboard soll spaeter koennen:

- VIP-Status anzeigen.
- Settings anzeigen und bearbeiten.
- Soundpfad/Dateiregel bearbeiten.
- Texte anzeigen, bearbeiten, aktivieren/deaktivieren und gewichten.
- Rollen-Fallbacks anzeigen und bearbeiten.
- Daily-Usage anzeigen und resetten.
- Events/Statistiken anzeigen.
- Testausloesung starten.
- Fehlende Sounddateien sichtbar machen.

Noch nicht bauen, bevor Dashboard-Grundstandard geklaert ist:

- Rollen/Rechte im Dashboard.
- Audit-Logging fuer Admin-Aktionen.
- Einheitlicher Dashboard-Modulstandard.
- Pruefung bestehender Systeme auf denselben DB-/Settings-/API-Standard.

## Bekannte Hinweise

- Interne Style-ID `heimleitung` bleibt aus Kompatibilitaetsgruenden bestehen.
- Sichtbarer Begriff in Texten ist `Heimaufsicht`.
- `config/vip_sound.json` kann fehlen. Das ist okay, weil DB primaer ist und JSON nur Fallback waere.
- `config/vip_sound_roles.json` bleibt Import-/Fallback-Quelle, nicht primaere Bearbeitungsquelle.
- Auto-Cleanup/Retention ist vorbereitet, aber nicht hart aktiv. Spaeter per Dashboard steuerbar machen.

## Uebergabe fuer neuen Dashboard-Chat

Im neuen Chat zuerst diese Dateien/Infos verwenden:

- `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`
- `project-state/NEXT_STEPS.md`
- `project-state/FILES.md`
- `project-state/CURRENT_STATUS.md`
- aktuelle grosse Datei bei Bedarf von Forrest anfordern:
  - `backend/modules/vip_sound_overlay.js`

Arbeitsregel:

- GitHub/dev ist Single Source of Truth.
- Kleine Projektdateien koennen direkt ueber GitHub gelesen/geaendert werden.
- Grosse Dateien stellt Forrest bereit, wenn GitHub/Tools gekuerzt liefern.
- Keine Patch-Scripte auf Basis gekuerzter Dateien.
