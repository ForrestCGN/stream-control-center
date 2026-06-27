# CURRENT_CHAT_HANDOFF – LC-CORE-POINTS-3A

Stand: 2026-06-15

## Neuer Chat Start-Prompt

```text
Wir machen mit dem stream-control-center / Loyalty-Core weiter.

Aktueller bestätigter Stand:
- LC-CORE-CLEANUP-1 bestätigt
- LC-CORE-POINTS-1 bestätigt
- LC-CORE-POINTS-2A bestätigt
- LC-CORE-POINTS-2B bestätigt
- LC-CORE-POINTS-2C bestätigt
- forrestcgn wurde wieder dauerhaft als Ignored-User gesetzt

Nächster Block:
LC-CORE-POINTS-3A – Twitch Events als abonnierbare Bonus-Events vorbereiten.

Bitte halte dich an den Master-Prompt:
- Erst echte Dateien aus GitHub/dev prüfen.
- Keine Funktionalität entfernen.
- Keine produktive SQLite ersetzen/löschen.
- Keine Apply-/Patch-/Regex-Scripte.
- ZIPs mit echten Zielpfaden ab Repo-Root.
- Nach Code-/Doku-Step StepDone-Befehl angeben.
- Keine Loyalty-Direktanbindung an Twitch-Sonderfälle bauen.
- Vor Umsetzung erst Plan vorlegen und auf mein "go" warten.

Wichtige Doku-Dateien:
- docs/current/CURRENT_STATUS.md
- docs/current/TODO.md
- docs/current/NEXT_STEPS.md
- docs/current/CHANGELOG.md
- docs/current/FILES.md
- docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_POINTS_3A.md
- project-state/CURRENT_STATUS_LC_CORE_POINTS_3A_HANDOFF.md

Ziel:
twitch_events soll Bonus-relevante Twitch-Events zentral über den Communication Bus publizieren.
loyalty soll diese Events abonnieren und intern recordEventBonus() nutzen.
Später sollen Alerts, Dashboard und Event-System dieselben Events abonnieren können.

Relevante geplante EventKeys:
- twitch.follow
- twitch.subscribe
- twitch.resub
- twitch.gift_sub
- twitch.gift_bomb
- twitch.cheer
- twitch.raid

Tip/Donation bitte separat als neutrales Payment-/Donation-Event planen, nicht als Twitch-natives Event.
```

## Bestätigter Stand vor 3A

### LC-CORE-CLEANUP-1

```text
Alte lokale Loyalty-StreamState- und Twitch-Direktlogik entfernt.
Loyalty nutzt /api/twitch/events/stream-state als zentrale Live-Wahrheit.
```

### LC-CORE-POINTS-1

```text
Loyalty Version 0.1.15.
Viewer: 2 / 10 Minuten.
Tier 1: 6 / 10 Minuten.
Tier 2: 8 / 10 Minuten.
Tier 3: 10 / 10 Minuten.
Sub/Resub Tier 1/2/3: 50/100/150.
Erster Watch-Heartbeat gibt keine Sofortpunkte.
```

### LC-CORE-POINTS-2A/2B

```text
Normaler Override ohne Confirm ist pending und startet den Runner nicht.
Confirmed Override publiziert twitch.stream.online und startet Loyalty-AutoRunner.
Clear-Override publiziert twitch.stream.offline und stoppt den Runner.
```

### LC-CORE-POINTS-2C

```text
Twitch Presence startet.
Bot heimaufsichtcgn joined #forrestcgn.
Active-User-Liste funktioniert.
Loyalty-Presence-Runner verarbeitet Presence-User.
Ignored/Systemuser werden übersprungen.
```

### Entscheidung

```text
forrestcgn soll dauerhaft ignoriert werden.
Der Ignored-User-Eintrag wurde gesetzt.
```

## Zielarchitektur für 3A

```text
Twitch / EventSub / IRC / spätere Quellen
        ↓
backend/modules/twitch_events.js
        ↓
Communication Bus
        ↓
Subscriber:
- loyalty
- alerts
- dashboard
- event-system
```

## Nicht bauen

```text
Keine parallele neue Event-Schicht.
Keine direkte Twitch-EventSub-Sonderlogik im Loyalty-Modul.
Keine produktive DB-Migration ohne Notwendigkeit.
Keine Commands aktivieren.
Keine Live-/Shadow-Umschaltung.
```

## Erster Analyseauftrag im neuen Chat

Prüfen:

```text
1. backend/modules/twitch_events.js Event-Katalog/EventMap/EventSub-Normalisierung.
2. publishTwitchEvent()-Struktur und bestehende Channels/Actions.
3. backend/modules/loyalty.js bestehender Stream-Subscriber und recordEventBonus().
4. Communication-Bus Subscribe/Emit-Verhalten.
5. Welche minimale Änderung für 3A nötig ist.
```

## Nach Analyse

Bitte erst Umsetzungsplan liefern. Umsetzung erst nach "go".
