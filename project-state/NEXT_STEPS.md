# NEXT_STEPS

Stand: RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED
```

## Ziel

```text
Frontend-only read-only Permission-/Rollen-Detailansicht im bestehenden Admin-Bereich vorbereiten.
```

## Richtung

```text
- Bestehendes /api/remote/auth/model auswerten.
- Bestehende Admin-User-Detail-/Rollen-&-Rechte-Struktur erweitern.
- Rollen, Gruppen, Role-Permissions und Module-Permissions read-only einordnen.
- Effektive Rechte nur anzeigen/erklaeren.
- Module/Targets gruppieren, soweit Daten eindeutig vorhanden sind.
- Safety-Hinweis sichtbar halten: Frontend zeigt nur an, Backend entscheidet.
- Keine Rollen-/Permission-Vergabe.
- Keine Session-Revocation.
- Keine neue Backend-Route, wenn vorhandene Daten reichen.
```

## Vorher pruefen

```text
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP52.md
docs/current/RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN.md
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/services/auth-db-read.service.js
```

## Nicht in diesem Step aendern

```text
Keine Backend-Aenderung ohne separaten Plan.
Keine DB-Migration.
Keine Permission-Verwaltung mit Writes.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein Delete.
Keine Community-Read-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Erwarteter Testumfang fuer RDAP53

```text
Node-Syntaxchecks fuer geaenderte JS-Dateien.
UI-Funktion im Browser pruefen.
GET /api/remote/auth/model bleibt Datenquelle.
Keine Write-Routen aktiviert.
Keine produktiven Writes.
Nach lokalem stepdone bei Frontend-Code: Webserver-Deploy aus frischem GitHub/dev-Clone.
```
