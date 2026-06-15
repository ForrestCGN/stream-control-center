# NEXT_STEPS – stream-control-center

Stand: 2026-06-15

## Direkt nächster sinnvoller Schritt

1. Doku-Stand einspielen.
2. StepDone ausführen:

```powershell
.\stepdone.cmd "STEP LC-LIVE-POSTSTREAM-DOCS Loyalty Go-Live Raffle und Punkteimport dokumentiert"
```

3. Beim nächsten Stream oder Testlauf Raffle-Chattexte prüfen:

```text
!raffle
!join
```

Erwartung:

```text
Startmeldung ohne Pool
Join-Meldung sauber
Gewinnermeldung nennt Gewinner und Gewinnbetrag
Pool wird nicht öffentlich angezeigt
```

## Danach priorisiert

### A. Raffle-Konfiguration vorbereiten

Später per Dashboard einstellbar machen:

```text
Dauer
Gewinnpool
Gewinnerregel
Chattext-Varianten
Aktivierung/Rechte
```

### B. Subscriber-Tier-Erkennung prüfen

Grund:

```text
Watch-Punkte funktionieren, aber viele Buchungen zeigen subscriberTier unknown/none und nutzen subscriber_multiplier_fallback.
```

Prüfen:

```text
Tier 1 / Tier 2 / Tier 3 Erkennung
Fallback-Verhalten
Datenquelle für Subscriber-Tier
```

### C. GiftSub-Receiver-Konfig gegen reale Buchung abgleichen

Beobachtung:

```text
Dashboard-Konfig small_bonus/tierAmounts vorhanden.
Event-Buchungen Receiver zeigen teilweise amount = 5.
```

### D. Alert-Twitch-Events Shadow weiter beobachten

Regel:

```text
Keine Produktivumschaltung.
Mehrere Streams Shadow prüfen.
Danach erst Umbau planen.
```
