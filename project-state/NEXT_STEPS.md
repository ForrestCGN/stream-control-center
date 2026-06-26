# NEXT_STEPS

Stand: RDAP56_PERMISSION_DETAIL_NEXT_SCOPE_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP57_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_PREPARED
```

## Ziel

```text
Effektive Rollenrechte im bestehenden Admin-User-Detail read-only nach Bereichen gruppieren und besser einordnen.
```

## Richtung

```text
- Bestehendes /api/remote/auth/model weiterverwenden.
- Bestehendes Asset erweitern: remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
- Rechte read-only gruppieren:
  - Admin
  - Agent / Status
  - Dashboard / Remote
- Admin-/Write-nahe Rechte als Modellanzeige erklaeren, nicht als UI-Freigabe.
- Bestehende 0-Targets-Erklaerung erhalten.
- Diagnose erhalten.
```

## Vorher pruefen

```text
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP56.md
docs/current/RDAP56_PERMISSION_DETAIL_NEXT_SCOPE_PLAN.md
docs/current/RDAP55B_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_LIVE_CONFIRMED_DOCS.md
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/auth-db-read.service.js
```

## Nicht in diesem Step aendern

```text
Keine Backend-Aenderung ohne separaten Plan.
Keine neue Backend-Route.
Keine DB-Migration.
Keine Permission-Verwaltung mit Writes.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein Delete.
Keine Community-Read-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```
