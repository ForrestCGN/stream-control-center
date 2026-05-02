# STEP Auth 2 – Twitch OAuth Login

Stand: 2026-05-02  
Projekt: `stream-control-center` / Dashboard Auth  
Branch-Ziel: `dev`

## Ziel

Dieser Schritt baut den echten Twitch-Login für das Dashboard ein. Twitch ist in diesem Schritt der einzige externe Login-Provider.

Wichtig: Twitch identifiziert nur die Person. Die Dashboard-Rolle bleibt eine eigene Rolle in `dashboard_users.primary_role` bzw. in der Session. Ein Twitch-Mod wird dadurch nicht automatisch Dashboard-Mod.

## Geänderte Dateien

- `backend/modules/dashboard_auth.js`
- `htdocs/dashboard/app.js`
- `docs/auth/STEP_AUTH_2_TWITCH_OAUTH_LOGIN.md`

## Neue / aktive Routen

- `GET /api/auth/status`
- `GET /api/auth/session`
- `POST /api/auth/bootstrap-owner-local`
- `POST /api/auth/logout`
- `GET /api/auth/twitch/login`
- `GET /api/auth/twitch/callback`
- `GET /api/auth/roles`
- `GET /api/auth/audit`

## SQLite

Es wird weiterhin nur die vorhandene Datenbank genutzt:

`D:\Streaming\stramAssets\data\sqlite\app.sqlite`

Das Modul nutzt `backend/modules/sqlite_core.js` und legt Tabellen nur per `CREATE TABLE IF NOT EXISTS` an. Bestehende Daten werden nicht ersetzt.

Tabellen:

- `dashboard_users`
- `dashboard_identities`
- `dashboard_sessions`
- `dashboard_roles`
- `dashboard_permissions`
- `dashboard_audit_log`

Zusätzlich werden fehlende Spalten per `ALTER TABLE ... ADD COLUMN` ergänzt, falls ein älterer lokaler STEP-Auth-1-Stand bereits Tabellen angelegt hat.

## ENV-Werte

In `.env` unter `D:\Streaming\stramAssets\.env` müssen für Twitch OAuth gesetzt werden:

```env
TWITCH_CLIENT_ID=deine_client_id
TWITCH_CLIENT_SECRET=dein_client_secret
TWITCH_AUTH_REDIRECT_URI=http://127.0.0.1:8080/api/auth/twitch/callback
```

`TWITCH_AUTH_REDIRECT_URI` ist optional, aber empfohlen. Ohne diesen Wert wird die Callback-URL aus Host/Protokoll der Anfrage gebaut.

Für lokale Entwicklung bleibt der Local-Owner-Bootstrap aktiv:

- Browser: Button `Local Owner`
- Route: `POST /api/auth/bootstrap-owner-local`
- Remote Bootstrap ist blockiert, außer `DASHBOARD_AUTH_ALLOW_REMOTE_BOOTSTRAP=1` wird ausdrücklich gesetzt.

## Twitch Developer Console

Callback URL eintragen:

```text
http://127.0.0.1:8080/api/auth/twitch/callback
```

Wenn später über eine Domain getestet wird, muss exakt diese Domain ebenfalls als OAuth Redirect URL bei Twitch eingetragen werden.

## Sicherheit

- Kein Passwort-System.
- Session-Cookie ist HTTP-only.
- OAuth `state` wird gegen CSRF genutzt.
- Twitch Client Secret wird nicht im Dashboard angezeigt.
- Access Token wird aktuell nicht gespeichert.
- In `dashboard_identities.raw_json` wird keine E-Mail gespeichert, nur `email_present: true/false`.
- Audit-Log schreibt Login, Logout und Bootstrap-Ereignisse.

## Test

### 1. Backend neu starten

Nach dem Einspielen der Dateien Backend neu starten.

### 2. Status prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/status" | ConvertTo-Json -Depth 10
```

Erwartet:

```json
{
  "ok": true,
  "module": "dashboard_auth",
  "version": 2,
  "twitchLoginConfigured": true
}
```

Wenn `twitchLoginConfigured` false ist, fehlen `TWITCH_CLIENT_ID` oder `TWITCH_CLIENT_SECRET`.

### 3. Session ohne Cookie prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/session" | ConvertTo-Json -Depth 10
```

Erwartet ohne Browser-Cookie:

```json
{
  "ok": true,
  "authenticated": false
}
```

### 4. Browser-Test

Dashboard öffnen:

```text
http://127.0.0.1:8080/dashboard/
```

Oben rechts:

- nicht angemeldet: `Nicht angemeldet / Dashboard Auth`
- wenn Twitch OAuth konfiguriert ist: Button `Twitch Login`
- Entwicklung: Button `Local Owner`

Nach Twitch Login soll oben rechts Twitch Avatar, Anzeigename und Rolle stehen.

### 5. PowerShell mit Cookie-Session

```powershell
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Invoke-RestMethod "http://127.0.0.1:8080/api/auth/bootstrap-owner-local" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"displayName":"Local Owner"}' `
  -WebSession $s | ConvertTo-Json -Depth 10

Invoke-RestMethod "http://127.0.0.1:8080/api/auth/session" `
  -WebSession $s | ConvertTo-Json -Depth 10
```

## Bekannte Grenzen dieses Steps

- Noch keine Benutzerverwaltung im Dashboard.
- Noch keine Rollenzuweisung per UI.
- Noch keine Twitch-Mod/SuperMod-Erkennung.
- Noch keine Rechteprüfung für normale Dashboard-Module.
- Noch kein Google/Microsoft/E-Mail-Login.
