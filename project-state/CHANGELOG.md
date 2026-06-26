# CHANGELOG

## 2026-06-26 - RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN

```text
Doku-only / Plan-only.
Update-UI-Scope fuer bestehende Admin-Notes-UI geplant.
Keine UI-Code-Aenderung.
Kein Backend-Code.
Kein Webserver-Deploy noetig.
Naechster empfohlener Step: RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION.
```

Festgelegt:

```text
Update-Button spaeter nur in Admin -> Admin-Notizen.
Nur aktive Notizen.
Nur bei erfolgreicher Readroute und Schreibrecht.
confirmWrite:true im JSON-Body.
Nach Erfolg Readroute neu laden.
Keine Optimistic-Mutation.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
```
