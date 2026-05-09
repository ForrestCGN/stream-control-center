# CURRENT STATUS APPEND - STEP202.2

## STEP202.2 - Loyalty Shadow Mode & Configurable Bonus Rules

Stand: 2026-05-09

Für Loyalty wurde die Startstrategie festgelegt:

```text
Das neue Loyalty-System läuft zuerst parallel im Shadow Mode.
StreamElements bleibt aktiv.
User-Punkte aus StreamElements werden später importiert.
```

Neue Reihenfolge:

1. Loyalty-Core im Shadow Mode bauen.
2. Mehrere Streams im Hintergrund mitlaufen lassen.
3. Watch-Punkte, Ignored Users, Sub-Multiplikator und Event-Boni prüfen.
4. Erst später StreamElements-Punkte importieren.
5. Erst ganz am Ende StreamElements abschalten.

Außerdem wurden konfigurierbare Bonus-Regeln eingeplant:

- neuer Sub
- Resub
- Gift-Sub Gifter
- Gift-Sub Empfänger
- Sub-Streak Bonus
- Follow
- Cheer/Bits
- Tip
- Raid

Alle Bonus-Regeln sollen DB-basiert, dashboardfähig und als Transaktionen nachvollziehbar sein.

Keine Code-/API-/DB-Änderung.
