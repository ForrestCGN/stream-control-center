# RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP64 erweitert die bestehende Admin-Notes-UI um eine kontrollierte Update-UI.

## Geändert

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Umsetzung

```text
UPDATE_ENDPOINT ergänzt: /api/remote/admin/users/admin-notes/update
Bearbeiten-Button pro aktiver Notiz ergänzt.
Inline-Edit-Panel in derselben Notizkarte ergänzt.
Textarea wird mit aktuellem noteText vorausgefüllt.
Zeichenzähler 0..5000 ergänzt.
Speichern sendet confirmWrite:true im JSON-Body.
Busy-State während Update ergänzt.
Fehler werden sichtbar in der Notizkarte angezeigt.
Nach Erfolg wird die bestehende Readroute neu geladen.
Keine Optimistic-Mutation.
```

## Sichtbarkeit

Der Bearbeiten-Button erscheint nur wenn:

```text
Readroute erfolgreich geladen wurde.
Serverseitig Schreibrecht erkennbar ist.
Notiz status active hat.
noteUid vorhanden ist.
targetUserUid valide ist.
```

## Request

```json
{
  "confirmWrite": true,
  "targetUserUid": "<targetUserUid>",
  "noteUid": "<noteUid>",
  "noteText": "<neuer Text>"
}
```

## Weiterhin nicht gebaut

```text
Kein Deactivate.
Kein Delete.
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Checks

```powershell
node --check .emote-modboardackend\publicssetsdap28-admin-notes.js
```

## Deploy

Da Frontend-Code im deployten `remote-modboard/` geändert wurde, braucht RDAP64 nach lokalem `stepdone.cmd` Webserver-Deploy aus frischem GitHub/dev-Clone.
