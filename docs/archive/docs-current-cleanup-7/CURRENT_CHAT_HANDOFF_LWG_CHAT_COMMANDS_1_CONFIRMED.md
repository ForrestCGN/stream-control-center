# Current Chat Handoff – LWG Chat Commands 1 bestätigt

Datum: 2026-06-19  
Projekt: stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

## Arbeitsweise

- Erst echten aktuellen Stand prüfen, dann planen, dann auf Forrests `go` warten.
- Nicht raten; fehlende/unklare Dateien exakt anfragen.
- Keine Funktionalität entfernen.
- Vorhandene Systeme nutzen: Communication/EventBus, Twitch-Events, Sound-/Overlay-System, Helper, DB-/Config-/Dashboard-Patterns.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
- Nach ZIP-/Datei-Steps immer StepDone-Befehl angeben.
- Bei ZIP-/Datei-Steps wird StepDone nach Einspielen/Deployen ausgeführt und erst danach getestet.
- Dashboard-/Modul-Lösungen müssen streamer- und modfreundlich sein.
- Streamer.bot ist für dieses System außen vor.

## Aktueller bestätigter Stand

```text
loyalty_giveaways: 0.1.16 / LWG_CHAT_COMMANDS_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Bestätigt: Chat-Commands

`LWG_CHAT_COMMANDS_1` ist live:

```text
!ticket       → normales Giveaway
!wheel / !rad → Gewinner dreht Giveaway-Rad
!join         → Raffle, unverändert
!raffle       → Raffle, unverändert
```

Geprüft:

```text
GET /api/loyalty/giveaways/commands
GET /api/loyalty/giveaways/central-commands
```

Live bestätigt:

```text
ticket.enabled=true
wheel.enabled=true
wheel.aliases=[rad]
join.enabled=true
raffle.enabled=true
centralCommands.available=true
centralCommands.commandsActive=true
```

## Bestätigt: Interaktiver Komplett-Test

Test-Giveaway:

```text
giveaway_1781869724371_2cdf71cc66cc312a
```

Ablauf und Ergebnis:

```text
- Giveaway geöffnet.
- una_solala per API als gesperrter Entry hinzugefügt.
- 3 erlaubte User per !ticket:
  - RoxxyFoxxyCGN
  - EngelCGN
  - ForrestCGN
- Draw aus open korrekt blockiert.
- Giveaway geschlossen.
- Runde 1: RoxxyFoxxyCGN gewann; Wheel-Claim per Chat erkannt.
- Runde 2: EngelCGN gewann; Wheel-Claim per Chat erkannt.
- Runde 3: ForrestCGN gewann; Wheel-Claim per Chat erkannt.
- Danach kein eligible User mehr vorhanden.
- Felder korrekt 8 -> 5.
- Alle erwarteten Gewinner wheel_completed.
```

## Bestätigt: Exclusions

`una_solala` bleibt als Entry sichtbar, wird aber beim Draw ausgeschlossen und kann nicht gewinnen.

Exclusion-Regel:

```text
User dürfen teilnehmen/sichtbar bleiben, sind aber beim Draw nicht eligible.
```

Config:

```text
config/loyalty_giveaway_exclusions.json
```

## Bestätigt: Bound-Wheel-Feldanzahl

`LWG_BOUND_WHEEL_FIELD_COUNT_1` bleibt bestätigt:

```text
2+ verfügbare Gewinne → normaler Spin mit exakt verfügbaren Feldern
1 verfügbarer Gewinn → Direktvergabe-Pfad vorbereitet
0 verfügbare Gewinne → Claim/Spin blockiert
```

## Testscript

Aktueller Stand:

```text
tools/tests/loyalty_giveaway_wheel_interactive_test.ps1
LWG_TESTSCRIPT_1_3
```

Fachlicher Test mit 1.2 war bestanden. 1.3 behebt nur den finalen Summary-/Argumenttypen-Abbruch.

Frisches Test-Giveaway für 1.3-Endtest:

```text
giveaway_1781870456108_bc3cb113232e9e76
Status: draft
Mode: wheel_single
CanOpen: true
```

Startbefehl:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\tools\tests\loyalty_giveaway_wheel_interactive_test.ps1 `
  -GiveawayUid "giveaway_1781870456108_bc3cb113232e9e76" `
  -BlockedUser "una_solala"
```

## Offene spätere Punkte

- Testscript 1.3 einmal auf sauberen `SUCCESS`-Abschluss prüfen.
- Test-Giveaways löschen oder eindeutig markieren.
- Dashboard-Editor für Gewinn-Sperrliste.
- DB-basierte Verwaltung der Exclusions.
- Twitch-User-ID als primärer Schlüssel.
- Draw-/Log-Tab mit Exclusion-Details.
- Pro-Giveaway zusätzliche Sperren.
- 1-Gewinn-Direktvergabe gezielt testen.
- 0-Gewinne-Blockpfad gezielt testen.
- Live-Dashboard-UX für sequenzielles Ziehen + Warten auf `!rad` planen.
