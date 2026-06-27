# RDAP28_ADMIN_NOTE_READONLY_UI_PANEL

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard  
Typ: UI-Step, read-only Admin-Notiz-Anzeige

---

## 1. Zweck

RDAP28 baut eine read-only Anzeige fuer Admin-Notizen in das bestehende Remote-Modboard ein.

Neue sichtbare Seite im Dashboard:

```text
Admin -> Admin-Notizen
```

Die Seite liest die RDAP27-Route:

```text
GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
```

---

## 2. Technische Umsetzung

Die bestehende `index.html` wird nicht direkt geaendert.

Stattdessen:

```text
remote-modboard/backend/src/app.js
```

liefert fuer `/`, `/remote` und `/modboard` die bestehende `index.html` mit zusaetzlich injiziertem Script aus:

```text
/assets/rdap28-admin-notes.js
```

Das Script baut dynamisch ein:

```text
Navigationseintrag Admin -> Admin-Notizen
read-only Panel
Reload-Button
Statuskarten fuer Read/Write/Schema/Count
Notizliste
Sicherheitsanzeige
```

---

## 3. Geaenderte Dateien

```text
remote-modboard/backend/src/app.js
remote-modboard/backend/package.json
remote-modboard/backend/public/assets/rdap28-admin-notes.js
docs/current/RDAP28_ADMIN_NOTE_READONLY_UI_PANEL.md
```

---

## 4. Sicherheitsgrenzen

RDAP28 macht nicht:

```text
Keine Admin-Notiz-Erstellung
Keine Admin-Notiz-Aenderung
Keine Admin-Notiz-Loeschung
Keine Permission admin.users.note.write
Keine UI-Schreibbuttons
Keine Write-Route
Keine Community-Seiten-Anbindung
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

Die UI zeigt nur an, was der Server erlaubt.

Serverseitig bleibt RDAP27 entscheidend:

```text
gueltige Session
DashboardAccess
admin.users.note.read effectivePermissionWouldAllow true
```

---

## 5. Erwartung nach Deploy

Service:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild, .writeEnabled, .actionEnabled, .productiveAgentRuntime'
```

Erwartung:

```text
moduleBuild bleibt RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
writeEnabled false
actionEnabled false
productiveAgentRuntime false
```

Script erreichbar:

```bash
curl -fsS -I http://127.0.0.1:3010/assets/rdap28-admin-notes.js
```

Erwartung:

```text
HTTP 200
```

HTML enthaelt Script-Injektion:

```bash
curl -fsS http://127.0.0.1:3010/ | grep 'rdap28-admin-notes.js'
```

Erwartung:

```text
<script src="/assets/rdap28-admin-notes.js" defer></script>
```

Browser:

```text
https://mods.forrestcgn.de/
Admin -> Admin-Notizen
```

Erwartung:

```text
Panel sichtbar
Read true
Write false
Schema true
notes: Keine Admin-Notizen vorhanden
keine Schreibbuttons sichtbar
```

---

## 6. Naechster Step nach erfolgreichem Test

```text
RDAP28B_ADMIN_NOTE_READONLY_UI_PANEL_LIVE_CONFIRMED_DOCS
```

Spaeter moeglich, aber getrennt:

```text
RDAP29_ADMIN_NOTE_WRITE_SCOPE_PLAN
```
