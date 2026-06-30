# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.110_ADMIN_USERS_LIVE_RECHECK_DOCS_OR_NEXT_RUNTIME_FIX`

## Voraussetzung

Server-Ausgaben aus 0.2.109 liegen vor.

## Zu pruefen

```text
/api/remote/routes
/api/remote/admin/users/write-foundation-diagnostic
/api/remote/admin/users/permission-diagnostic
```

## Entscheidung danach

```text
A. Status nur dokumentieren, wenn alles sauber read-only ist.
B. Kleinen Runtime-Fix planen, falls Status/API widerspruechlich ist.
C. Admin/User UI-Read-only naechstklein planen.
```

## Harte Regeln

```text
keine Writes
keine Gates aktivieren
keine Login-/Session-Umstellung
keine Agent-Actions
erst Ausgaben auswerten
```
