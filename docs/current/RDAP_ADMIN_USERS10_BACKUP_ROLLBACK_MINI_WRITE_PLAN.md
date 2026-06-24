# RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard / Admin-Users

## Zweck

Dieser Step dokumentiert den Backup-/Rollback- und Sicherheitsplan fuer den kleinsten spaeteren Admin-Write.

Wichtig: Dieser Step baut noch keinen produktiven Admin-Write.

## Ausgangsstand

Bestaetigter vorheriger Stand:

```text
RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
```

Remote bestaetigt:

```text
moduleBuild: RDAP_ADMIN_USERS9_LOCK_HELPER_DISABLED_PLAN
statusApiVersion: rdap_admin_users9.v1
lockHelperPrepared: true
lockWriteEnabled: false
lockDiagnostic.helperPrepared: true
lockDiagnostic.writeEnabled: false
writeEnabled: false
writesStillBlocked: true
```

Vorbereitete Sicherheitsbausteine:

```text
Permission-Read-Diagnose: vorbereitet
Confirm-Write-Helper: vorbereitet, Writes deaktiviert
Audit-Helper: vorbereitet, Writes deaktiviert
Lock-Helper: vorbereitet, Writes deaktiviert
Admin-Writes: weiterhin aus
DB-Migration: keine
UI-Schreibbuttons: keine
```

## Ziel von RDAP_ADMIN_USERS10

RDAP_ADMIN_USERS10 legt fest, welche Sicherheitsbedingungen vor einem spaeteren Mini-Write zwingend erfuellt sein muessen.

Dieser Step verbindet:

```text
Permission-Pruefung
Confirm-Write
Audit
Locking
Backup
Rollback
separates Go
```

## Nicht-Ziel dieses Steps

Dieser Step macht ausdruecklich NICHT:

```text
Keine User freigeben/sperren
Keine Rollen vergeben/entziehen
Keine Gruppen/Freigaben setzen/entfernen
Keine Sessions widerrufen
Keine DB-Migration
Keine UI-Schreibbuttons
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine produktiven Remote-Writes
Keine Secrets
```

## Kleinster spaeterer Admin-Write

Der erste spaeter erlaubbare Mini-Write darf nur ein eng begrenzter Admin-Write sein.

Empfohlen fuer den naechsten separaten Code-Step:

```text
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
```

Ziel von RDAP11 waere nur eine weiterhin deaktivierte Write-Foundation mit vollstaendiger Sicherheitskette, noch ohne UI-Button und noch ohne produktive Freischaltung.

Ein echter produktiver Write darf erst danach in einem weiteren eigenen Step kommen.

## Pflichtbedingungen fuer jeden spaeteren Admin-Write

Jeder spaetere Admin-Write muss vor Ausfuehrung diese Reihenfolge einhalten:

```text
1. Authenticated User vorhanden
2. Permission pruefen
3. Zielaktion gegen Allowlist pruefen
4. Lock pruefen oder setzen
5. confirm_write / confirmWrite explizit pruefen
6. Backup-Plan fuer betroffene Daten bestaetigt
7. Write ausfuehren
8. Audit-Log schreiben
9. Ergebnis ohne Secrets zurueckgeben
10. Lock sauber freigeben oder Timeout greift
```

Wenn ein Schritt fehlschlaegt:

```text
Kein Write
Kein Teil-Write
Fehler sauber melden
Audit nach Moeglichkeit als denied/failed erfassen, sobald Audit-Writes freigegeben sind
Keine Secrets ausgeben
```

## Backup-Plan fuer spaetere DB-Writes

Vor jedem echten DB-Write muss eine Sicherung der produktiven SQLite-Datenbank erstellt werden.

Produktive DB:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Backup-Ziel lokal:

```text
D:\Streaming\stramAssets\data\sqlite\backups\
```

Empfohlenes Namensschema:

```text
app.sqlite.backup_RDA_ADMIN_USERS_STEP_YYYYMMDD_HHMMSS
```

Beispiel:

```text
app.sqlite.backup_RDAP_ADMIN_USERS11_20260624_173000
```

Wichtig:

```text
Keine DB-Dateien ins Repo
Keine DB-Dateien in ZIPs
Keine Secrets oder Tokens sichern/anzeigen
Backup nur lokal/live, nicht in GitHub
```

## Rollback-Plan fuer spaetere DB-Writes

Bei Fehlern nach einem produktiven DB-Write:

```text
1. Remote-/Node-Dienst stoppen, falls der Write den laufenden Zustand beeinflusst
2. aktuelle fehlerhafte DB sichern, nicht sofort loeschen
3. zuletzt passendes Backup nach app.sqlite zurueckkopieren
4. Dienst neu starten
5. Readiness pruefen
6. Status-/Diagnose-Routen pruefen
7. Ergebnis dokumentieren
```

Rollback darf nicht automatisiert ohne klare Bestaetigung erfolgen, wenn Datenverlust seit dem Backup moeglich ist.

## Locking-Regel

Admin-Writes muessen gegen parallele Bearbeitung abgesichert werden.

Mindestanforderung:

```text
Lock-Key pro Scope/Aktion/Zielobjekt
Owner/User im Lock speichern
Heartbeat oder Timeout
Admin-/Owner-Override nur spaeter mit Audit
Lesender Zugriff bleibt moeglich
Schreibender Zugriff fuer andere wird blockiert
```

Fuer den ersten Mini-Write soll der Lock-Scope bewusst klein bleiben, z. B.:

```text
admin_users:test_write_foundation
```

oder fuer einen spaeteren echten User-Write:

```text
admin_users:user:<user_id>
```

## Confirm-Write-Regel

Jede produktive Schreibaktion braucht eine explizite Bestaetigung.

Erlaubte technische Form erst im separaten Code-Step festlegen, z. B.:

```text
confirmWrite=true
```

oder:

```text
?confirm=1
```

Wichtig:

```text
Ohne Confirm: kein Write
Confirm muss pro Request gelten
Confirm darf nicht global gemerkt werden
Confirm darf nicht im Frontend versteckt automatisch gesetzt werden
```

## Permission-Regel

Vor jedem Write muss geprueft werden:

```text
Ist der User eingeloggt?
Ist der User fuer das Remote-Modboard berechtigt?
Hat der User exakt das benoetigte Admin-Recht?
Ist die Aktion im Scope erlaubt?
```

Twitch-Rollen koennen spaeter fuer Einordnung helfen, aber die konkrete Dashboard-Berechtigung entscheidet lokal/DB-seitig.

## Audit-Regel

Sobald Audit-Writes freigegeben werden, muss jede Admin-Schreibaktion erfassen:

```text
Zeitpunkt
Actor/User
Aktion
Scope
Zielobjekt
Ergebnis
Confirm-Status
Lock-Status
Fehlercode bei Ablehnung/Fehler
keine Secrets
```

Audit muss bei produktiven Writes Pflicht sein. Ohne funktionierendes Audit darf kein echter Admin-Write live gehen.

## UI-Regel

Solange der eigentliche Admin-Write nicht separat gebaut und freigegeben ist:

```text
Keine UI-Schreibbuttons
Keine versteckten POST-Buttons
Keine Freigabe-/Sperr-/Rollen-Buttons
Keine Session-Widerruf-Buttons
```

Die UI darf hoechstens Diagnose/Read-only anzeigen.

## Empfohlene Reihenfolge ab hier

```text
RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN
  -> reiner Plan-/Doku-Step, keine Writes

RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
  -> Code-Foundation weiterhin disabled, keine produktiven Writes, keine UI-Buttons

RDAP_ADMIN_USERS12_MINI_WRITE_DRY_RUN_DIAGNOSTIC
  -> Dry-Run/Diagnose, kein produktiver Write

RDAP_ADMIN_USERS13_FIRST_ADMIN_WRITE_EXPLICIT_GO
  -> erst dann echter kleinster Admin-Write, nur mit separatem Go
```

## Test/Pruefung fuer diesen Step

Da RDAP10 nur Dokumentation/Plan aktualisiert:

```powershell
cd D:\Git\stream-control-center
git status
```

Kein Node-Neustart erforderlich.

Kein Webserver-Service-Restart erforderlich, solange nur Markdown-/Projektstatus-Dateien geaendert werden.

## Abschlusskriterium

RDAP10 ist sauber abgeschlossen, wenn:

```text
Plan-Datei vorhanden
project-state aktualisiert
TODO/NEXT_STEPS zeigen den naechsten separaten Code-Step
keine Code-Datei geaendert
keine DB-Datei enthalten
keine Secrets enthalten
keine produktiven Writes gebaut
```
