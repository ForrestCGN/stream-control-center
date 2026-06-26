Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG: Immer zuerst GitHub/dev und echte Dateien lesen, danach kurzen Plan nennen und auf `go` warten. Keine Patch-/Regex-/Set-Content-Anweisungen. ZIPs mit echten Repo-Zielpfaden. Lokal: installstep.cmd -> Checks -> git status -> stepdone.cmd. Backend-/Frontend-Code danach per frischem GitHub/dev-Clone deployen.

## Aktueller Stand

RDAP64B_ADMIN_NOTE_UPDATE_UI_ROUTER_HOTFIX ist vorbereitet bzw. nach Einspielung der erwartete Stand.

RDAP64 hatte die Admin-Note Update-UI implementiert. Live-Browser zeigte danach aber leere Admin-Seiten, waehrend Backend-Routen sauber waren.

RDAP64B korrigiert nur die Frontend-Router/Tab-Semantik:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Wichtig:

```text
- Admin-Notizen data-tab wieder read/create.
- setRdap40Page fuer Admin-Notizen wieder read/create.
- Safety-Render restoreInjectedAdminPanelVisibility ergaenzt.
- Update-UI-Code bleibt erhalten.
- Kein Backend, keine DB, keine neue Permission.
- Kein Deactivate/Delete.
```

## Naechster empfohlener Step

```text
RDAP64C_ADMIN_NOTE_UPDATE_UI_LIVE_VERIFY
```

## Zu pruefen

```text
Admin -> Admin-Notizen zeigt Inhalt.
Admin -> User-Detail zeigt Inhalt.
Admin -> Benutzerverwaltung bleibt sichtbar.
Aktive Admin-Notiz zeigt bei Schreibrecht Bearbeiten.
Inline-Edit funktioniert.
Update sendet confirmWrite:true.
Nach Erfolg wird Readroute neu geladen.
```

Weiterhin verboten:

```text
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
```
