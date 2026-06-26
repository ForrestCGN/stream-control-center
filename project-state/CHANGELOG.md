# CHANGELOG

## RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED - 2026-06-26

- RDAP45 Live-Befund korrigiert:
  - Der Login-Button nutzt den Twitch-OAuth-Start bereits produktiv.
  - Mit `RDAP_TWITCH_OAUTH_START_RELEASED=true` liefert `/api/remote/auth/twitch/start` korrekt HTTP `302`.
  - `/api/remote/auth/twitch/callback` ohne gueltigen OAuth-State liefert weiterhin HTTP `403`.
- Deploy-Script angepasst:
  - `twitch/start HTTP 302` ist erlaubt, wenn Login/OAuth-Start bewusst aktiv ist.
  - `twitch/start HTTP 403` ist erlaubt, wenn Login/OAuth-Start gesperrt ist.
  - `twitch/callback HTTP 403` bleibt Pflicht fuer Callback ohne gueltigen OAuth-State.
  - Andere Start-Statuscodes schlagen weiter fehl.
- Einordnung dokumentiert:
  - Aktiver Login/OAuth-Session-Scope ist nicht gleich Remote-Writes.
  - Remote-Writes, Agent-Actions, OBS/Sound/Overlay/Commands bleiben gesperrt.
- Keine Admin-Notizen-UI-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.
- Keine neuen produktiven Admin-Writes.

## RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED - 2026-06-26

- OAuth-Safety-Befund aus RDAP44-Deploy behandelt:
  - `twitch/start HTTP 302`
  - `twitch/callback HTTP 403`
  - Deploy-Script erwartet `403/403`
- Option A umgesetzt:
  - Twitch-OAuth-Start bleibt fuer den aktuellen Safety-Stand gesperrt.
  - Deploy-Script bleibt unveraendert.
- `auth-twitch-oauth.service.js` erweitert:
  - neuer expliziter Release-Gate `RDAP_TWITCH_OAUTH_START_RELEASED=true`
  - ohne dieses Gate liefert der Auth-Guard `twitch_oauth_start_not_released`
  - Start/Callback bleiben dadurch 403, auch wenn aeltere Auth-/OAuth-/Session-/DB-Gates aktiv sind.
- Keine Admin-Notizen-UI-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.
- Keine neuen produktiven Admin-Writes.

## RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP44 Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - Zieluser-Auswahl in Admin-Notizen sichtbar.
  - Dropdown sichtbar.
  - Default ForrestCGN @forrestcgn / `tw:127709954`.
  - Name/Login/UID werden angezeigt.
  - Read `true`.
  - Write `true`.
  - Notizen `3`.
  - Tabelle `true`.
  - Create-Form nutzt ausgewaehlten Zieluser.
- Live-Asset-Befund dokumentiert:
  - `DEFAULT_TARGET_USER` vorhanden.
  - `adminNotesTargetSelect` vorhanden.
  - `selectedTargetUser` vorhanden.
  - `TARGET_USER_UID` nicht mehr vorhanden.
- Separaten OAuth-Safety-Befund dokumentiert:
  - `twitch/start HTTP 302`
  - `twitch/callback HTTP 403`
  - erwartet war `403/403`
- Naechsten empfohlenen Step dokumentiert:
  - `RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_OR_DECISION`
- Keine Code-Aenderung.
- Keine DB-Migration.
- Kein Webserver-Deploy noetig.

## RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN - 2026-06-25

- Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen geplant.
- Bestaetigten Ist-Stand dokumentiert:
  - Admin-Notizen haengen aktuell noch am fixen Zieluser `tw:127709954`.
  - Read/Create funktionieren stabil.
  - Update/Deactivate/Delete bleiben deaktiviert.
- Echte Dateien fuer die Planung geprueft:
  - `remote-modboard/backend/public/index.html`
  - `remote-modboard/backend/public/assets/remote-modboard.js`
  - `remote-modboard/backend/public/assets/rdap28-admin-notes.js`
- Empfohlenen Folge-Step dokumentiert:
  - `RDAP44_ADMIN_NOTE_TARGET_USER_SELECTION_PREPARED`
- Keine Code-Aenderung.
- Kein Webserver-Deploy noetig.

## RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS - 2026-06-25

- RDAP42 Live-Bestaetigung dokumentiert.
- `/api/remote/routes` und `/api/remote/status` liefern `rdap_admin_note_ui_status42.v1`.
- Status-Semantik nach RDAP40 sauber dokumentiert.

## RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP - 2026-06-25

- Status-/Routes-Semantik bereinigt.
- `uiWriteButtonsEnabled` getrennt von `backendAutoUiWriteButtonsEnabled` dokumentiert.
- Create-UI als bewusst vorbereitet markiert.
- Keine neue Schreibfunktion.

## RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED - 2026-06-25

- Admin-Notizen-UI um Create-Dialog/Button erweitert.
- Create-Button nur sichtbar, wenn Schreibrecht serverseitig erkannt wird.
- POST nutzt bestehende RDAP39-Route.
- Nach erfolgreichem Create wird die Liste ueber RDAP39C-Readback neu geladen.
- Kein Update, Deactivate oder Delete.

## RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC - 2026-06-25

- Fehlende echte Admin-Note-Read-Route im Repo wiederhergestellt/synchronisiert.
- Route registriert: `GET /api/remote/admin/users/admin-notes/read`.
- Keine Writes geaendert.
