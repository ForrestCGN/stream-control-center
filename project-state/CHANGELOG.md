# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.8

### Geändert

```text
backend/modules/commands.js
backend/modules/twitch_presence.js
```

### Neu

```text
commands 0.2.0 / BUS_TWITCH_8_COMMAND_SOURCE_SWITCH
twitch_presence 0.1.2 / BUS_TWITCH_8_COMMAND_SOURCE_SWITCH
```

### Inhalt

```text
- commands Bus-Subscriber bleibt steuerbar.
- twitch_presence Command-Direktweg kann per Route aktiviert/deaktiviert werden.
- Status zeigt Direct-Hook-Zähler und Quelle an.
- Keine bestehende Funktion entfernt.
```


---

## BUS-TWITCH.8b – Command Direct Route Fix

Ergaenzung: Die in BUS-TWITCH.8 dokumentierten twitch_presence Routen fuer `command-direct/status`, `command-direct/enable` und `command-direct/disable` werden nun tatsaechlich registriert. Keine Funktionalitaet entfernt.
