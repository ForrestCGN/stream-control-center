# PROJECT STATE – LC-MINIGAMES-2B dokumentiert

Stand: 2026-06-16

## Projekt

```text
ForrestCGN / stream-control-center
Branch: dev
Live: D:\Streaming\stramAssets
Produktive DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

```text
LC-MINIGAMES-2B FIX3 – Raffle Teilnahmekosten + Text-DB-Cleanup
```

## Bestätigt

```text
Raffle Config speichert entryCostAmount=10 und entryCostEnabled=true.
Text-DB-Cleanup ist erfolgreich.
Keine aktiven mehrzeiligen Textvarianten mehr in /api/loyalty/giveaways/texts.
Dashboard-Struktur ist bereinigt: Mini-Spiele, Einstellungen, Texte getrennt.
```

## Offen

```text
Raffle-Kosten-Live-Test:
- Abbuchung bei genug Punkten
- Block bei zu wenig Punkten
- Doppeljoin ohne zweite Abbuchung
- Cancel mit Refund
- normaler Abschluss mit Auszahlung und ohne Refund
```

## Relevante Dateien

```text
backend/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_games.js
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_LC_MINIGAMES_2B_DOCUMENTED.md
docs/modules/loyalty_giveaways.md
```

## Wichtige Notiz

```text
StreamElements-Import: Bereits im neuen Loyalty-System gesammelte Punkte wurden beim Import nicht addiert. Später prüfen/korrigieren.
```
