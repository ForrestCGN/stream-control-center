# Module-Dokumentation

Stand: 2026-06-08

## Aktueller Loyalty-Stand

```text
STEP LWG-4B – Wheel Presets Backend v0.2.0
```

## Loyalty-Hauptbereich

Fachlich wird Loyalty als eigener Bereich behandelt:

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
