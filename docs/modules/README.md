# Module-Dokumentation

Stand: 2026-06-08

## Aktueller Loyalty-Stand

```text
STEP LWG-4C – Preset Editor Dashboard v0.1.0
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
```

## Architekturregel

```text
Loyalty-Core verwaltet Punkte und Transaktionen.
Wheel/Presets gehoeren zum Loyalty-Spielebereich.
Giveaways kommen spaeter als Loyalty-Unterbereich.
Kommunikation zwischen Loyalty-Unterbereichen wird ueber EventBus/definierte Events geplant.
```
