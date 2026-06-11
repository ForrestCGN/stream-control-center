# Loyalty Games – Stand STEP219 / LWG-6.0

## Gamble Readiness

Gamble ist vorbereitet, bleibt aber deaktiviert.

Zu prüfen:

```text
/api/loyalty/games/status
/api/loyalty/games/gamble/status
/api/loyalty/games/gamble/config
/api/loyalty/games/gamble/play
/api/loyalty/games/runtime/chat-command
```

Sicherheitsvorgaben:

```text
- Server entscheidet Ergebnis
- crypto.randomInt
- kein User-/Datum-/Pattern-Seed
- available balance prüfen
- spendPointsSafely für Einsatz
- awardPoints für Auszahlung
- Sessions/Transaktionen auditierbar
- Chat-Ausgabe später zentral über commands.js → twitch_presence
```

STEP219 aktiviert `!gamble` nicht. Der Test erwartet, dass alle Play-/Runtime-Versuche blockiert werden und der Punktestand unverändert bleibt.
