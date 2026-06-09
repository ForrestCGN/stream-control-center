# Current Chat Handoff – Loyalty / Giveaways / Chat-Bus Bridge

Stand: 2026-06-09
Letzter bestätigter Runtime-Stand im Chat: LWG-4N.8b Bound-Wheel Fields Endpoint Alias Fix
Neuer Plan-Stand: LWG-4O.0a Chat-Bus-Bridge Architekturentscheidung

## Bestätigte fachliche Entscheidung

Giveaways sollen künftig nicht mehr über technische Modi wie `Classic Single`, `Classic Multi`, `Wheel Single`, `Wheel Multi` laufen. Stattdessen wird der Ablauf fachlich gedacht:

```text
Teilnahme offen
→ Teilnahme schließen
→ Gewinner ziehen
→ Gewinner ist aktuell aktiv
→ bestätigen / nicht gemeldet / weiteren Gewinner ziehen / beenden
```

Bei Glücksrad-Giveaways darf nur der aktuell gezogene Gewinner genau eine Rad-Berechtigung haben. Vorherige, übersprungene oder bereits verbrauchte Gewinner dürfen nicht erneut drehen.

## Neue optionale Funktion

Normale Giveaways sollen optional eine Meldepflicht bekommen:

```text
Gewinner muss sich innerhalb X Sekunden im Chat melden.
```

Wenn er schreibt, wird er bestätigt. Wenn nicht, wird er als nicht gemeldet/übersprungen markiert und aus weiteren Ziehungen ausgeschlossen.

## Chat-Quelle

`twitch_presence` ist bereits die Bot-/IRC-Quelle für Chatnachrichten und übergibt `PRIVMSG` aktuell direkt an das Command-System. Ziel ist, zusätzlich ein leichtes Bus-Event zu senden:

```text
twitch_presence → Communication Bus → Module nach Bedarf
```

Der bestehende direkte Command-Aufruf bleibt zunächst bestehen.

## Bus-Sicherheitsentscheidung

Normale Chatnachrichten dürfen den Bus nicht überlasten. Deshalb sollen sie nicht replayable, nicht ACK-pflichtig, nicht payload-auditiert und nicht an alle UI-/Overlay-Clients verteilt werden.

Später soll ein Prioritätssystem geplant werden:

```text
P0 System/Recovery
P1 Commands/Giveaway-Claim/Rad-Berechtigung
P2 Chat/Presence
P3 UI/Debug/Statistik
```

## Nächster sinnvoller Schritt

```text
LWG-4O.0b – twitch_presence veröffentlicht PRIVMSG zusätzlich als leichtes Bus-Event
```

Wichtig: Keine bestehende Funktionalität entfernen. Commands müssen unverändert weiter funktionieren.
