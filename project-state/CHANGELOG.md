# CHANGELOG

## 2026-06-26 - RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN

RDAP60 klaert als Doku-only/Plan-only den Admin-Note Update/Deactivate-Scope.

Ergebnis:

```text
Update und Deactivate werden nicht gemeinsam gebaut.
Zuerst soll nur Admin-Note Update als kleinster sinnvoller Write-Scope vorbereitet werden.
Deactivate bleibt danach ein separater Scope.
RDAP60 selbst bleibt Doku-only/Plan-only.
```

Begruendung:

```text
Update veraendert bestehenden Notiztext und updated_by/updated_at.
Deactivate veraendert Status/Sichtbarkeit.
Beides hat unterschiedliche Risiken, Audit-Anforderungen und UI-Folgen.
Ein Misch-Step waere unnoetig riskant.
```

Geplanter Update-Scope fuer spaeter:

```text
targetUserUid
noteUid
noteText
confirmWrite: true

Server setzt:
note_text
updated_by_user_uid
updated_at
```

Pflichtschutz spaeter:

```text
Session
DashboardAccess
remote.view
admin.users.note.write
Body-confirmWrite
Lock
Audit ohne raw note_text
Readback
DB-Backup vor produktivem Test
```

Geaendert:

```text
docs/current/RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP60.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Nicht geaendert:

```text
Keine Code-Aenderung.
Keine Backend-Route.
Keine Frontend-UI.
Keine Service-Aenderung.
Keine DB-Migration.
Keine Writes.
Keine UI-Schreibbuttons.
Kein Webserver-Deploy noetig.
```

Weiterhin deaktiviert/verboten:

```text
Admin-Note Update ist noch nicht gebaut.
Admin-Note Deactivate bleibt deaktiviert.
Physisches Delete bleibt verboten.
Community-Read fuer Admin-Notizen bleibt verboten.
Permission-Verwaltung in der UI bleibt aus.
Rollen-/Gruppen-Schreibverwaltung bleibt aus.
Session-Revocation in der UI bleibt aus.
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control bleibt aus.
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung bleibt verboten.
```

Naechster empfohlener Step:

```text
RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
```
