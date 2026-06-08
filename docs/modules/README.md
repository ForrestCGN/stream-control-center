# Module-Dokumentation

Stand: 2026-06-08

## Aktueller Loyalty-Stand

```text
STEP LWG-4D – Giveaway Backend Grundsystem v0.1.0
```

## Loyalty-Hauptbereich

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

## Aktuelle wichtige Modul-Dokus

```text
docs/modules/loyalty_games.md
docs/modules/loyalty_wheel.md
docs/modules/loyalty_giveaways.md
```

## Architekturregel

```text
Loyalty-Core verwaltet Punkte und Transaktionen.
Wheel/Presets gehoeren zum Loyalty-Spielebereich.
Giveaways sind eigener Loyalty-Unterbereich.
Kommunikation zwischen Loyalty-Unterbereichen wird ueber EventBus/definierte Events geplant.
```
