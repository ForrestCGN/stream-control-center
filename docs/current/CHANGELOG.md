# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.5b

### Geändert

```text
backend/modules/twitch.js
```

### Ergänzt

```text
/auth/login?force=1
/auth/login?force_verify=1
/auth/login/force
/auth/scope-diagnostics
/twitch/auth/scope-diagnostics
/api/twitch/auth/scope-diagnostics
```

### Zweck

```text
ForrestCGN User-OAuth kann per force_verify neu autorisiert werden.
Scope-Diagnose zeigt konfigurierte User-Scopes vs. validierte Token-Scopes ohne Tokens auszugeben.
```

### Nicht geändert

```text
twitch_events.js
EventSub-Produktivflows
Subscription-Erstellung
Commands
Presence
SQLite/DB
```
