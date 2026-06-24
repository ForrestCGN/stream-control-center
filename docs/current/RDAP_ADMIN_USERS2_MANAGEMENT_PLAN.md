# RDAP_ADMIN_USERS2_MANAGEMENT_PLAN

Stand: 2026-06-24  
Scope: Planung/Dokumentation, keine Umsetzung produktiver Admin-Writes

## Ziel

Dieser Step plant die spätere Admin-Userverwaltung im Remote-Modboard. Es werden noch keine User-/Rollen-/Gruppen-/Session-Writes gebaut.

Aktueller Ausgangspunkt:

- `mods.forrestcgn.de` läuft mit Twitch Login und serverseitiger Dashboard-Zugriffsprüfung.
- Das Self-Profilpanel oben rechts ist bewusst nur Self-Service.
- `Profil aktualisieren` synchronisiert nur eigene Twitch-Daten.
- `Admin -> User & Rollen` ist aktuell read-only sichtbar.
- Topbar hat keinen doppelten Ausloggen-Button mehr.

## Harte Grenze dieses Plans

Nicht enthalten:

- keine User freigeben/sperren
- keine Rollen vergeben/entziehen
- keine Gruppen vergeben/entziehen
- keine Session-Widerrufe
- keine DB-Migration
- keine produktiven DB-Writes
- keine Remote-Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets im Repo, Frontend, Log oder Chat

## Grundsatz: Self-Profil vs. Admin-Verwaltung

### Self-Profil oben rechts

Das Profilpanel oben rechts bleibt ausschließlich für Funktionen des aktuell eingeloggten Users:

- `Profil aktualisieren`
- `Ausloggen`

Keine Admin-Aktionen im Profilpanel.

### Admin-Verwaltung

Alle Verwaltungsfunktionen gehören ausschließlich in:

```text
Admin -> User & Rollen
```

Dort darf später verwaltet werden, aber nur mit eigenem Admin-Write-Scope, Permission-Prüfung, Confirm-Write, Locking und Audit.

## Rollen-/Rechte-Modell für spätere Writes

### Owner

Owner darf später grundsätzlich alle Admin-Userverwaltungs-Aktionen ausführen, sofern Confirm-Write, Audit und Lock aktiv sind.

Geplante Owner-Aktionen:

- User freigeben/sperren
- Admin-Rollen vergeben/entziehen
- Gruppen vergeben/entziehen
- kritische Sessions widerrufen
- Sicherheits-/Rollback-Aktionen auslösen

### Admin

Admin darf später normale Userverwaltung ausführen, aber keine Owner-/System-Sicherheitsgrenzen ändern.

Geplante Admin-Aktionen:

- normale User freigeben/sperren
- Nicht-Owner-Rollen verwalten, sofern erlaubt
- Gruppen/Freigaben verwalten, sofern erlaubt
- Userdetails einsehen
- Sessions verwalten, sofern erlaubt

### Sound-Profi

`Sound-Profi` ist keine globale System-/Owner-Rolle. Sie soll als streamerfreundliche Spezialgruppe/Freigabe behandelt werden.

Geplante Bedeutung:

- Media/Sounds hochladen, bearbeiten, testen
- Sounds Kategorien/Commands/Kanalpunkte-Aktionen zuordnen, wenn das jeweilige Modul später freigegeben ist
- keine Owner-/Security-/Systemrechte
- keine freie Agent-/Shell-/Datei-/Prozesssteuerung

Die konkrete Modulmatrix wird später separat geplant, sobald echte Module verwaltet werden.

## Confirm-Write-Konzept

Jede spätere produktive Admin-Aktion braucht eine explizite Schreibbestätigung.

Mindestanforderung:

- UI zeigt klare Aktion und Ziel-User.
- Backend akzeptiert produktive Aktion nur mit Confirm-Write-Flag.
- Backend prüft zusätzlich Permission serverseitig.
- Backend schreibt Audit vor oder gemeinsam mit der Änderung.
- Keine produktiven Writes über GET, Auto-Refresh, Seitenladen oder Diagnose-Routen.

Beispielhafte spätere API-Regel:

```text
POST /api/remote/admin/users/:userId/actions/...
confirmWrite=true erforderlich
```

Die genaue Route wird erst im eigenen Implementierungs-Step festgelegt.

## Audit-Log-Konzept

Jede spätere Admin-Schreibaktion muss nachvollziehbar gespeichert werden.

Pflichtfelder:

- Zeitpunkt
- Actor/User, der die Aktion ausführt
- Actor-Rolle/Rechte zum Zeitpunkt der Aktion
- Ziel-User
- Aktionstyp
- alter Wert
- neuer Wert
- Ergebnis: success/failed/denied
- Grund/Quelle: dashboard/admin-ui/api
- Request-/Session-Kontext, ohne Secrets oder Tokens zu speichern

Wichtig:

- Keine Secrets ins Audit.
- Keine Twitch-Tokens ins Audit.
- Keine Session-IDs im Klartext ins Audit.
- Fehler müssen verständlich sein, aber keine sensiblen Details leaken.

## Locking-Konzept

Admin-Userverwaltung braucht einen Schreib-Lock gegen gleichzeitige Bearbeitung.

Geplantes Verhalten:

- Admin öffnet Bearbeiten -> Lock wird gesetzt.
- Lock hat Heartbeat/Timeout.
- Andere sehen read-only und wer gerade bearbeitet.
- Owner/Admin kann Lock übernehmen, wenn Timeout oder berechtigter Override.
- Jeder Lock-Override wird auditiert.

Keine Massenbearbeitung ohne eigenes Lock-/Audit-Konzept.

## Backup-/Rollback-Konzept

Vor dem ersten echten Admin-Write-Step muss festgelegt werden:

- welche Tabellen betroffen sind
- wie Backup erstellt wird
- wie Rollback erfolgt
- wie einzelne Fehländerungen zurückgenommen werden
- wie man falsche Rollen-/Gruppen-Zuweisungen korrigiert

Für DB-Migrationen gilt weiter:

- kein produktiver DB-Schema-Change ohne Backup
- kein Schema-Change ohne Rollback-Hinweis
- Migrationen nur sanft und nachvollziehbar
- keine bestehenden Daten löschen oder überschreiben

## Geplante spätere UI-Funktionen

Später im Admin-Bereich möglich, aber noch nicht in diesem Step:

- Userliste mit Status/Freigabe/Rollen/Gruppen
- Userdetails als Modal oder Detailseite
- Freigabe setzen/entfernen
- Sperre setzen/entfernen
- Rollen vergeben/entziehen
- Gruppen/Freigaben vergeben/entziehen
- Sessions anzeigen/widerrufen
- Audit-Verlauf pro User anzeigen
- Rechte-Diagnose: Warum darf ein User X sehen oder nicht sehen?

## Geplante spätere Backend-Bausteine

Noch nicht bauen, nur als Zielbild:

- `admin-user-management` Routes unter `remote-modboard/backend/src/routes/`
- serverseitige Owner/Admin-Permission-Middleware
- Confirm-Write-Prüfung
- Audit-Service für Adminaktionen
- Lock-Service-Nutzung für Userverwaltung
- Rollback-/Backup-Doku pro Write-Step

Bestehende Auth-/Read-Services weiterverwenden. Keine parallele Auth-/User-Struktur erfinden.

## Reihenfolge für spätere Umsetzung

1. Read-only Zustand erneut prüfen.
2. DB-/Tabellenstand gezielt prüfen.
3. Backup-/Rollback-Plan erstellen.
4. Permission-Middleware planen/bauen.
5. Confirm-Write und Audit bauen.
6. Locking einbinden.
7. Erst dann eine kleine, klar begrenzte Admin-Aktion bauen.
8. Lokal testen.
9. `stepdone.cmd`.
10. Danach Webserver-Deploy.

## Empfohlener nächster echter Umsetzungsschritt

Nach diesem Plan-Step sinnvoll:

```text
RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN_OR_BACKUP_SCOPE
```

Ziel dann noch nicht direkt große UI bauen, sondern zuerst:

- echte DB-Tabellen prüfen
- benötigte Permissions klären
- Backup-/Rollback-Skript planen
- kleinsten sicheren Write-Scope definieren

