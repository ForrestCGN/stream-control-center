# NEXT_STEPS

Stand: RDAP64B_ADMIN_NOTE_UPDATE_UI_ROUTER_HOTFIX  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP64C_ADMIN_NOTE_UPDATE_UI_LIVE_VERIFY
```

## Ziel

```text
Nach lokalem stepdone und Webserver-Deploy pruefen, ob Admin-Notizen/User-Detail/Benutzerverwaltung wieder sichtbar sind und ob Update-UI pro aktiver Notiz angezeigt wird.
```

## Live-Checks

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.adminNoteUiStatusSemantics'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteUpdateConfirmed'
```

## Browser-Checks

```text
Admin -> Admin-Notizen zeigt Inhalt.
Admin -> User-Detail zeigt Inhalt.
Admin -> Benutzerverwaltung bleibt sichtbar.
Aktive Admin-Notiz zeigt bei Schreibrecht Bearbeiten.
Bearbeiten oeffnet Inline-Edit.
Speichern nutzt Update-Route mit confirmWrite:true.
Nach Erfolg wird neu geladen.
```
