# RDAP 0.2.108 - Admin Users Permission Scope Plan

## Ziel

Naechster Runtime-Scope: Admin/User/Permission.

Nicht Media-Picker weiter aufblasen.

## Warum

Admin/User/Permission ist die richtige Basis, bevor spaeter echte Writes, Gates oder Agent-Actions sinnvoll weitergehen.

## Bestand

Relevante Dateien sind im aktuellen Route-/Service-Snapshot gelistet:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/admin-mini-write-foundation.routes.js
remote-modboard/backend/src/routes/auth-*.routes.js
remote-modboard/backend/src/services/admin-user-*.service.js
remote-modboard/backend/src/services/admin-*-write.service.js
remote-modboard/backend/src/services/auth-*.service.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db.service.js
```

## Naechster Runtime-Step

```text
RDAP_0.2.109_ADMIN_USERS_READONLY_STATUS_RECHECK
```

Ziel:
- Admin/User/Permission-Status read-only neu pruefen.
- Route-/Service-Stand im Code lesen.
- UI/API-Status abgleichen.
- Keine Writes.
- Keine Gates aktivieren.
- Keine Login-/Session-Umstellung.
- Keine Agent-Actions.

## Regeln

```text
erst echte Dateien lesen
Plan nennen
auf go warten
ZIP erst danach
vollstaendige Ersatzdateien
keine Patch-Scripte
keine Funktion entfernen
```
