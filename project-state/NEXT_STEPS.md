# NEXT_STEPS

Stand: RDAP62B_ADMIN_NOTE_UPDATE_STATUS_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN
```

## Ziel

```text
Update-UI fuer Admin-Notizen erst planen, nicht direkt bauen.
```

## Warum zuerst Plan

```text
Das Backend-Update ist live aktiv.
Die Status-Semantik ist live bereinigt.
Jetzt muss UI-seitig sauber geklaert werden, wann und wo ein Update-Button erscheinen darf.
Dabei darf kein Deactivate/Delete/Community-Read nebenbei entstehen.
```

## Leitplanken fuer RDAP63

```text
Nur Admin-Notizen-UI.
Nur aktive Notizen.
Nur wenn Serverstatus/Readroute/Permission das erlauben.
confirmWrite:true im JSON-Body.
Keine Optimistic-Mutation.
Nach Erfolg Readroute neu laden.
Fehler sichtbar anzeigen.
Kein Deactivate-Button.
Kein Delete.
Keine Community-/Profil-/Public-/Self-Service-Freigabe.
```

## Alternativer Zwischenschritt

```text
RDAP63_ADMIN_NOTE_UPDATE_BACKEND_LIVE_TEST_PLAN
```

Nur falls vor UI ein echter Backend-Update-Live-Test separat geplant werden soll.

## Nicht direkt aendern

```text
Keine Update-UI-Implementierung ohne separaten Plan und go.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

