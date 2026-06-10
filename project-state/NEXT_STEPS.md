# NEXT STEPS – stream-control-center

Stand: 2026-06-09

## AutoShout / Shoutout

```text
1. Falls noch vorhanden: forrestcgn aus AutoShout-Streamer-Liste entfernen.
2. papselzockt_ / papselzockt_cgn prüfen und korrekten Login speichern.
3. Optional später AutoShout-Diagnose ergänzen: lastSeenLogin, lastDecision, instantTrigger, matchedStreamer, blockReason.
4. Keine weitere Codeänderung ohne neuen Auftrag.
```

## Loyalty / Glücksrad

```text
LWG-4N.7 einspielen und Runtime testen, sofern dieser Bereich wieder aufgenommen wird.
```

## Twitch Events / Communication Bus

```text
1. STEP BUS-TWITCH.2 entpacken.
2. StepDone vor Live-Test ausfuehren.
3. Backend neu starten.
4. Statusrouten testen.
5. Mit echter Chatnachricht pruefen, ob twitch.chat.message gezaehlt wird.
6. Danach BUS-TWITCH.3 planen: erster echter Subscriber, ohne alte Direktlogik zu entfernen.
```
