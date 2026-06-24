# CURRENT_STATUS

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Aktueller RDAP-Status

Remote-Modboard läuft produktiv unter:

```text
https://mods.forrestcgn.de/
```

Aktueller relevanter Stand:

```text
RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC: deployed und getestet
RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN: geplant/dokumentiert
RDAP_META1_BUILD_HEADER_CLEANUP: Build-/Header-Metadaten bereinigt
```

## Bestätigt

- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN wird als `owner` erkannt.
- ForrestCGN ist `isOwner:true` und `isAdmin:true`.
- Admin -> User & Rollen ist read-only sichtbar.
- RDAP5 Permission-Diagnose ist aktiv:
  - Route: `/api/remote/admin/users/permission-diagnostic`
  - ohne Session: `401` korrekt
  - mit ForrestCGN Session: `ok:true`, `loggedIn:true`, `canReadAdminUsers:true`
  - `canWriteAdminUsers:false`
  - keine produktiven Writes
- Profilpanel oben rechts ist Self-Service:
  - `Profil aktualisieren`
  - `Ausloggen`
- Topbar hat keinen doppelten Ausloggen-Button mehr.
- Dashboard-v2/V13-Look ist portiert.
- Login-/Denied-Seite ist zentriert.
- Grid-/Spacing ist korrigiert.

## Neue Zielentscheidung

Forrest möchte:

```text
Online über mods.forrestcgn.de arbeiten und zusätzlich lokal im Heimnetz arbeiten können.
EngelCGN soll lokal im LAN ebenfalls arbeiten können.
Lokaler Login soll ebenfalls über Twitch laufen.
```

Dazu wurde dokumentiert:

```text
docs/current/RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN.md
```

Umsetzung bleibt geparkt, bis das Web-Dashboard online stabiler ist.

## Workflow-Regel

Korrekte Reihenfolge:

```text
GitHub/dev + Docs prüfen
Plan nennen
auf go warten
ZIP bauen
installstep lokal
lokale Checks/Syntax/git status
stepdone lokal
erst danach Webserver-Deploy aus frischem GitHub/dev-Clone
Service restart
Readiness
Server-/Browser-Test
```

`stepdone.cmd` bedeutet nicht, dass der Webserver aktualisiert wurde.

## Offene technische Auffälligkeiten

- Owner/Admin-Fallback funktioniert, Reason-Ausgaben sollten später verständlicher werden.
- Lokal/LAN-Betrieb mit Twitch-Login ist noch Planung, nicht umgesetzt.
