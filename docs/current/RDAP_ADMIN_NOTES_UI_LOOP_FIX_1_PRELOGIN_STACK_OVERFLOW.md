# RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW

Stand: 2026-06-27  
Typ: Frontend-Code-Fix  
Scope: `remote-modboard/backend/public/assets/rdap28-admin-notes.js`  
Code-Aenderung: ja, Frontend-JS  
DB-Aenderung: nein  
Backend-Route-Aenderung: nein  
Webserver-Deploy nach `stepdone`: ja

## Anlass

Codex/Browser-Review meldete vor dem Twitch-Login eine endlose Render-Schleife:

```text
renderAdminNotesResult -> renderCreateAvailability -> closeUpdateEditor -> renderAdminNotesResult
```

Folge:

```text
RangeError: Maximum call stack size exceeded
rdap28-admin-notes.js, gemeldet um Zeile 687
```

## Ursache im echten Code

`renderAdminNotesResult(result)` ruft `renderCreateAvailability(canWrite, result)` auf.

Wenn Read/Write nicht verfuegbar ist, ruft `renderCreateAvailability()` beide Dialog-Schliesser auf:

```text
closeCreateDialog({ keepNotice: true })
closeUpdateEditor({ keepNotice: true })
```

`closeUpdateEditor()` hat anschliessend immer erneut gerendert, sobald `latestAdminNotesResult` gesetzt war:

```text
if (latestAdminNotesResult) renderAdminNotesResult(latestAdminNotesResult)
```

Damit konnte ein Render-Pfad im nicht eingeloggten bzw. nicht schreibberechtigten Zustand rekursiv wieder in sich selbst laufen.

## Umsetzung

In `closeUpdateEditor(options)` wurde ein sicherer Render-Guard eingebaut:

- berechnet zuerst den naechsten `updateState`,
- rendert nur noch, wenn sich der State wirklich geaendert hat,
- respektiert `options.skipRender`,
- verhindert dadurch rekursives Re-Rendern aus `renderCreateAvailability()`.

In `renderCreateAvailability()` wird beim automatischen Sperr-/Nicht-Write-Zustand jetzt aufgerufen:

```text
closeUpdateEditor({ keepNotice: true, skipRender: true })
```

Damit bleibt manuelles Schliessen / Bearbeiten weiter moeglich, aber der automatische Render-Pfad loest keine Stack-Overflow-Schleife mehr aus.

## Bewusst nicht in diesem Step

Nicht enthalten, weil nur `rdap28-admin-notes.js` hochgeladen wurde:

- Login-Buttontext `Anmelden` -> `Mit Twitch anmelden`.
- Verwaistes `• Admin-Notizen` final im HTML/Shell pruefen.
- Status-/Semantik-Doku-Fix aus Audit 1.

Dafuer ist spaeter mindestens folgende Datei noetig:

```text
remote-modboard/backend/public/index.html
```

Je nach Ursache des verwaisten Navigationspunkts ggf. zusaetzlich:

```text
remote-modboard/backend/public/assets/remote-modboard.js
```

## Tests

Lokal nach Installstep:

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git diff -- remote-modboard/backend/public/assets/rdap28-admin-notes.js
git status
```

Nach `stepdone` ist ein Webserver-Deploy noetig, weil eine Datei unter `remote-modboard/` geaendert wird.

## Erwarteter Browser-Test nach Deploy

- `https://mods.forrestcgn.de/` im ausgeloggten Zustand oeffnen.
- Kein `RangeError: Maximum call stack size exceeded` in der Browser-Konsole.
- Login-Seite bleibt sichtbar und bedienbar.
- Nach Twitch-Login Admin-Notizen oeffnen.
- Admin-Notizen Read/Create/Update UI oeffnet ohne Render-Schleife.
- Deactivate/Delete bleiben weiterhin nicht nutzbar.
