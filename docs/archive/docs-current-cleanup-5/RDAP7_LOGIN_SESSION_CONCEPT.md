# RDAP7 Login-/Session-Konzept

Stand: 2026-06-23  
Status: Konzept/Doku, keine Auth-Aktivierung

## Zweck

RDAP7 legt fest, wie Login, User-Aufloesung, Sessions, Rollen/Gruppen und serverseitige Permission-Pruefung fuer das Remote-Modboard geplant werden.

Dieser Step ist bewusst nur Planung. Er aktiviert kein Login, erstellt keine Sessions und fuegt keine produktiven Schreibaktionen hinzu.

## Ausgangsstand

Fertig und bestaetigt:

```text
RDAP6K Produktive Auth-DB Schema-/Seed-Migration auf c3stream_control erfolgreich
RDAP6L Migrationsergebnis dokumentiert
/api/remote/auth/model liefert schema.ready=true
Remote-Modboard bleibt read-only
```

Produktive Ziel-DB:

```text
DB_NAME=c3stream_control
DB_USER=c1stream_control
```

Backup vor RDAP6K:

```text
/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
```

## Harte Nicht-Aenderungen in RDAP7

```text
keine Auth-Aktivierung
keine Login-Route produktiv
keine Session-Erstellung produktiv
keine Cookie-Ausgabe produktiv
keine API-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine lokale SQLite-Aenderung
keine Secrets im Repo, Frontend oder Chat
```

## Zielbild Login

Das Remote-Modboard soll spaeter Login ueber Twitch-OAuth nutzen.

Geplante OAuth-Richtung:

```text
User klickt Login auf mods.forrestcgn.de
Backend leitet zu Twitch OAuth weiter
Twitch leitet zur Callback-Route zurueck
Backend validiert OAuth-Antwort serverseitig
Backend loest Twitch-Identitaet auf
Backend legt/aktualisiert User-Datensatz kontrolliert an
Backend erstellt danach erst eine Session
Frontend sieht nur den eingeloggten Status, entscheidet aber keine Rechte
```

## Geplante Routen spaeter

Nur als Konzept, noch nicht aktiv:

```text
GET  /api/remote/auth/login/twitch
GET  /api/remote/auth/callback/twitch
GET  /api/remote/auth/me
POST /api/remote/auth/logout
```

Bewusst nicht als erster aktiver Schritt:

```text
keine Admin-User-Schreiboberflaeche
keine Modulwrites
keine Agent-Actions
keine freien Backend-Actions
```

## Session-Konzept

Sessions sollen in `dashboard_sessions` gespeichert werden.

Geplante Session-Regeln:

```text
Session-ID nie roh in DB speichern, sondern gehasht
Cookie HttpOnly
Cookie Secure
Cookie SameSite=Lax oder Strict, vor finaler Umsetzung festlegen
Session-Laufzeit begrenzen
last_seen_at kontrolliert aktualisieren
Logout setzt revoked_at/status
abgelaufene Sessions gelten serverseitig als ungueltig
```

Noch zu klaeren vor Umsetzung:

```text
exakte Cookie-Namen
exakte Lebensdauer
CSRF-Modell fuer spaetere Schreibaktionen
Session-Rotation nach Login
Umgang mit mehreren gleichzeitigen Sessions pro User
```

## User- und Identity-Aufloesung

Tabellenbasis:

```text
dashboard_users
dashboard_identities
dashboard_twitch_status
dashboard_user_roles
dashboard_user_groups
```

Hinweis: `dashboard_twitch_status` ist im aktuellen RDAP6C-Schema nicht angelegt. Vor Umsetzung muss entschieden werden, ob Twitch-Status in `dashboard_identities`, einer neuen Twitch-Status-Tabelle oder einer spaeteren Migration abgebildet wird.

Geplantes Mapping:

```text
Twitch provider_user_id -> dashboard_identities.provider_user_id
provider='twitch'
provider_login -> Twitch Login
provider_display_name -> Twitch Display Name
user_uid -> interner Dashboard-User
```

## Zugriffsbasis

Twitch-Status:

```text
broadcaster / streamer -> Dashboard-Basiszugang
mod -> Dashboard-Basiszugang
vip -> kein Dashboard-Basiszugang, nur Community/Website
```

Manuelle Rollen:

```text
owner
admin
lead_mod
mod
media_manager
readonly
```

Gruppen/Marker:

```text
sound_profi
spaeter event_helfer
spaeter medien_helfer
```

Wichtig:

```text
sound_profi ist keine Rolle.
sound_profi ist Gruppe/Marker.
sound_profi vergibt selbst keine globalen Rechte.
Konkrete Rechte kommen ueber Rollenrechte und/oder Modulmatrix.
```

## Permission-Pruefung

Serverseitige Entscheidung bleibt Pflicht.

Geplanter Entscheidungsablauf:

```text
1. Session validieren
2. User laden
3. Twitch-Status laden/ableiten
4. Rollen laden
5. Gruppen laden
6. Rollenrechte auswerten
7. Modulmatrix auswerten
8. Overrides spaeter optional auswerten
9. Ergebnis serverseitig entscheiden
10. Audit spaeter bei kritischen Entscheidungen schreiben
```

Frontend darf nur anzeigen/verstecken, aber nie entscheiden.

## Naechster technischer Schritt

```text
RDAP7A_AUTH_READONLY_USER_RESOLUTION_PLAN
```

Ziel von RDAP7A:

```text
Read-only User-/Identity-/Session-Status-Endpunkte planen, ohne Login zu aktivieren.
```

Moegliche Route fuer RDAP7A:

```text
GET /api/remote/auth/me
```

Erwartung im ersten Schritt:

```text
ok: true
loggedIn: false
authEnabled: false
sessionCreationEnabled: false
```

## Tests spaeter

Vor echter Login-Aktivierung muessen mindestens diese Tests geplant werden:

```text
nicht eingeloggt -> /auth/me liefert loggedIn=false
ungueltige Session -> loggedIn=false
abgelaufene Session -> loggedIn=false
User mit Rolle readonly -> nur read-only
sound_profi ohne Modulmatrix -> keine globalen Rechte
VIP ohne Rolle -> kein Dashboard-Basiszugang
Frontend-Ausblendung reicht nicht, Backend blockt Rechte serverseitig
```

## Rollback

Da RDAP7 nur Doku/Konzept ist:

```text
stepundo.cmd
```

Bei spaeteren Auth-Code-Steps muss separat ein Code-/Service-Rollback dokumentiert werden.
