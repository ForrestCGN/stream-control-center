# RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN

Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Doku-/Plan-only

## Zweck

RDAP40 hat die Admin-Note Create-UI live bestaetigt. Der Button `Neue Notiz` ist sichtbar, wenn `admin.users.note.write` erlaubt ist, und erstellt erfolgreich neue Admin-Notizen ueber die bestehende RDAP39-Backend-Route.

Dieser Step plant nur die semantische Bereinigung der Status-/Routes-Summary. Es werden keine Backend-, UI- oder DB-Dateien geaendert.

## Ausgangslage

Live bestaetigt:

```text
Admin -> Admin-Notizen zeigt 3 Notizen.
Create-Button "Neue Notiz" sichtbar.
Create ueber UI erfolgreich.
Readback/Refresh nach Create erfolgreich.
Keine Update-/Deactivate-/Delete-Buttons sichtbar.
```

RDAP40-Testnotiz:

```text
note_uid: admin_note_20260625171342_d1f871dd6370
target_user_uid: tw:127709954
status: active
note_text: —test
```

## Semantik-Problem

`/api/remote/routes` zeigt in `adminNoteWriteConfirmed` noch:

```text
uiWriteButtonsEnabled: false
```

Das stammt aus RDAP39. Damals war korrekt gemeint:

```text
Der Backend-Create-Write aktiviert nicht automatisch UI-Schreibbuttons.
```

Nach RDAP40 ist diese Formulierung aber ungenau, weil bewusst ein UI-Create-Button existiert:

```text
Create-Button sichtbar fuer Admins mit admin.users.note.write.
Create nutzt weiter Body-confirmWrite, Audit, Lock und Readback.
```

Das ist kein akuter Funktionsfehler, sondern eine Status-/Dokumentationsunsauberkeit.

## Gewuenschte neue Status-Semantik

Empfohlen fuer den naechsten technischen Cleanup:

```text
backendAutoUiWriteButtonsEnabled: false
adminNoteCreateUiPrepared: true
adminNoteCreateButtonVisibleForWritePermission: true
adminNoteUpdateUiPrepared: false
adminNoteDeactivateUiPrepared: false
adminNoteDeleteUiPrepared: false
```

Optional kann `uiWriteButtonsEnabled` fuer Rueckwaertskompatibilitaet vorerst stehen bleiben, sollte dann aber nicht mehr als alleinige Aussage verwendet werden.

## Naechster technischer Step

```text
RDAP41B_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP
```

Betroffene Dateien voraussichtlich:

```text
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## RDAP41B Grenzen

```text
Keine neue Schreibfunktion.
Keine DB-Migration.
Keine Permission-Vergabe.
Keine UI-Erweiterung fuer Update/Deactivate/Delete.
Keine Community-Seiten-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control.
Keine freien Shell-/Datei-/Prozess-/URL-Ausfuehrungen.
```

## Tests fuer RDAP41B

Nach Umsetzung lokal:

```powershell
node --check .\remote-modboard\backend\src\services\admin-user-admin-note-write-confirmed.service.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
git status --short
git diff --stat
```

Nach Webserver-Deploy:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteWriteConfirmed'
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.adminNoteWriteConfirmed'
```

Erwartung:

```text
Create bleibt enabled.
Update/Deactivate/Delete bleiben disabled.
Neue Statusfelder beschreiben RDAP40-UI sauber.
Keine neue produktive Aktion wird aktiviert.
```

## Kein Webserver-Deploy fuer RDAP41

RDAP41 ist Doku-/Plan-only. Lokal reicht:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN.zip" "RDAP41 Admin-Note UI Status Cleanup Plan"
git status
.\stepdone.cmd "RDAP41 Admin-Note UI Status Cleanup Plan; Doku/Projektstatus/TODO/NEXT_STEPS/CHANGELOG aktualisiert"
```

Kein Webserver-Deploy fuer RDAP41 noetig.
