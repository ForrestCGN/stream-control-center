# RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS

Stand: RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Doku-only / Live-Bestaetigung

## Zweck

RDAP44B dokumentiert die Live-Bestaetigung von RDAP44:

```text
RDAP44_ADMIN_NOTE_TARGET_USER_SELECTION_PREPARED
```

RDAP44 loest die Admin-Notizen-UI vom dauerhaft fest verdrahteten Zieluser `tw:127709954` und zeigt eine Zieluser-Auswahl in der bestehenden Admin-Notizen-UI.

Dieser Step ist bewusst **Doku-only**.

## Bestaetigter Vorstand

```text
RDAP39: kontrollierter Backend-Create-Write fuer Admin-Notizen live bestaetigt.
RDAP39C: Admin-Note Read-Route wiederhergestellt und live bestaetigt.
RDAP40: Admin-Note Create-UI live bestaetigt.
RDAP42: Status-/Routes-Semantik bereinigt und live bestaetigt.
RDAP43: Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen geplant.
RDAP44: Zieluser-Auswahl in Admin-Notizen-UI umgesetzt und live sichtbar.
```

## Geaenderte Funktion in RDAP44

```text
Admin -> Admin-Notizen
- Zieluser-Auswahl sichtbar
- Default bleibt ForrestCGN / tw:127709954
- Zieluser werden aus vorhandener Auth-/Benutzer-Datenquelle gelesen
- Auswahl steuert die Read-Route per targetUserUid
- Create nutzt denselben ausgewaehlten targetUserUid
- Create-Button bleibt nur fuer write-berechtigte Admins sichtbar
- Read bleibt an admin.users.note.read gebunden
- Create bleibt an admin.users.note.write + confirmWrite + Audit + Lock + Readback gebunden
```

## Live-Bestaetigung

Auf dem Webserver wurde bestaetigt, dass die ausgelieferte Asset-Datei die RDAP44-Logik enthaelt:

```bash
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js \
  | grep -n "DEFAULT_TARGET_USER\|adminNotesTargetSelect\|TARGET_USER_UID"
```

Bestaetigter Befund:

```text
DEFAULT_TARGET_USER vorhanden
adminNotesTargetSelect vorhanden
selectedTargetUser vorhanden
TARGET_USER_UID nicht mehr vorhanden
```

Im Browser auf `https://mods.forrestcgn.de` wurde bestaetigt:

```text
Admin -> Admin-Notizen
- Zieluser-Auswahl ist sichtbar
- Dropdown ist sichtbar
- Default ist ForrestCGN @forrestcgn · tw:127709954
- Name wird angezeigt: ForrestCGN
- Login wird angezeigt: @forrestcgn
- UID wird angezeigt: tw:127709954
- Read: true
- Write: true
- Notizen: 3
- Tabelle: true
- Create-Form zeigt Zieluser: tw:127709954
```

Damit ist RDAP44 funktional live bestaetigt.

## Nicht geaendert

```text
Keine Backend-Route geaendert.
Keine DB-Migration.
Keine Permission-Verwaltung.
Keine Community-Anbindung.
Keine Admin-Note Update-Funktion.
Keine Admin-Note Deactivate-Funktion.
Kein physisches Delete.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
```

## Weiterhin aktive Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> weiterhin disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> weiterhin disabled
```

## Separater offener Befund: OAuth-Safety

Beim Webserver-Deploy/Deploy-Script wurde ein separater Safety-Befund sichtbar:

```text
twitch/start HTTP 302
twitch/callback HTTP 403
[fehler] OAuth Safety verletzt. Erwartet 403/403.
```

Wichtig:

```text
Dieser Befund ist nicht Teil der RDAP44-Admin-Notizen-UI.
RDAP44 ist funktional live bestaetigt.
Der OAuth-Safety-Befund muss als eigener Folge-Step geprueft/gefixt werden.
```

Der Befund darf nicht in RDAP44 versteckt werden.

## Empfohlener naechster Step

```text
RDAP45_REMOTE_AUTH_TWITCH_START_SAFETY_FIX_OR_DECISION
```

Ziel:

```text
Klaeren, warum /api/remote/auth/twitch/start HTTP 302 liefert, obwohl der Safety-Check 403 erwartet.
Entscheiden, ob der erwartete Safety-Status angepasst werden muss oder die Route wieder haerter blockiert werden soll.
Keine Admin-Notizen-UI-Aenderung.
Keine DB-Migration.
Keine Permission-Verwaltung.
Keine produktiven neuen Writes.
```

## Doku-Auswirkung

RDAP44B aktualisiert:

```text
docs/current/RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP44B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Kein Webserver-Deploy noetig, weil Doku-only.
