# RDAP78B_ADMIN_NOTES_READ_RESPONSE_USER_SCOPE_FIX

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Frontend-only Korrekturstep auf Basis RDAP78

## Zweck

RDAP78 hat den sichtbaren Zieluser-Kontext verbessert, aber Count/Liste konnten weiterhin Daten aus einer Read-Antwort uebernehmen, die nicht eindeutig zum aktuell ausgewaehlten Zieluser passen.

RDAP78B macht die Ausgabe strikter:

```text
- Read-Request bleibt targetUserUid-basiert.
- Antwort wird nur fuer den aktuellen Request gerendert.
- Notizen werden zusaetzlich frontendseitig nach target_user_uid/targetUserUid gefiltert.
- Count basiert nur noch auf den Notizen, die wirklich zum aktuell ausgewaehlten Zieluser gehoeren.
- Fremde Antwort-Notizen werden nicht angezeigt.
```

## Wichtig

Das ist kein Backend-Fix und keine DB-Aenderung. Falls das Backend spaeter sauber eine eindeutige `targetSummary.targetUserUid` liefert, bleibt der Frontend-Schutz trotzdem sinnvoll.

## Geaendert

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Nicht geaendert

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Delete.
Kein Deactivate.
Keine Community-Read-Freigabe.
Keine neue Write-Freigabe.
```

## Browser-Test

```text
Admin -> Admin-Notizen
ForrestCGN auswaehlen: Count/Liste nur ForrestCGN.
EngelCGN auswaehlen: Count/Liste nur EngelCGN.
Wenn EngelCGN keine eigenen Notizen hat: 0 geladen / keine Notizen fuer EngelCGN.
Keine alten Forrest-Notizen duerfen sichtbar bleiben.
```
