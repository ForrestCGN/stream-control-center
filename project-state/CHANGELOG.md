# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.11

### Dokumentiert

```text
BUS-TWITCH.1 bis BUS-TWITCH.10 konsolidiert.
Aktueller Standardweg für Chat/Commands dokumentiert.
Fallbacks und Routen dokumentiert.
Live-Testergebnisse festgehalten.
Nächste Migrationskandidaten festgehalten.
```

### Bestätigter Standardweg

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

### Nicht geändert

```text
Keine Code-Dateien geändert.
Keine DB-Dateien geändert.
Keine produktive Logik entfernt.
```
