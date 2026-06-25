# RDAP_ADMIN_USERS25_AUTH_SESSION_LOGIN_SMOKE_TEST

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard  
Typ: Login-/OAuth-/Session-Smoke-Test-Runbook  
Scope: grosser, aber begrenzter Test-Step

---

## 1. Ziel

RDAP25 beschreibt den kontrollierten Login-/OAuth-/Session-Smoke-Test.

Grundlage:

```text
RDAP24 live bestaetigt
readyForLoginSmokeTest: true
blockers: []
```

Ziel von RDAP25:

```text
Twitch-Login bewusst testen
OAuth-Start/Callback pruefen
Session-Cookie pruefen
/api/remote/auth/me pruefen
/api/remote/auth/session-status pruefen
/api/remote/auth/permissions/check pruefen
```

---

## 2. Harte Grenzen

In RDAP25 weiterhin verboten:

```text
Keine Admin-Notiztexte anzeigen
Keine Admin-Notiz schreiben
Keine User-/Rollenverwaltung
Keine Gruppen-/Freigaben-Writes
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine UI-Schreibbuttons fuer Admin-Notizen
Keine Admin-Notiz-Write-Route
```

Erlaubt ist nur der Login-/Session-Smoke-Test.

---

## 3. Wichtige Erkenntnis aus RDAP24

OAuth-Safety:

```text
Login/OAuth deaktiviert:
  /api/remote/auth/twitch/start    -> 403
  /api/remote/auth/twitch/callback -> 403

Login/OAuth bewusst aktiviert:
  /api/remote/auth/twitch/start    -> 302 Redirect zu Twitch + OAuth-State-Cookie
  /api/remote/auth/twitch/callback ohne gueltigen Code/State -> 403
```

Damit ist `302/403` beim bewussten Login-Test korrekt.

---

## 4. Webserver: Vorcheck

Auf dem Webserver:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild, .writeEnabled, .actionEnabled, .productiveAgentRuntime'

curl -fsS http://127.0.0.1:3010/api/remote/auth/readiness-diagnostic | jq '.ok, .readOnly, .readiness.readyForLoginSmokeTest, .readiness.blockers, .expectedHttpBehaviour'
```

Erwartung:

```text
moduleBuild: RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
readyForLoginSmokeTest: true
blockers: []
```

---

## 5. Env-Datei sichern

Wichtig: Die Env-Datei nicht blind sourcen.

```bash
sudo cp -a /etc/stream-control-center/remote-modboard.env "/etc/stream-control-center/remote-modboard.env.backup_rdap25_$(date +%Y%m%d_%H%M%S)"
ls -la /etc/stream-control-center/remote-modboard.env.backup_rdap25_*
```

---

## 6. Aktuelle Login-Flags anzeigen

```bash
sudo grep -E '^(AUTH_ENABLED|TWITCH_OAUTH_ENABLED|SESSION_ENABLED|AUTH_SESSION_WRITE_ENABLED|SESSION_COOKIE_NAME|SESSION_COOKIE_SECURE|SESSION_COOKIE_SAMESITE|TWITCH_REDIRECT_URI|REMOTE_PUBLIC_BASE_URL|DASHBOARD_ALLOWED_LOGINS)=' /etc/stream-control-center/remote-modboard.env || true
```

Wichtig:

- Secrets nicht ausgeben.
- Keine DB-Passwoerter posten.
- Nur Boolean-/Pfad-/Cookie-/Public-URL-Werte pruefen.

---

## 7. Login-Smoke-Test aktivieren

Nur diese vier Flags fuer den Smoke-Test aktivieren:

```bash
sudo perl -0pi -e 's/^AUTH_ENABLED=.*/AUTH_ENABLED=true/m; s/^TWITCH_OAUTH_ENABLED=.*/TWITCH_OAUTH_ENABLED=true/m; s/^SESSION_ENABLED=.*/SESSION_ENABLED=true/m; s/^AUTH_SESSION_WRITE_ENABLED=.*/AUTH_SESSION_WRITE_ENABLED=true/m' /etc/stream-control-center/remote-modboard.env
```

Falls ein Flag noch nicht existiert:

```bash
grep -q '^AUTH_ENABLED=' /etc/stream-control-center/remote-modboard.env || echo 'AUTH_ENABLED=true' | sudo tee -a /etc/stream-control-center/remote-modboard.env
grep -q '^TWITCH_OAUTH_ENABLED=' /etc/stream-control-center/remote-modboard.env || echo 'TWITCH_OAUTH_ENABLED=true' | sudo tee -a /etc/stream-control-center/remote-modboard.env
grep -q '^SESSION_ENABLED=' /etc/stream-control-center/remote-modboard.env || echo 'SESSION_ENABLED=true' | sudo tee -a /etc/stream-control-center/remote-modboard.env
grep -q '^AUTH_SESSION_WRITE_ENABLED=' /etc/stream-control-center/remote-modboard.env || echo 'AUTH_SESSION_WRITE_ENABLED=true' | sudo tee -a /etc/stream-control-center/remote-modboard.env
```

---

## 8. Service neu starten + Readiness

```bash
sudo systemctl restart scc-remote-modboard.service

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

---

## 9. Nach Aktivierung pruefen

```bash
curl -fsS http://127.0.0.1:3010/api/remote/auth/readiness-diagnostic | jq '.ok, .readOnly, .config.auth, .config.twitchOAuth, .config.sessions, .readiness.readyForLoginSmokeTest, .readiness.blockers, .expectedHttpBehaviour'
```

Erwartung:

```text
readyForLoginSmokeTest: true
blockers: []
expectedHttpBehaviour.oauthWouldRedirectToTwitch: true
```

---

## 10. OAuth-Start HTTP pruefen

```bash
curl -sS -o /tmp/rdap25_twitch_start_body.txt -D /tmp/rdap25_twitch_start_headers.txt http://127.0.0.1:3010/api/remote/auth/twitch/start
head -n 20 /tmp/rdap25_twitch_start_headers.txt
```

Erwartung bei aktivem Login:

```text
HTTP/1.1 302 Found
Location: https://id.twitch.tv/oauth2/authorize...
Set-Cookie: scc_remote_oauth_state=...
```

Das ist korrekt.

---

## 11. Browser-Smoke-Test

Im Browser oeffnen:

```text
https://mods.forrestcgn.de/api/remote/auth/login/start
```

oder direkt:

```text
https://mods.forrestcgn.de/api/remote/auth/twitch/start
```

Erwartung:

1. Weiterleitung zu Twitch.
2. Twitch Login/Authorize.
3. Rueckkehr zu `mods.forrestcgn.de`.
4. Seite meldet Login erfolgreich oder leitet ins Remote-Modboard zurueck.
5. Danach sollte ein Session-Cookie fuer `mods.forrestcgn.de` vorhanden sein.

---

## 12. Nach Browser-Login pruefen

Im Browser oder mit Session-Cookie per DevTools pruefen:

```text
https://mods.forrestcgn.de/api/remote/auth/me
https://mods.forrestcgn.de/api/remote/auth/session-status
https://mods.forrestcgn.de/api/remote/auth/permissions/check?permissionKey=remote.view
https://mods.forrestcgn.de/api/remote/auth/permissions/check?permissionKey=admin.users.note.read
```

Erwartung fuer `/auth/me`:

```text
loggedIn: true
dashboardAccess: true
user vorhanden
session.sessionValid: true
```

Erwartung fuer `admin.users.note.read`:

```text
permission darf nur true sein, wenn sie wirklich serverseitig vergeben/erkannt wurde.
Wenn false, ist das kein Fehler, sondern bedeutet: Login funktioniert, Admin-Notiz-Lesen noch nicht freigegeben.
```

---

## 13. Serverseitige Session-Daten pruefen

Nur Read-only:

```bash
mysql --defaults-extra-file=/root/.my.cnf -e "SELECT COUNT(*) AS session_count FROM c3stream_control.dashboard_sessions;"
mysql --defaults-extra-file=/root/.my.cnf -e "SELECT session_uid, user_uid, status, created_at, expires_at, revoked_at, last_seen_at FROM c3stream_control.dashboard_sessions ORDER BY created_at DESC LIMIT 5;"
```

Falls `/root/.my.cnf` nicht existiert, die bestehende sichere DB-Methode aus RDAP16 nutzen, aber keine Passwoerter posten.

---

## 14. Rollback / Login wieder deaktivieren

Wenn der Test abgeschlossen ist oder etwas komisch wirkt:

```bash
sudo perl -0pi -e 's/^AUTH_ENABLED=.*/AUTH_ENABLED=false/m; s/^TWITCH_OAUTH_ENABLED=.*/TWITCH_OAUTH_ENABLED=false/m; s/^SESSION_ENABLED=.*/SESSION_ENABLED=false/m; s/^AUTH_SESSION_WRITE_ENABLED=.*/AUTH_SESSION_WRITE_ENABLED=false/m' /etc/stream-control-center/remote-modboard.env

sudo systemctl restart scc-remote-modboard.service

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

Danach pruefen:

```bash
curl -sS -o /tmp/rdap25_after_rollback_start_body.txt -D /tmp/rdap25_after_rollback_start_headers.txt http://127.0.0.1:3010/api/remote/auth/twitch/start
head -n 20 /tmp/rdap25_after_rollback_start_headers.txt
```

Erwartung nach Rollback:

```text
HTTP/1.1 403 Forbidden
```

---

## 15. Ergebnis fuer den Chat posten

Nach dem Test bitte diese Ausgaben posten:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/auth/readiness-diagnostic | jq '.ok, .readOnly, .readiness.readyForLoginSmokeTest, .readiness.blockers, .expectedHttpBehaviour'

curl -sS -o /tmp/rdap25_twitch_start_body.txt -D /tmp/rdap25_twitch_start_headers.txt http://127.0.0.1:3010/api/remote/auth/twitch/start
head -n 20 /tmp/rdap25_twitch_start_headers.txt
```

Und nach Browser-Test kurz sagen:

```text
Login erfolgreich: ja/nein
/auth/me loggedIn: true/false
dashboardAccess: true/false
admin.users.note.read: true/false
```

---

## 16. Naechster Step nach erfolgreichem RDAP25

Wenn RDAP25 erfolgreich ist:

```text
RDAP25B_LIVE_LOGIN_SMOKE_TEST_CONFIRMED_DOCS
```

Danach erst:

```text
RDAP26_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
```

RDAP26 darf echte Admin-Notiztexte nur serverseitig geschuetzt anzeigen:

```text
gueltige Session
Dashboard-Zugriff erlaubt
Permission admin.users.note.read vorhanden
Community-Seiten ausgeschlossen
```
