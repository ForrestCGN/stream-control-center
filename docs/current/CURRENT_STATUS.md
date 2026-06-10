# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigter Zusatzstand

```text
STEP BUS-TWITCH.8 – Commands Source Switch vorbereitet
```

## Twitch Events / Commands

Bestätigt aus vorherigen Tests:

```text
BUS-TWITCH.6 EventSub channel.chat.message läuft produktiv testweise.
BUS-TWITCH.7 commands empfängt twitch.chat.message per Bus-Subscriber.
```

Neu in BUS-TWITCH.8:

```text
- twitch_presence Command-Direktweg ist per Runtime-Route steuerbar.
- commands Bus-Subscriber bleibt per Runtime-Route steuerbar.
- Keine Command-Funktion wurde entfernt.
- Ziel: genau eine produktive Command-Quelle aktiv nutzen, um Doppelverarbeitung zu vermeiden.
```

## Wichtige Abgrenzung

```text
Keine SQLite-Datei ersetzt.
Keine Commands entfernt.
Keine EventSub-/Presence-Altwege gelöscht.
```


---

## BUS-TWITCH.8b – Command Direct Route Fix

Ergaenzung: Die in BUS-TWITCH.8 dokumentierten twitch_presence Routen fuer `command-direct/status`, `command-direct/enable` und `command-direct/disable` werden nun tatsaechlich registriert. Keine Funktionalitaet entfernt.
