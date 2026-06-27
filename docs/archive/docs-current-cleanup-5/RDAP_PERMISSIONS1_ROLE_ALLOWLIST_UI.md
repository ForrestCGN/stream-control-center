# RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI

Stand: 2026-06-24

## Ziel

Dieser Step ergänzt im Remote-Modboard einen read-only Bereich für Zugriff, Rollenmodell und Übergangs-Allowlist.

Der Bereich soll zeigen, warum ein eingeloggter User Zugriff bekommt oder gesperrt wird, welche Rollen/Gruppen aktuell aus der Auth-/Session-Struktur gelesen werden und welche Rollen-/Permission-Struktur in der Datenbank vorbereitet ist.

## Geänderte Dateien

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
docs/current/RDAP_PERMISSIONS1_ROLE_ALLOWLIST_UI.md
```

## Neue UI

Navigation:

```text
Benutzer & Rechte -> Zugriff
```

Die Seite zeigt read-only:

- aktueller Login
- Dashboard-Zugriff ja/nein
- Access-Grund
- Rollen des aktuellen Users
- Gruppen des aktuellen Users
- Permission-Test `remote.view`
- DB-Schema-Status aus `/api/remote/auth/model`
- vorhandene Rollen
- vorhandene Gruppen
- vorhandene Permissions
- Counts für User, Sessions, Locks und Audit-Logs
- Hinweis, dass die Env-Allowlist nur ein Übergangsschutz ist

## Genutzte bestehende Routen

```text
GET /api/remote/auth/me
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/auth/model
GET /api/remote/status
```

## Nicht geändert

- keine Backend-Routen
- keine DB-Writes
- keine Migration
- keine Session-Erstellung
- keine Allowlist-Änderung
- keine User-/Rollenverwaltung mit Schreibfunktion
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets

## Wichtige Grenze

Dieser Step ist ausdrücklich nur Anzeige/Vorbereitung.

Echte Verwaltung von Usern, Rollen, Gruppen, Allowlist oder Permissions braucht einen eigenen späteren Write-Scope mit:

- serverseitiger Auth-/Permission-Middleware
- Owner/Admin-Prüfung
- Confirm-Write
- Audit-Log
- Locking
- Rollback-/Safety-Regeln

## Test

Browser:

```text
https://mods.forrestcgn.de/
```

Prüfen:

- Navigation `Benutzer & Rechte -> Zugriff` sichtbar
- Seite lädt ohne JS-Fehler
- Login-/Access-Status wird angezeigt
- DB-Modell wird angezeigt oder zeigt sauber `prüfen`, falls DB nicht lesbar ist
- keine Schreibbuttons sichtbar
- Remote-Writes bleiben deaktiviert
