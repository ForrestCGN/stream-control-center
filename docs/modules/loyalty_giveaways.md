# Modul-Doku – Loyalty Giveaways / Raffle

Stand: 2026-06-15 19:55

## Zweck

`loyalty_giveaways.js` verwaltet bestehende Giveaway-/Wheel-Funktionen und enthält aktuell zusätzlich die einfache Chat-Raffle.

Raffle wurde bewusst **nicht** als neues Parallelmodul gebaut, sondern kompatibel in das bestehende Modul integriert.

## Aktueller Modulstand

```text
Datei: backend/modules/loyalty_giveaways.js
moduleVersion = 0.1.9
moduleBuild = STEP_LC_RAFFLE_2A_FIX1_CONFIG_ENDPOINT
routeCount = 45
lastError = leer
```

Prüfung:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" |
  Select-Object moduleVersion,moduleBuild,lastError
```

## Raffle-Routen

```text
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
```

Kompatibilität:

```text
GET /api/loyalty/giveaways/raffle/status
```

## Commands

```text
!raffle -> mod
!join   -> everyone
```

Die Commands laufen über das zentrale Command-System:

```text
moduleKey = loyalty_giveaways
actionKey = chat_command_runtime
targetUrl = /api/loyalty/giveaways/runtime/chat-command
```

## Raffle-Config

Aktuell bestätigte Werte:

```text
enabled = true
durationSeconds = 120
maxDurationSeconds = 3600
prizePoolAmount = 5000
entryCostAmount = 0
entryCostEnabled = false
liveOnly = false
startPermission = mod
raffleCommand = raffle
joinCommand = join
showPoolInChat = false
dashboardGroup = minigames
dashboardLabel = Raffle
textCategory = chat_raffle
```

## Auszahlung

```text
Gesamtgewinn intern = 5000 Kekskrümel
Auszahlung je Gewinner = floor(5000 / winnerCount)
Rest = unvergeben
Teilnahme = kostenlos
```

Transaktion pro Gewinner:

```text
type = raffle_win
sourceModule = loyalty_giveaways
sourceProvider = raffle
mode = live
reason = loyalty_raffle_win
referenceType = raffle
referenceId = <raffle_uid>
```

## Gewinnerregel

```text
1 Teilnehmer        -> 1 Gewinner
2–10 Teilnehmer    -> Hälfte der Teilnehmer, abgerundet
11–20 Teilnehmer   -> 1 Gewinner je 4 Teilnehmer
21–50 Teilnehmer   -> 1 Gewinner je 5 Teilnehmer
51–200 Teilnehmer  -> 1 Gewinner je 8 Teilnehmer
201+ Teilnehmer    -> 1 Gewinner je 20 Teilnehmer
```

## Öffentliche Textkeys

```text
raffle.public.started
raffle.public.already_active
raffle.public.joined
raffle.public.already_joined
raffle.public.no_active
raffle.public.status
raffle.public.cancelled
raffle.public.no_entries
raffle.public.winners
raffle.public.permission_denied
```

Wichtig:

```text
Pool wird nie öffentlich im Chat angezeigt.
Gewinner sehen Gewinnerliste und Gewinnbetrag.
```

## Dashboard-Bezug

Raffle ist für das Dashboard unter `Mini-Spiele` vorbereitet:

```text
dashboardGroup = minigames
dashboardLabel = Raffle
```

Langfristige Zielstruktur:

```text
Mini-Spiele = Status/Bedienung/Shortcuts
Einstellungen = dauerhafte Raffle-Config
Texte = Raffle-Textvarianten
Chat & Befehle = Trigger/Rechte/Cooldowns
```

## Nicht ändern ohne Freigabe

```text
Keine neue Raffle-Parallelstruktur.
Keine Entfernung bestehender Giveaway-/Wheel-Funktionalität.
Keine Änderung an Punktebuchung ohne Test.
Keine öffentliche Pool-Anzeige im Chat.
```
