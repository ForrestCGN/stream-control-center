# RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP_LIVE_CONFIRMED

Stand: 2026-06-24  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Status: lokal per `stepdone.cmd` abgeschlossen und nach Webserver-Deploy im Browser geprüft

## Zweck

Dieser Stand dokumentiert den Konto-/Navigations-Cleanup nach den beiden Frontend-UX-Steps:

```text
RDAP_ACCOUNT_PANEL_CLEANUP_V2
RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP
```

## Ergebnis Konto-Panel

Das Konto-Panel oben rechts ist jetzt auf normale Nutzer-/Mod-Sicht reduziert.

Sichtbar bleiben:

```text
Avatar
Displayname
@twitch-login
Rolle
Profil aktualisieren
Ausloggen
```

Entfernt aus der normalen Kontoansicht:

```text
Dashboard-Zugriff
Access-Grund
Twitch/User UID
leere Gruppen-Zeile
Session
remote.view
Hinweisbox „Nur dein eigenes Konto“
```

Wichtig: Die technischen Daten sind nicht als Backend-Funktionalität entfernt, sondern gehören in Admin/System/Diagnosebereiche.

## User-ID-Entscheidung

Eine eigene interne CGN-User-ID kann später sinnvoll sein, insbesondere für eine spätere forrestcgn.de-Benutzerverwaltung.

Aktuelle Entscheidung:

```text
Keine rohe Twitch-UID prominent im normalen Konto-Panel anzeigen.
Interne CGN-ID erst anzeigen, wenn ein echtes internes ID-Konzept existiert.
```

## Ergebnis Navigation

Die Sidebar-Gruppe `Benutzer & Rechte` wurde entfernt bzw. nicht mehr als eigener Hauptbereich genutzt.

Persönliche Konto-/Rechte-Funktionen gehören oben rechts zum Profilbereich.

Admin-/Verwaltungsthemen gehören in den Admin-Bereich:

```text
Admin
  Benutzerverwaltung
  Rollen & Rechte
  Zugriff / Freigaben
  Sicherheit
```

System-/Diagnosethemen bleiben im Systembereich:

```text
System
  Übersicht
  Diagnose
  Routen
```

## Geändert in den Frontend-Steps

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
```

## Nicht geändert

```text
Keine Backend-Routen
Keine OAuth-/Login-Routen
Keine Session-Logik
Keine Permission-Logik
Keine DB-Dateien
Keine SQL-/Migrationsdateien
Keine Secrets
Keine produktiven Writes
Keine UI-Schreibbuttons
Keine Workflow-Tools
Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions
```

## Workflow-Hinweis aus diesem Abschnitt

Ein fehlerhafter ZIP-Step mit `tools/steps/*.ps1` wurde von `installstep.cmd` korrekt blockiert.

Für weitere Steps gilt:

```text
ZIPs mit echten Zielpfaden bauen.
Keine Patch-Skripte in Step-ZIPs verwenden.
Keine Workflow-Tools überschreiben, außer Forrest fordert ausdrücklich einen Workflow-Tool-Fix an.
```

## Nächster Fachschritt

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

RDAP12 bleibt reine Planung. Noch keinen produktiven Write bauen.
