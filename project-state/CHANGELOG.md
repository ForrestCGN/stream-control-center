# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP_META1_BUILD_HEADER_CLEANUP

Zusammenfassung:

- `MODULE_BUILD` von `RDAP_AUTH2_CENTRAL_LOGIN_READY` auf `RDAP_META1_BUILD_HEADER_CLEANUP` gesetzt.
- `X-Remote-Modboard-Build` zeigt dadurch nach Deploy den aktuellen Cleanup-Step.
- `/api/remote/status` nutzt `statusApiVersion: rdap_meta1.v1`.
- `/api/remote/routes` nutzt `statusApiVersion: rdap_meta1.v1`.
- RDAP5 Admin-User-Permission-Diagnoseroute in `app.js` explizit registriert.
- `package.json` Syntaxcheck um Admin-User-Route und Permission-Read-Service erweitert.
- Local/LAN-Twitch-Login als geparkter TODO dokumentiert.
- Keine DB-/Admin-Write-/Secret-/Remote-Action-Änderungen.

## 2026-06-24 - RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN

Zusammenfassung:

- Online- und Lokal/LAN-Betrieb als Ziel dokumentiert.
- Lokaler Zugriff für ForrestCGN und EngelCGN berücksichtigt.
- Lokaler Login soll ebenfalls über Twitch laufen.
- Umsetzung geparkt, bis das Web-Dashboard online stabiler ist.
- Keine Code-/DB-/Secret-Änderungen.

## 2026-06-24 - RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC

Zusammenfassung:

- Read-only Admin-User-Permission-Diagnose gebaut.
- Route: `/api/remote/admin/users/permission-diagnostic`.
- Ohne Session: `401 Unauthorized` korrekt.
- Mit ForrestCGN-Session: `ok:true`, `loggedIn:true`, `roles:["owner"]`, `canReadAdminUsers:true`, `canWriteAdminUsers:false`.
- Keine User-/Rollen-/Gruppen-/Session-Writes.
- Keine DB-Migration.

## 2026-06-24 - RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS_AND_DOCS

Zusammenfassung:

- Self-Profilpanel aufgeräumt.
- `Mein Login` und `Zugriff` aus dem Profilpanel entfernt.
- `Profil aktualisieren` bleibt erhalten.
- `Ausloggen` bleibt im Profilpanel erhalten.
- Doku, TODO, NEXT_STEPS, FILES, CURRENT_STATUS und Handoff/PROMPT aktualisiert.
- Keine Backend-/Auth-/DB-/Remote-Action-Änderungen.

## 2026-06-24 - RDAP_TOPBAR1_REMOVE_DUPLICATE_LOGOUT

Zusammenfassung:

- Doppelten `Ausloggen`-Button aus der Topbar entfernt.
- Logout bleibt im Profilpanel.
- Keine Backend-/Auth-/DB-Änderungen.

## 2026-06-24 - RDAP_ADMIN_USERS1_READONLY_OVERVIEW

Zusammenfassung:

- Admin -> User & Rollen read-only ergänzt.
- Bekannte Dashboard-User sichtbar.
- Rollen-/Gruppen-/Permissions-Modell sichtbar.
- Keine DB-Writes/Remote-Actions.
