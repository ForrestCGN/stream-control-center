# CURRENT CHAT HANDOFF – LWG-4L.3 Activation Plan

Stand: 2026-06-09

## Bestaetigter Ausgangsstand

- LWG-4L.2 ist live bestaetigt.
- `moduleBuild = STEP_LWG_4L_2`
- `routeCount = 28`
- `GET /api/loyalty/giveaways/central-commands` funktioniert.
- Zentrale Command-Eintraege sind vorhanden:
  - `!ticket` -> `/api/loyalty/giveaways/runtime/chat-command`
  - `!wheel` mit Alias `rad` -> `/api/loyalty/giveaways/runtime/chat-command`
- Beide zentralen Commands sind `enabled=false`.
- `CHAT_COMMANDS_ACTIVE=false`.
- Runtime liefert weiterhin `chat_commands_disabled`.

## Zweck von LWG-4L.3

LWG-4L.3 ist ein Planungs- und Sicherheitsstep fuer die spaetere Aktivierung. Es wird noch nichts aktiviert.

## Geplante Aktivierungslogik fuer spaetere Steps

### !ticket

`!ticket` darf spaeter nur dann eine Teilnahme erzeugen, wenn alle Bedingungen erfuellt sind:

1. Es gibt genau ein aktives/offenes Giveaway.
2. Das Giveaway ist im Status `open`.
3. Der User ist gueltig aufgeloest (`userLogin`, `userDisplayName`).
4. Die Ticketanzahl ist gueltig.
5. Das User-Limit `maxTicketsPerUser` wird nicht ueberschritten.
6. Bei `subOnly=true` muss der User Sub/VIP/Mod/Broadcaster-Status haben, soweit der Command-Kontext das sauber hergibt.
7. Kostenlose Tickets duerfen sofort eingetragen werden.
8. Kostenpflichtige Tickets duerfen erst aktiviert werden, wenn die Loyalty-Punktebuchung sauber angebunden ist.

Bis zur Punktebuchung gilt: Wenn `costDue > 0`, muss der Command blocken und `ticket.cost_not_supported_yet` ausgeben.

### !wheel / !rad

`!wheel` und `!rad` duerfen spaeter nur dann einen Spin starten, wenn:

1. Ein passendes Wheel-Giveaway existiert.
2. Fuer den User eine offene Wheel-Permission vorhanden ist.
3. Das Permission-Objekt noch `pending` ist.
4. `loyalty_games._private.startWheelSpin()` verfuegbar ist.
5. Der Spin erfolgreich gestartet wurde.

Der Rad-Command darf niemals ein Ergebnis vorgeben. Das Ergebnis bleibt backend-/wheel-seitig bestimmt.

## Sicherheitsgrenzen

Nicht in LWG-4L.3 enthalten:

- Keine Aktivierung von `!ticket`, `!wheel` oder `!rad`.
- Kein Umschalten von `CHAT_COMMANDS_ACTIVE`.
- Keine Punktebuchung.
- Keine Channel-Points-Anbindung.
- Kein Streamer.bot.
- Kein `!join`.
- Keine Aenderung an Wheel-Fairness oder Gewinnerlogik.

## Empfohlene naechste technische Steps

### LWG-4L.4 – Runtime Activation Guard vorbereiten

- Internen Guard fuer aktivierte Runtime sauber strukturieren.
- Weiterhin deaktiviert lassen.
- Fehlertexte und Statusausgaben erweitern.

### LWG-4L.5 – Kostenlose `!ticket`-Aktivierung lokal/testbar

- Nur kostenlose Giveaways erlauben (`costDue = 0`).
- `costDue > 0` weiterhin blocken.
- Command zentral weiterhin erst nach bewusster Freigabe aktivieren.

### LWG-4L.6 – Loyalty-Punktebuchung planen

- Erst vorhandenes Loyalty-/Punkte-/Wallet-System pruefen.
- Keine neue Parallel-Wallet bauen.
- Transaktional buchen: pruefen, abbuchen, Entry schreiben, Event loggen.

## Kurzer Teststatus

LWG-4L.3 ist nur Dokumentation/Planung. Es gibt keine neue Runtime-Funktion zu testen.
