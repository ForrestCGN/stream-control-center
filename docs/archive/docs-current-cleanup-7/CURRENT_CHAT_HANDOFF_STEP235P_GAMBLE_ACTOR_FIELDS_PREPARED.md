# CURRENT CHAT HANDOFF – STEP235P Gamble Actor Fields Prepared

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Config / Gamble

## Ziel

Die sichtbaren technischen Actor-/Rollenfelder wurden aus der normalen Gamble-Config-UI entfernt, ohne Backend-/Audit-/Write-Funktion zu verändern.

Das spätere Rechte-/Session-System wird nur vorbereitet, nicht umgesetzt.

## Geänderte Datei

- `htdocs/dashboard/modules/loyalty_games.js`

## Änderung

Aus `Loyalty → Config → Gamble` entfernt:

- sichtbares Feld `Actor Login`
- sichtbares Feld `Actor Rolle`

Neu vorbereitet:

- `getDashboardActorFallback()`
- `getDashboardActor()`

## Aktuelles Verhalten

Solange noch keine echte Dashboard-Session/Rechtequelle aktiv genutzt wird, sendet der Gamble-Config-Write intern weiter:

```text
actorLogin = forrestcgn
actorDisplayName = ForrestCGN
actorRole = streamer
```

Damit bleiben Backend-Write-Schutz und Audit stabil.

## Vorbereitung für später

`getDashboardActor()` prüft später nutzbare Daten aus:

```text
window.CGN.auth.user
```

Unterstützte vorbereitete Felder:

```text
login
userLogin
username
displayName
display_name
name
role
dashboardRole
permissionRole
```

Wenn keine sinnvollen Sessiondaten vorhanden sind, greift der sichere Fallback.

## Nicht geändert

- kein Backend
- keine Datenbank
- keine API
- keine echte Rechte-/Session-Logik
- keine Login-Funktion
- keine Commands
- keine Gamble-Engine
- keine Giveaways
- kein Loyalty-Core
- keine Overlays

## Tests

Syntaxcheck:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\app.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

```text
/dashboard
Loyalty → Config → Gamble
Actor Login nicht sichtbar
Actor Rolle nicht sichtbar
Speichern fragt weiter nach Bestätigung
Speichern funktioniert
Audit zeigt weiterhin forrestcgn / streamer
keine Console-Fehler
```

## StepDone

Nach erfolgreichem Test:

```powershell
.\stepdone.cmd "STEP235P Gamble Actor Fields Prepared"
```

## Risiko

Niedrig. Es wird nur die sichtbare UI bereinigt. Die weiterhin benötigten Actor-/Audit-Werte werden intern gesendet.
