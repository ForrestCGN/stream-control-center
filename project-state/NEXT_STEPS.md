# NEXT_STEPS – nach STEP223 / LWG-6.4

## Empfohlen

### STEP224 / LWG-6.5 – Gamble Result/Log Cleanup

Ziel:

```text
Strukturierte Gamble-Ergebnisdaten im Command-Ergebnis/Log sichtbar machen:
- bet
- outcome
- winAmount
- balanceBefore
- balanceAfter
- messageKey
```

Grund:

STEP222b musste `betInMessage=True` akzeptieren, weil `commands.js` das strukturierte Feld `bet` nicht oben im zusammengefassten Ergebnis spiegelt.

### STEP225 / LWG-6.6 – StreamElements Migration finalisieren

Ziel:

```text
SE !gamble / !roulette deaktivieren
Node-Gamble als einzige Quelle bestätigen
Doppelantworten ausschließen
Live-Doku aktualisieren
```

### STEP226 / LWG-7.0 – Dashboard/Config-Planung

Ziel:

```text
Gamble-Texte dashboardfähig machen
Gamble-Settings dashboardfähig machen
Cooldowns, Min/Max, Prozentregeln, Gewinnchance editierbar machen
```
