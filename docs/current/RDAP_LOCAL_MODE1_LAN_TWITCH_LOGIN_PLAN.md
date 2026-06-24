# RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard  
Step-Typ: Planung/Dokumentation  
Scope: Online- und Lokal-/LAN-Betrieb mit Twitch-Login planen

## Ziel

Das Remote-Modboard soll langfristig in zwei Betriebsarten nutzbar sein:

1. **Online über den Webserver**
   - Public URL: `https://mods.forrestcgn.de/`
   - Produktiver Zugriff für ForrestCGN, EngelCGN und später weitere Mods/Rollen.
   - Twitch-Login ist aktiv.
   - Rechte werden serverseitig über DB/Rollen/Gruppen/Permissions geprüft.

2. **Lokal im Heimnetz**
   - Remote-Modboard läuft zusätzlich auf dem Stream-PC oder einem lokalen Host.
   - ForrestCGN kann lokal arbeiten.
   - EngelCGN kann im LAN ebenfalls arbeiten.
   - Login soll lokal ebenfalls über Twitch erfolgen.
   - LAN-Zugriff ersetzt keine Rechteprüfung.

## Harte Grenze dieses Steps

Dieser Step ist nur Planung/Dokumentation.

Nicht enthalten:

- keine Code-Änderungen
- keine DB-Migration
- keine neuen Secrets
- keine `.env`-Dateien im Repo
- keine lokale Twitch-App-Änderung
- keine User-/Rollen-/Gruppen-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- kein Webserver-Deploy erforderlich, falls nur diese Doku eingespielt wird

## Warum lokaler Twitch-Login?

Forrest möchte online und lokal arbeiten können, aber lokal nicht mit einem Fake-/Dev-Login, sondern ebenfalls mit Twitch-Login.

Vorteile:

- gleiche Identität wie online (`ForrestCGN`, `EngelCGN`)
- gleiche Rollen-/Rechte-Logik möglich
- weniger Sonderfälle bei Admin-/Mod-Rechten
- spätere Tests von Session/Permission realistischer

Nachteile / Aufwand:

- lokale OAuth-Callback-URL muss geplant werden
- lokale Env/Config notwendig
- lokale DB-Strategie notwendig
- LAN-Zugriff muss sicher begrenzt werden

## Zielbild Online

Produktiv bleibt:

```text
https://mods.forrestcgn.de/
```

Online gelten:

- Twitch-Login über produktive Redirect-URI
- Session-Cookie produktiv und sicher
- MariaDB/Webserver-DB
- Rechteprüfung serverseitig
- keine Secrets im Frontend
- keine Agent-/OBS-/Sound-/Overlay-/Command-Actions ohne späteren eigenen sicheren Scope

## Zielbild Lokal/LAN

Mögliche lokale URLs:

```text
http://127.0.0.1:3010/
http://<STREAM-PC-IP>:3010/
http://stream-pc.local:3010/   (optional später)
```

Lokal/LAN gelten:

- Login bleibt Pflicht
- Twitch-Login wird lokal separat konfiguriert
- ForrestCGN wird lokal als Owner erkannt
- EngelCGN kann lokal mit eigener Twitch-Identität arbeiten
- andere LAN-Geräte/User bekommen ohne Login/Freigabe keinen Admin-Zugriff
- lokale Entwicklung darf keine Live-Secrets ins Repo schreiben
- lokale Entwicklung darf nicht automatisch produktive Webserver-Daten verändern

## Zugriff für EngelCGN

EngelCGN soll im lokalen Netzwerk mitarbeiten können.

Die konkrete Rolle/Freigabe wird später separat festgelegt. Mögliche Zielvarianten:

- Admin/Co-Admin für ausgewählte Bereiche
- Mod-Rolle
- eigene Freigabegruppen je Modul
- keine Owner-Rechte, sofern nicht ausdrücklich später gewünscht

Wichtig:

- EngelCGN darf nicht nur deshalb alles dürfen, weil sie im LAN ist.
- LAN-Zugriff ist Transport/Zugriffsebene, nicht Berechtigungsebene.
- Rechte müssen weiterhin über Backend/DB/Permission-Modell entschieden werden.

## Lokale Twitch-OAuth-Anforderungen

Für echten lokalen Twitch-Login braucht die Twitch-App später zusätzlich eine lokale Redirect-URI.

Beispiele:

```text
http://127.0.0.1:3010/api/remote/auth/twitch/callback
http://<STREAM-PC-IP>:3010/api/remote/auth/twitch/callback
```

Welche Redirect-URI Twitch für LAN/IP/localhost akzeptiert, muss beim späteren Setup konkret geprüft werden.

Wichtig:

- Twitch Client Secret niemals ins Repo
- lokale Env-Datei niemals committen
- Server-Env und Local-Env strikt trennen
- lokale Callback-URL darf produktive Callback-URL nicht ersetzen, sondern nur ergänzen

## Lokale Env/Config

Später braucht der lokale Betrieb eine eigene Konfiguration.

Beispielhafte Zielwerte, noch nicht als Datei bauen:

```text
REMOTE_MODBOARD_HOST=0.0.0.0
REMOTE_MODBOARD_PORT=3010
PUBLIC_BASE_URL=http://<STREAM-PC-IP>:3010
TWITCH_REDIRECT_URI=http://<STREAM-PC-IP>:3010/api/remote/auth/twitch/callback
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=Lax
```

Hinweise:

- `0.0.0.0` wäre für LAN-Erreichbarkeit nötig.
- Für reinen Einzelplatztest reicht `127.0.0.1`.
- `SESSION_COOKIE_SECURE=false` nur lokal/HTTP, niemals produktiv.
- Produktiv bleibt HTTPS mit sicheren Cookies.

## Lokale DB-Strategie

Für lokalen Betrieb müssen DB und Sessions geklärt werden.

Option A: lokale MariaDB-Testdatenbank  
Empfehlung, weil der Webserver ebenfalls MariaDB nutzt.

Vorteile:

- realistisch nah an Produktion
- Rollen/Permissions/Sessions testbar
- keine Live-Daten gefährdet

Nachteile:

- lokales DB-Setup nötig
- Testdaten/Seed nötig

Option B: lokale SQLite/Dev-DB  
Nur sinnvoll, wenn Remote-Modboard-Code es sauber unterstützt.

Vorteile:

- einfacher lokal
- keine MariaDB-Installation nötig

Nachteile:

- Abweichung zur Produktion
- mögliche Sonderfälle/Parallelstruktur

Option C: lokale Nutzung der Webserver-DB  
Nicht empfohlen.

Gründe:

- Live-Daten/Sessions/Rechte werden unnötig vermischt
- Risiko durch lokale Tests
- schlechter Rollback/Debug

Empfehlung für spätere Umsetzung:

```text
lokale MariaDB-Testdatenbank
```

## Sicherheitsgrenzen

Lokal darf nicht heißen: jeder im WLAN darf alles.

Verbindlich für spätere Planung:

- Login immer erforderlich
- Rechteprüfung serverseitig/lokal-backendseitig
- Owner/Admin/Mod/Gruppe sauber getrennt
- keine Dev-/LAN-Bypass-Regeln produktiv aktivieren
- keine Secrets in Repo/Frontend/Logs/Chat
- keine Remote-Agent-Actions ohne separaten Scope
- keine freien Shell-/Datei-/Prozessbefehle
- keine OBS-/Sound-/Overlay-/Command-Steuerung ohne eigenen späteren Sicherheitsblock

## Tests: lokal vs. Webserver

Korrekte Trennung bleibt:

### Lokal im aktuellen ZIP-Step-Workflow

```text
installstep.cmd
node --check
git status
stepdone.cmd
```

Aktuell ist lokales `3010` nicht automatisch vorhanden.

### Webserver nach stepdone

```text
Deploy aus frischem GitHub/dev-Clone
Service restart
Readiness auf 127.0.0.1:3010/api/remote/status
Browser/curl-Test
```

### Später mit lokalem Modboard-Betrieb

Wenn der lokale Betriebsmodus gebaut ist, kommen zusätzliche lokale Tests dazu:

```text
lokaler Start des Remote-Modboards
lokaler Twitch-Login
ForrestCGN local owner check
EngelCGN local access check
LAN-Zugriff von zweitem Gerät
lokale Permission-Diagnose
```

## Spätere Umsetzungssteps

Empfohlene Reihenfolge:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
RDAP_LOCAL_MODE3_TWITCH_CALLBACK_CONFIG
RDAP_LOCAL_MODE4_LOCAL_DB_TEST_SCHEMA
RDAP_LOCAL_MODE5_LAN_ACCESS_TEST
```

Noch nicht direkt bauen:

- keine lokale DB-Migration ohne Backup/Go
- keine Produktiv-Env kopieren
- keine Secrets ins Repo
- keine User-/Rollen-Writes
- keine Admin-Write-UI

## Verhältnis zu Admin-Userverwaltung

Dieser Lokal/LAN-Plan ersetzt nicht die Admin-Userverwaltung.

Aktueller Admin-Pfad bleibt:

```text
RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC: getestet
nächster Admin-Step: RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION
```

Aber ab jetzt muss jede Admin-/Permission-/Dashboard-Planung mitdenken:

```text
Onlinebetrieb + Lokal-/LAN-Betrieb
```

## Offene Entscheidungen

Vor dem ersten echten Local-Mode-Code-Step klären:

1. Auf welchem Gerät läuft lokal das Remote-Modboard?
2. Welche lokale URL/IP soll EngelCGN nutzen?
3. Wird lokal Port `3010` genutzt oder ein anderer?
4. Wird eine lokale MariaDB-Testdatenbank eingerichtet?
5. Welche Rechte bekommt EngelCGN initial?
6. Welche Twitch Redirect-URIs werden in der Twitch-App ergänzt?
7. Wie wird verhindert, dass lokale Env versehentlich committed wird?

## Aktueller Abschlussstatus

Dieser Step dokumentiert nur das Zielbild und die Sicherheitsgrenzen.

Keine Funktionalität entfernt.  
Keine produktiven Writes gebaut.  
Keine DB geändert.  
Keine Secrets berührt.
