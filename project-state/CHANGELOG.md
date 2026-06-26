# CHANGELOG

## RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN - 2026-06-26

- Naechsten kleinen Admin-Notizen-/Admin-User-Schritt geplant.
- Aktuellen bestaetigten Stand beruecksichtigt:
  - RDAP44 Zieluser-Auswahl ist live.
  - RDAP45B/RDAP45C Login-/Deploy-Safety ist konsistent.
  - Twitch-Login ist aktiv/freigegeben; `twitch/start HTTP 302` ist korrekt.
  - `twitch/callback HTTP 403` ohne gueltigen OAuth-State bleibt Pflicht.
- Moegliche Richtungen bewertet:
  - Zieluser-Auswahl komfortabler machen.
  - echte Admin-User-Detailseite planen.
  - Admin-Note Update separat planen.
  - Admin-Note Deactivate separat planen.
  - Permission-Verwaltung separat planen.
- Empfehlung dokumentiert:
  - `RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED`
- Empfohlener RDAP47-Scope:
  - Frontend-only in `rdap28-admin-notes.js`.
  - Such-/Filterfeld fuer Zieluser nach Name/Login/UID.
  - keine Backend-/DB-/Permission-Aenderung.
- Keine Code-Aenderung.
- Keine DB-Migration.
- Kein Webserver-Deploy noetig.

## RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP45B Live-Bestaetigung dokumentiert.
- Bestaetigt:
  - `twitch/start HTTP 302`
  - `twitch/callback HTTP 403`
  - Login funktioniert wieder.
- Richtige Einordnung dokumentiert:
  - Twitch-Login aktiv/freigegeben.
  - `twitch/start HTTP 302` ist bei aktivem Login korrekt.
  - `twitch/callback HTTP 403` ohne gueltigen OAuth-State bleibt Pflicht.
- Live-Env-Hinweis dokumentiert:
  - `RDAP_TWITCH_OAUTH_START_RELEASED=true`
- Admin-Notizen RDAP44 weiter intakt dokumentiert.
- Keine Code-Aenderung.
- Kein Webserver-Deploy noetig.

## RDAP45B_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_FIX_PREPARED - 2026-06-26

- Deploy-Safety an aktiv genutzten Twitch-Login angepasst.
- `twitch/start HTTP 302` ist erlaubt, wenn Login bewusst aktiv ist.
- `twitch/start HTTP 403` bleibt erlaubt, wenn Login/OAuth gesperrt ist.
- `twitch/callback HTTP 403` ohne gueltigen OAuth-State bleibt Pflicht.
- Keine Admin-Notizen-UI-Aenderung.
- Keine DB-Migration.
- Keine Permission-Verwaltung.

## RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_PREPARED - 2026-06-26

- OAuth-Safety-Befund aus RDAP44-Deploy behandelt.
- Twitch-OAuth-Start-Gate `RDAP_TWITCH_OAUTH_START_RELEASED=true` vorbereitet.
- Spaeter durch RDAP45B richtig eingeordnet: Login wird aktiv genutzt, daher darf `twitch/start` bei freigegebenem Login 302 liefern.

## RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS - 2026-06-26

- RDAP44 Live-Bestaetigung dokumentiert.
- Zieluser-Auswahl in Admin-Notizen sichtbar.
- Default ForrestCGN @forrestcgn / `tw:127709954`.
- Read/Create nutzen ausgewaehlten Zieluser.
- Keine Code-Aenderung.
- Kein Webserver-Deploy noetig.
