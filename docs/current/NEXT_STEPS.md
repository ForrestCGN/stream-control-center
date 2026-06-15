# NEXT_STEPS – stream-control-center

Stand: 2026-06-15

## Aktueller Stand nach LC-CORE-LIVE-1.1

```text
Loyalty nutzt jetzt /api/twitch/events/stream-state als effektive Live-Wahrheit.
Online-Override und Override-Clear wurden getestet.
Runner startet/stoppt passend zum zentralen Stream-State.
```

## Bestätigte Tests

### Online Override

```text
parsed.live = true
parsed.source = manual_override
parsed.manualOverrideActive = true
state.effective.live = true
runner.enabled = true
runner.timerActive = true
```

### Override entfernen / offline

```text
parsed.live = false
parsed.source = live_status_monitor
parsed.manualOverrideActive = false
state.effective.live = false
runner.enabled = false
runner.timerActive = false
```

## Nächster sinnvoller Arbeitsblock

```text
LC-CORE-CLEANUP-1 – alte Loyalty-StreamState-/Twitch-Direktlogik entfernen
```

## Ziel von LC-CORE-CLEANUP-1

```text
- alte direkte Twitch-Live-Abfrage aus Loyalty entfernen
- alte Refresh-Auto-Route entfernen, wenn keine aktive Verwendung mehr besteht
- runPresenceOnce dauerhaft über twitch_events Stream-State laufen lassen
- Routenliste bereinigen
- keine ersetzte Altlogik nur verstecken/deprecaten, wenn sie wirklich weg kann
```

## Vor Umsetzung zwingend prüfen

```text
1. Echte aktuelle backend/modules/loyalty.js aus GitHub/dev prüfen.
2. Suchen, ob refreshAutoStreamStateFromTwitch noch verwendet wird.
3. Suchen, ob parseExternalLivePayload noch verwendet wird.
4. Suchen, ob /api/loyalty/stream-state/refresh-auto im Dashboard oder in anderen Modulen verwendet wird.
5. Ziel/Dateien/Änderungen/Nichtänderungen/Tests nennen.
6. Auf Forrests go warten.
```

## Voraussichtlich betroffene Datei

```text
backend/modules/loyalty.js
```

Optional Doku:

```text
docs/current/STEP_LC_CORE_CLEANUP_1_LOYALTY_STREAMSTATE_CLEANUP.md
```

## Nicht ändern

```text
Keine DB löschen/ersetzen.
Keine Punkte-/Watch-/Event-Bonus-Logik ändern.
Keine Command-Änderung.
Kein Shadow/Live-Wechsel.
Keine neue Parallelstruktur.
Keine Dashboard-Entfernung ohne vorherige Verwendungsprüfung.
```

## Danach mögliche Reihenfolge

```text
1. Loyalty Cleanup abschließen
2. Dashboard-Anzeige für Loyalty Live-Quelle prüfen/vereinfachen
3. Giveaways/Loyalty Games Live-only an zentralen Stream-State anbinden
4. Tagebuch/Clips/Alerts/VIP30/Event-System schrittweise anbinden
```

## StepDone-Regel

```text
Bei Datei-/Doku-ZIPs:
1. ZIP einspielen/deployen
2. stepdone.cmd ausführen
3. danach testen
4. kein zweites StepDone nach erfolgreichem Test
```
