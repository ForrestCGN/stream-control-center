# CURRENT CHAT HANDOFF – Loyalty Games LWG-3.1

Stand: 2026-06-08

## Neuer Stand

```text
STEP LWG-3.1 – Dashboard Loyalty Main Section Bridge
```

## Geaendert

```text
htdocs/dashboard/modules/loyalty_games.js
```

Das Modul erzeugt beim Laden dynamisch eine neue Hauptnavigation:

```text
Live
Control
Loyalty
Community
System
Admin
```

`loyalty_games` registriert sich jetzt mit:

```text
group: loyalty
```

und erscheint unter:

```text
Loyalty -> Loyalty Games
```

## Nicht geaendert

```text
kein Backend
keine Datenbank
keine API
kein Overlay
kein loyalty.js
```

## Architekturentscheidung

Loyalty wird fachlich eigener Hauptbereich:

```text
Loyalty
  Punkte / Konten
  Transaktionen
  Giveaways
  Spiele / Glücksrad
  Presets
  Rewards
  Einstellungen
  Diagnose
```

Alle kommenden Loyalty-Unterbereiche sollen ueber EventBus/definierte Events kommunizieren.
