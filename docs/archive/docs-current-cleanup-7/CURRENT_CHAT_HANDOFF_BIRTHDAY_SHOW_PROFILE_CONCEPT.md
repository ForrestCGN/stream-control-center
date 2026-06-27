# Current Chat Handoff - Birthday Show/Profile Concept

Stand: STEP_BIRTHDAY_SHOW_PROFILE_CONCEPT

## Ergebnis dieses Chats

Es wurde ein Konzept für das Birthday-Show-System erstellt.

Dateien im ZIP:

```text
docs/system-inspection/BIRTHDAY_SHOW_PROFILE_CONCEPT.md
docs/modules/birthday-show-profile-concept.md
docs/current/CURRENT_CHAT_HANDOFF_BIRTHDAY_SHOW_PROFILE_CONCEPT.md
```

## Wichtige Entscheidung

Das Geburtstagsplugin soll nicht nur eine einfache Gratulation sein, sondern ein richtiges Show-System:

- Standard-Shows anlegen/bearbeiten/abspielen
- User-Shows pro Twitch-User anlegen/bearbeiten/abspielen
- manuelle Show getrennt von automatischer kleiner Chat-Gratulation
- Dashboard-Builder geplant
- eigener Backend-Start-Endpunkt `POST /api/birthday/show/start` empfohlen

## Nicht geändert

- kein Backend-Code
- kein Dashboard-Code
- kein Overlay-Code
- keine DB
- keine Registry
- keine Modulversion
- keine produktive Show

## Nächster empfohlener Schritt

```text
STEP_BIRTHDAY_READONLY_SHOW_STATE_AUDIT
```

Read-only prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/assets" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/users" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue" | ConvertTo-Json -Depth 8
```
