# NEXT CHAT HANDOFF – Alert-System dringende Punkte

Stand: 2026-05-08  
Version: v2 mit Tipeee/Twitch-Origin-Filterentscheidung

## Projekt

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
```

## Dringend morgen

Es wurde bestätigt, dass TipeeeStream Twitch-Events spiegelt und unser Tipeee-Modul diese fälschlich als Tipeee-Donation weiterleitet.

Daher entstehen doppelte Alerts:

```text
Twitch Bits/Raid korrekt über Twitch
kurz danach nochmal über Tipeee als donation
```

## Wichtigster Filter

Hauptfilter:

```js
raw.event.origin === "twitch"
```

Das reicht sehr wahrscheinlich für den akuten Fehler, weil die bestätigten Duplikate im Rohpayload `origin: twitch` hatten.

Defensiver Zusatz:

```text
event.ref beginnt mit TWITCH_
event.type ist cheer / raid / follow / sub / resub / subscription / gift / gifted_subscription
```

## Fix zuerst in

```text
backend/modules/tipeee.js
```

Vor Forward/Enqueue:

```text
raw.event.origin == "twitch" ignorieren
raw.event.ref beginnt mit "TWITCH_" ignorieren
Twitch-Typen ignorieren
nur echte Tipeee-Donation weitergeben
```

Geblockte Events sollen nicht in die Alert-Queue. Optional als `ignored` in `alert_provider_events` speichern.

## Weitere Pflichtpunkte

```text
- Alerts global abschaltbar machen
- Wenn Alerts aus sind: NICHT in Queue schreiben
- Subscription vs Gifted Subscription sauber unterscheiden
- Sub-Bombe / Community Gift sicher erkennen
- Anzahl der verschenken Subs auslesen
- Alert-History nicht mehr auf 10 begrenzen
```

## Wichtig

Keine vollständigen Umbauten ohne echte Dateien.

Zuerst prüfen:

```text
backend/modules/alert_system.js
backend/modules/tipeee.js
backend/modules/twitch.js
htdocs/dashboard/modules/alerts.js
```

## Ziel-Testmatrix

```text
Twitch Bits -> nur Twitch Alert, kein Tipeee-Duplikat
Twitch Raid -> nur Twitch Alert, kein Tipeee-Duplikat
Twitch Follow -> korrekt
Twitch Sub -> sub
Twitch Resub -> resub
Twitch GiftSub -> giftSub
Twitch CommunityGift/Sub-Bombe -> communityGift mit Anzahl
Ko-fi Donation -> kofi donation
echte Tipeee Donation -> tipeee donation
Tipeee-Spiegelung Twitch -> ignoriert
Alerts disabled -> kein Queue-Eintrag
```
