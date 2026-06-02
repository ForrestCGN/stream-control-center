# NEXT_STEPS

## Direkt naechster Schritt im neuen Chat

```text
CAN-26.0: Abschluss-/Qualitaetscheck fuer Bus-Diagnose + Git/Live-Synchronisation pruefen.
```

## Start im neuen Chat

1. Master-Prompt beachten.
2. `docs/current/CURRENT_CHAT_HANDOFF_CAN25_25B.md` lesen.
3. GitHub/dev und Live-Ziel bewusst abgleichen.
4. Nur dann naechsten CAN-Schritt planen.

## Empfohlener CAN-26.0 Check

```text
- Pruefen, ob CAN-25.24 und CAN-25.25b im Repo/dev und Live identisch sind.
- Dashboard Bus-Diagnose mit Strg+F5 pruefen.
- /api/overlay-monitor/client-control/status kurz pruefen.
- SYSTEME-Bereich visuell pruefen.
- Overlay-Monitor Summary pruefen: warning 0 / error 0, sofern keine echte aktive Quelle fehlt.
- Node-Log auf unnoetigen Overlay-Flap-Spam beobachten.
```

## Danach sinnvoll

```text
CAN-26.1: Dashboard-Feinschliff fuer Overlay-Monitor Info/Idle/Inactive Anzeige, falls noetig.
CAN-26.2: Doku-/Strukturabgleich, falls noch alte CAN-25.4 Hinweise in docs/current stehen.
CAN-26.3: Erst dann neuen technischen Kandidaten planen.
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktive Sound-Bus-Migration.
Kein produktiver Sound-Bus-Play.
Kein Queue-Clear.
Keine Twitch-/Redemption-Write-Aktion.
Kein automatischer Shadow-Mitulauf fuer alle Rewards.
Keine Enable/Test/Migration-Buttons in der Sound-Shadow Card.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
```
