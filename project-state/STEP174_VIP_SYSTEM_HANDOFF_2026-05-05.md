# STEP174 VIP-System Übergabe / Projektstand

Stand: 2026-05-05

## Kontext

Projekt: ForrestCGN Control-Center / StreamAssets  
Repo: `ForrestCGN/stream-control-center`  
Branch: `dev`  
Repo lokal: `D:\Git\stream-control-center`  
Live: `D:\Streaming\stramAssets`

## Verbindliche Arbeitsregeln

- GitHub Branch `dev` ist die aktuelle Basis.
- Keine Funktionalität entfernen.
- Bestehende echte Dateien sind Single Source of Truth.
- Keine Secrets, Tokens, echte `.env`, SQLite-Datenbanken oder Service-Accounts committen.
- Dateien/ZIPs immer mit echten Zielpfaden ab `D:\Streaming\stramAssets` bauen.
- Nach GitHub-Änderungen Live übernehmen mit:

```powershell
cd D:\Git\stream-control-center
.\tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
```

## Aktueller sauberer Git-Stand

Zuletzt von Forrest bestätigt:

- `git status --short` ist sauber.
- STEP174.7 ist abgeschlossen, committed, gepusht und lokal/live übernommen.

## Abgeschlossene VIP-Schritte

### STEP174.6 – Backend-Response bereinigt

Die Response von:

```text
GET /api/vip-sound/sounds/users
```

wurde fachlich bereinigt.

VIP-Sound-Berechtigungen kommen ausschließlich aus dem Twitch-Sync-Cache:

- Twitch Mod => berechtigt
- Twitch VIP => berechtigt
- Kein Twitch Mod/VIP => nicht berechtigt

Lokale Overrides, Daily-Usage, Events und Historie erzeugen keine Berechtigung mehr.

Wichtige Response-Felder:

- `twitch.isVip`
- `twitch.isMod`
- `twitch.allowed`
- `twitch.primaryRole`
- `twitch.statusLabel`
- `permissionSource`
- `local.ignoredForPermission`
- `history.hasUsage`

Lokale Alt-Daten werden als Diagnose markiert, aber für Rechte ignoriert.

### STEP174.7 – Dashboard an Twitch-Response angepasst

Datei:

```text
htdocs/dashboard/modules/vip.js
```

Dashboard nutzt jetzt die bereinigte Backend-Response.

Geprüft erhalten:

- `rolesPage()`
- `syncStatusHtml()`
- `formatDateTime()`

Geänderte/benutzte Helper:

- `twitchInfo(row)`
- `twitchPrimaryRole(row)`
- `twitchAllowed(row)`
- `twitchStatusLabel(row)`
- `soundUserOptionLabel(row)`
- `userHasTwitchRole(row, role)`
- `sourceLabels(row)`
- `twitchStatusPills(row)`
- `localStatusPills(row)`
- `historyStatusPills(row)`

Dashboard-Berechtigung wird nicht mehr aus folgenden Alt-Feldern abgeleitet:

- `roleTypes`
- `sources`
- `daily_usage`
- `events`
- lokale Overrides

## Aktuelle VIP-Routen

Bereits getestet/benutzt:

```text
GET  /api/vip-sound/upload/status
GET  /api/vip-sound/sounds/status?login=<login>
GET  /api/vip-sound/sounds/users
GET  /api/vip-sound/twitch-sync/status
POST /api/vip-sound/twitch-sync/run
```

Twitch-Sync-Status zuletzt bestätigt:

- `enabled = true`
- `intervalHours = 24`
- `onStartup = true`
- `onStartupIfOlderThanHours = 24`
- `includeVips = true`
- `includeMods = true`
- Cache: 31 User
- VIPs: 23
- Mods: 8

## Wichtige fachliche Regel

Das VIP-System ist ausschließlich für Twitch-VIPs und Twitch-Mods.

- Kein Twitch VIP/Mod => kein VIP-Sound.
- Keine manuelle Sonderfreigabe.
- Eigenes User-Sound-System über Kanalpunkte ist eventuell später denkbar, aber nicht Teil des VIP-Systems.

## Aktueller offener Punkt

Forrest fragte zur VIP-Übersicht, ob die technische Box „Aktueller VIP-Standard“ und rohe Event-Logs dort gebraucht werden.

Bewertung:

- Nein, nicht in der Hauptübersicht.
- Das ist interne Entwickler-/Systemdoku bzw. Debug-/Log-Ansicht.
- Die Hauptübersicht soll nur kompakt zeigen, ob das System gesund ist und wo Handlungsbedarf besteht.

## Nächster Schritt: STEP174.8 – VIP-Übersicht aufräumen

Ziel:

- Technische Standardbox entfernen.
- Rohe Event-Tabelle aus der Übersicht entfernen oder stark komprimieren.
- Status-/Warnkarten anzeigen.

Empfohlene Übersicht:

- VIP-System aktiv
- Twitch-Sync Status
- VIPs/Mods im Cache
- Sounds vorhanden / fehlen
- Letzter Sync
- Nächster Sync
- Warnungen:
  - X VIPs/Mods ohne Sound
  - Token fehlt/läuft bald ab
  - letzter Sync fehlgeschlagen

Events bleiben im Tab `Events`.  
Technische Infos gehören höchstens nach System/Admin/Diagnose.

## Danach: STEP174.9 – VIP-Statistikseite

Forrest möchte Statistiken: wer wann was benutzt hat.

Wichtig: Nicht blind neue Tabellen/Parallelstruktur bauen. Erst echten Backend- und DB-Stand prüfen.

Bereits vorhandene Grundlagen wahrscheinlich:

- `vip_sound_events`
- `vip_sound_daily_usage`
- `stats.totals`
- Event-/Daily-Usage-Routen im bestehenden VIP-Modul

Geplante Statistik-Inhalte:

- Nutzung heute
- Nutzung letzte 7 Tage
- Nutzung letzte 30 Tage
- Top User nach Nutzung
- letzte Auslösungen
- abgelehnte Auslösungen mit Grund
- fehlende Sounddateien
- durchschnittliche Sounddauer
- längster Sound
- letzte Nutzung pro User
- User ohne Sound, die schon versucht wurden

## Prüfbefehle für neue Arbeiten

```powershell
cd D:\Git\stream-control-center

git status --short
git log -5 --oneline

node -c .\htdocs\dashboard\modules\vip.js
Select-String -Path .\htdocs\dashboard\modules\vip.js -Pattern "Ã|â|Â|﻿" -SimpleMatch
Select-String -Path .\htdocs\dashboard\modules\vip.js -Pattern "function syncStatusHtml|function formatDateTime|function rolesPage|rolesPage\(" -Context 1,2
```

## Wichtige Fehler aus dem Chat

Es gab Encoding-Probleme durch PowerShell `Set-Content`:

- `Ü` wurde zu `Ãœ`
- `über` wurde zu `Ã¼ber`
- `—` wurde zu `â€”`

Deshalb künftig:

- Für JS-Dateien mit Umlauten keine riskanten PowerShell-Textpatches nutzen.
- Besser echte Datei hochladen, direkt bearbeiten und zurückgeben.
- Oder Node/.NET explizit UTF-8 ohne BOM nutzen.
- Vor Commit immer Encoding prüfen.

Außerdem wurde eine Datei fälschlich als alter Stand eingeschätzt, weil eine Tool-/Anzeigeausgabe gekürzt war. Künftig bei Unsicherheit: echten Dateistand prüfen, nicht raten.

## Nächster Chat / Weiterarbeit

Im nächsten Chat zuerst diese Dateien prüfen:

- `project-state/CURRENT_STATUS.md`
- `project-state/STEP174_VIP_SYSTEM_HANDOFF_2026-05-05.md`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`
- `backend/modules/vip_sound_overlay.js`

Dann direkt mit STEP174.8 starten.

Klare Vorgabe:

- Nicht diskutieren.
- Erst echte Dateien prüfen.
- Dann konkreten Patch/ZIP liefern.
- Keine Funktionalität entfernen.
- Keine neuen Parallelstrukturen bauen.
