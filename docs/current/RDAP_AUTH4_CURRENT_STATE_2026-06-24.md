# RDAP Auth4 Current State - 2026-06-24

Stand: `RDAP_AUTH4_SELF_TWITCH_PROFILE_SYNC`

## Bestätigter Stand

Das Remote-Modboard unter `https://mods.forrestcgn.de/` läuft mit aktivem Twitch-Login, Session-Erkennung, Dashboard-Access-Gate und CGN-/Dashboard-v2-V13-Designbasis.

Bestätigte Punkte:

- Twitch Login funktioniert.
- ForrestCGN darf ins Modboard.
- EngelCGN kann nach Allowlist-Erweiterung mittesten.
- Avatar oben rechts wird angezeigt.
- Eigenes Profilpanel oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert den eigenen Twitch-Namen und Avatar.
- Login-/Denied-Seiten sind zentriert.
- Dashboard-Statuskarten sind wieder als Grid dargestellt.
- Remote-Writes bleiben aus.
- Agent-Actions bleiben aus.
- OBS-/Sound-/Overlay-/Command-Steuerung bleibt aus.

## Aktive Architektur

Der öffentliche Einstieg läuft über:

```text
https://mods.forrestcgn.de/
```

Der Backend-Service läuft intern über:

```text
http://127.0.0.1:3010
systemd service: scc-remote-modboard.service
```

Webserver-Deploy erfolgt weiterhin ausschließlich aus einem frischen GitHub/dev-Clone nach:

```text
/opt/stream-control-center/_deploy_tmp/<STEP_NAME>
```

Danach:

```bash
sudo bash tools/remote-modboard-deploy.sh <STEP_NAME> dev
```

`/opt/stream-control-center` selbst ist kein Git-Repository.

## Datenbank / Avatar

Für Twitch-Avatare wurde eine sanfte Auth3-Erweiterung ausgeführt:

```text
dashboard_users.profile_image_url
dashboard_identities.provider_profile_image_url
```

Der Avatar wird beim Twitch-Login gespeichert/aktualisiert. Zusätzlich gibt es jetzt über Auth4 eine Self-Service-Funktion im Profilpanel:

```text
Profil aktualisieren
```

Diese Funktion liest die eigenen Twitch-Daten neu und aktualisiert nur den aktuell eingeloggten User.

## Auth4 Self Twitch Profile Sync

Funktion:

```text
POST /api/remote/auth/me/sync-twitch
```

Zweck:

- nur eigener User
- Twitch-Anzeigename neu lesen
- Twitch-Loginname neu lesen
- Twitch-Avatar neu lesen
- DB-User/Identity aktualisieren
- UI-Status neu laden

Nicht erlaubt in diesem Step:

- keine Admin-Userverwaltung
- keine Rollen-/Freigabe-Writes
- keine Verwaltung anderer User
- keine Remote-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung

## Wichtige Server-Env-Hinweise

Die produktive Env liegt hier:

```text
/etc/stream-control-center/remote-modboard.env
```

Die DB-Variablen heißen aktuell:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Nicht `MYSQL_*`.

Achtung: Die Env-Datei darf nicht blind per `source` geladen werden, weil z. B. Werte mit Leerzeichen wie `DB_ENGINE=MariaDB 11.8.6` Bash-Probleme verursachen können. Für Shell-Kommandos DB-Werte gezielt per `grep`/`cut` lesen oder sauber quoten.

## Verbindliche Arbeitsweise

Server-Test nur nach kompletter Kette:

```text
ZIP -> installstep -> lokale Checks -> stepdone -> GitHub/dev -> Webserver-Deploy -> Server/Browser-Test
```

Bei Server-Test darf nicht vorher gestoppt werden, nur weil der Stand noch nicht auf dem Server liegt. Genau dafür sind `stepdone` und Deploy nötig.

## Noch offen

- Secrets rotieren: `SESSION_SECRET`, `OAUTH_STATE_SECRET`, falls noch nicht erledigt.
- Admin-Bereich für User-/Rollenverwaltung separat planen.
- Admin-Funktionen nicht ins Avatar-/Profilmenü mischen.
- User-spezifische Funktionen bleiben oben rechts im Profilpanel.
- Admin-/Systemverwaltung kommt unter Admin.
