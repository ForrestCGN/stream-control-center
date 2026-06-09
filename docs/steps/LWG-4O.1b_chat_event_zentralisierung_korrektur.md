# STEP LWG-4O.1b – Chat-Event-Zentralisierung: Architekturkorrektur

Status: Plan-/Korrektur-Step, keine Code-Datei ersetzt.

## Anlass

In STEP LWG-4O.1 wurde eine separate Shadow-Bridge `backend/modules/twitch_chat_bus_bridge.js` erstellt. Sie ist technisch vorsichtig gebaut und läuft laut Status korrekt, erzeugt aber wieder ein zusätzliches Runtime-Modul.

Für das gewünschte Ziel ist das nicht der finale Architekturweg.

## Korrigierter Zielzustand

Chat darf nicht über ein Sondermodul verteilt werden, sondern zentral über den vorhandenen Chat-Eingang und den Communication Bus:

```text
twitch_presence empfängt Twitch-IRC PRIVMSG
→ erzeugt ein leichtes Bus-Event twitch.chat/message
→ commands verarbeitet Commands als Subscriber oder vorerst weiter im bestehenden Direktpfad
→ loyalty_giveaways kann bei aktivem Claim-Fenster subscriben
→ weitere Module können später ebenfalls subscriben
```

## Übergangsregel

Der bestehende direkte Aufruf

```text
twitch_presence → commands.handleChatMessage(...)
```

bleibt zunächst bestehen, bis Commands stabil als Subscriber laufen. Danach kann der Direktpfad optional abgeschaltet und später entfernt werden.

## Warum dieser Step keine Code-Datei ersetzt

Für eine sichere Umsetzung muss die echte aktuelle Live-Datei `backend/modules/twitch_presence.js` oder alternativ `backend/modules/commands.js` vollständig als Single Source of Truth vorliegen. Eine teilweise Rekonstruktion aus GitHub-Ausschnitten wäre riskant und könnte bestehende Commands beschädigen.

## Nächster Code-Step

`LWG-4O.1c – Chat-Event direkt in twitch_presence integrieren`

Benötigte Datei vor Umsetzung:

```text
backend/modules/twitch_presence.js
```

Optional zusätzlich zur Prüfung:

```text
backend/modules/commands.js
```

## Vorgaben für LWG-4O.1c

- Keine Funktionalität entfernen.
- `commands.handleChatMessage(...)` bleibt zunächst aktiv.
- Kein neues Runtime-Modul.
- `twitch_chat_bus_bridge.js` wird danach entfernt bzw. nicht weiter genutzt.
- Chat-Events bleiben leichtgewichtig:
  - `replayable: false`
  - `requireAck: false`
  - `ttlMs: 0`
  - kein Payload-Audit
  - kein Broadcast an alle UI-/Overlay-Clients
- Status-/Zähler direkt in `twitch_presence` integrieren.
- Subscriber können später `twitch.chat/message` abonnieren.

## Bridge-Rückbau

Nach erfolgreicher Integration in `twitch_presence` soll die Datei aus STEP LWG-4O.1 entfernt werden:

```text
backend/modules/twitch_chat_bus_bridge.js
```

Bis dahin darf sie als Shadow-Zwischenstand existieren, sollte aber nicht als finale Architektur betrachtet werden.
