# NEXT CHAT PROMPT – Loyalty Core weiterführen

Bitte im neuen Chat zuerst diese Dateien lesen:

```text
MASTER_PROMPT_stream_control_center_CLEAN_2026-06-15.txt
docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/CURRENT_STATUS_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/NEXT_STEPS_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/TODO_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/FILES_LC_CORE_ALERT_SHADOW_2026-06-15.md
project-state/CHANGELOG_LC_CORE_ALERT_SHADOW_2026-06-15.md
```

## Startkontext

Wir arbeiten am Projekt `stream-control-center` auf Branch `dev`.

Loyalty Core ist aktuell erfolgreich auf den zentralen Twitch-Events-/Communication-Bus-Weg umgestellt:

```text
Twitch EventSub
→ twitch.js
→ twitch_events
→ Communication Bus
→ loyalty
```

Bestätigt sind:

```text
LC-CORE-POINTS-3B live bestätigt
LC-CORE-POINTS-3C live bestätigt
LC-CORE-POINTS-3C1 Hotfix bestätigt
LC-CORE-POINTS-3D live bestätigt
LC-CORE-POINTS-3E live bestätigt
```

Alert-System ist zusätzlich im Shadow-Modus an Twitch-Events angebunden:

```text
ALERT-TWITCH-1A live bestätigt
ALERT-TWITCH-1B deployed/status grün
```

Wichtig:

```text
Alert-Bus-Weg noch nicht produktiv aktivieren.
Produktive Alerts laufen weiter über alten Direktpfad.
Alert-Shadow erst über mehrere Streams beobachten.
```

## Aktueller Fokus im neuen Chat

Forrest möchte mit **Loyalty Core** weiterarbeiten.

Bitte zuerst read-only prüfen:

```text
backend/modules/loyalty.js
backend/modules/twitch_events.js
backend/modules/twitch.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```

Dann kurz zusammenfassen:

```text
Ziel:
Dateien:
Änderung:
Nicht geändert:
Tests:
Warte auf go.
```

## Mögliche sinnvolle Loyalty-Core-Nächste-Schritte

Nicht blind umsetzen. Erst prüfen und planen.

1. Loyalty-Diagnose verbessern

```text
Status klarer trennen:
- EventSub Bonus Binding
- Punkte-Runner
- Live-State
- Legacy-Fallbacks
- letzte echte Events
- letzte Transaktionen
```

2. Bonus-Event-Mapping prüfen

```text
follow
sub
resub
subgift
giftbomb
cheer
raid
```

Besonders prüfen:

```text
Bits-Punkte pro Schwelle
GiftSub vs gifted_sub_received
Giftbomb-Erkennung
Sub-Tier 1000/2000/3000
Resub-Monate
Raid-Viewers
Shadow/Live-Modus
```

3. Dashboard/Status für Loyalty Core vorbereiten

Nur wenn Forrest es will.

```text
Keine großen Dashboard-Umbauten ohne Planung.
Erst bestehende Dashboard-Dateien prüfen.
```

4. Daten-/DB-Sicherheit prüfen

```text
Keine produktive DB ersetzen.
Nur read-only prüfen, außer Forrest gibt go.
```

5. Alert-Shadow nur beobachten

```text
Nicht produktiv umschalten.
Erst mehrere Streams beobachten.
Später ALERT-TWITCH-1C planen.
```

## Minimaltests für neuen Chat

### Loyalty Status

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy | Select-Object ok,module,version,lastError
$loy.twitchEventBonusBinding | Select-Object installed,subscriptionCount,received,processed,skipped,duplicates,errors,lastEventKey,lastLogin,lastError
```

### Twitch Events Forward

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
$t.twitchEventsParallel.supportEvents | Select-Object enabled,forwarded,failed,lastEventSubType,lastUserLogin,lastError
$t.legacyLoyaltyDirectForward | Select-Object enabled,forwarded,skipped,failed,lastEventSubType,lastUserLogin,lastError
```

### Alert Shadow, nur Diagnose

```powershell
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch-events/status"
$a | Select-Object installed,effectiveMode,received,mapped,wouldEnqueue,enqueued,skipped,errors,lastEventKey,lastLogin,lastTypeKey,lastError
```

## Harte Regeln

```text
Keine Funktionalität entfernen.
Keine produktiven Alert-Umschaltungen.
Keine Fake-Test-Routen blind bauen.
Keine DB überschreiben.
Keine Apply-/Patch-Scripte.
Vollständige echte Dateien als Basis.
ZIPs mit echten Zielpfaden.
StepDone nach ZIP/Deploy, dann testen.
```
