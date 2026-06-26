Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Verbindliche Arbeitsweise

1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen, nicht nur erwaehnen.
3. Danach kurzen Plan nennen.
4. Auf Forrests explizites `go` warten.
5. Keine Funktionalitaet entfernen.
6. Bestehende Module/Services/Dateien erweitern, wenn es fachlich passt.
7. Neue Module nur erstellen, wenn bestehende Struktur wirklich nicht passt.
8. Keine Patch-/Regex-/Set-Content-Anweisungen liefern.
9. ZIPs immer mit echten Repo-Zielpfaden bauen.
10. Forrest laedt ZIPs in den Downloads-Ordner.
11. Lokal immer: installstep.cmd -> Checks -> git status -> stepdone.cmd.
12. stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
13. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone.
14. Doku-only braucht keinen Webserver-Deploy.
15. `/opt/stream-control-center` ist kein Git-Repo.
16. Deploy-Script kopiert nur `remote-modboard/`.

## Zuerst aus GitHub/dev lesen

Bitte zu Beginn wirklich lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION_PREP.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP64C_FOR_RDAP64D.md
docs/current/RDAP64C_ADMIN_NOTE_UPDATE_UI_EXISTING_NAV_BIND_HOTFIX.md
docs/current/RDAP64B_ADMIN_NOTE_UPDATE_UI_ROUTER_HOTFIX.md
docs/current/RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION.md
docs/current/RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer RDAP64D zusaetzlich wirklich pruefen:

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/app.js
```

## Aktueller Stand

RDAP64C ist auf GitHub/dev getestet/committed/pushed.

Live-Befund nach RDAP64C:

```text
Admin -> Admin-Notizen setzt Navigation/Titel.
Der Contentbereich bleibt leer.
STRG+F5 hat nichts geaendert.
Browser-Konsole zeigt keine Fehler.
```

Wichtige Erkenntnis:

```text
remote-modboard/backend/public/index.html laedt nur /assets/remote-modboard.js.
rdap28-admin-notes.js ist nicht direkt in index.html eingebunden.
Der echte Router liegt in remote-modboard.js.
remote-modboard.js nutzt setPage(), currentPage und is-active-view.
```

Daher nicht weiter blind in `rdap28-admin-notes.js` hotfixen.

## Entscheidung

Methode B verwenden:

```text
Admin-Notes sauber ueber den Haupt-Router / Haupt-Loader integrieren.
```

Nicht Methode A als schneller Script-Append, weil das wieder ein paralleler Zusatzweg neben dem Haupt-Router waere.

## Naechster Step

```text
RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION
```

## Ziel RDAP64D

```text
remote-modboard.js bleibt Haupt-Router.
Admin-Notes wird bewusst ueber den Haupt-Router oder einen klaren Modul-Hook angebunden.
rdap28-admin-notes.js bleibt moeglichst fachlich getrennt.
Keine getrennte Hidden-/Active-/Router-Logik gegen die Shell.
```

Empfohlener Hook:

```js
window.RdapAdminNotesModule.init({
  setPage,
  loadDashboard,
  getCurrentPage
});
```

Oder, falls sicherer/einfacher:

```text
Admin-Notes-Code als klar abgegrenzter Modulbereich in remote-modboard.js integrieren.
```

## RDAP64D darf

```text
remote-modboard/backend/public/assets/remote-modboard.js aendern.
remote-modboard/backend/public/assets/rdap28-admin-notes.js aendern.
optional index.html aendern, falls fuer eine saubere Modul-Initialisierung erforderlich.
Admin-Notizen und User-Detail sauber ueber setPage/is-active-view anbinden.
Update-UI erhalten:
- Bearbeiten pro aktiver Notiz
- confirmWrite:true
- Busy-State
- Fehler sichtbar
- Reload nach Erfolg
```

## RDAP64D darf nicht

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine parallele Zweitnavigation.
```

## Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js

git status --short
git diff --stat
```

Nach `stepdone.cmd` Webserver-Deploy, weil Frontend-Code im deployten `remote-modboard/` geaendert wird.

## Start im neuen Chat

1. Die oben genannten Dateien aus GitHub/dev wirklich lesen.
2. Kurz bestaetigen: RDAP64C ist live weiterhin leer, Konsole sauber, Ursache Router/Loader.
3. RDAP64D als Main-Router-Integration kurz planen.
4. Auf Forrests explizites `go` warten.
