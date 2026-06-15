# CURRENT CHAT HANDOFF – Loyalty Mini-Spiele / Raffle Dashboard

Stand: 2026-06-15 19:55
Projekt: `stream-control-center`
Branch: `dev`
Kontext: Loyalty Core live, StreamElements-Punkteimport abgeschlossen, Raffle produktiv getestet und Dashboard-Bereich `Mini-Spiele` aufgebaut.

## Kurzstatus

```text
Loyalty Core ist live.
StreamElements-Punkteimport ist abgeschlossen.
Watch-Punkte und Twitch-Event-Boni wurden produktiv gebucht.
Alerts bleiben weiter Shadow.
Raffle bleibt technisch im bestehenden Backend-Modul `loyalty_giveaways.js`.
Dashboard-Navigation hat jetzt den Tab `Mini-Spiele` statt eigenem Haupttab `Gamble`.
Mini-Spiele zeigt Raffle und Gamble gemeinsam.
Raffle-Config lädt und speichert über `/api/loyalty/raffle/config`.
Raffle-Gewinnpool bleibt im Chat ausgeblendet (`showPoolInChat=false`).
```

## Bestätigte Backend-Stände

### Loyalty Core

```text
GET /api/loyalty/status
version = 0.1.23
mode = live
enabled = true
currency = Kekskrümel
watchEarningEnabled = true
eventBonusesEnabled = true
```

### Loyalty Giveaways / Raffle Backend

```text
GET /api/loyalty/giveaways/status
moduleVersion = 0.1.9
moduleBuild = STEP_LC_RAFFLE_2A_FIX1_CONFIG_ENDPOINT
lastError = leer
routeCount = 45
```

Neue/aktuelle Raffle-Routen:

```text
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
```

Alte Kompatibilitätsroute bleibt bestehen:

```text
GET /api/loyalty/giveaways/raffle/status
```

## Bestätigte Raffle-Config

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

Wichtig: `showPoolInChat=false` wurde nach Dashboard-Speichern geprüft und blieb korrekt auf `false`.

## Raffle-Gewinnerregel

```text
1 Teilnehmer        -> 1 Gewinner
2–10 Teilnehmer    -> Hälfte der Teilnehmer, abgerundet
11–20 Teilnehmer   -> 1 Gewinner je 4 Teilnehmer
21–50 Teilnehmer   -> 1 Gewinner je 5 Teilnehmer
51–200 Teilnehmer  -> 1 Gewinner je 8 Teilnehmer
201+ Teilnehmer    -> 1 Gewinner je 20 Teilnehmer
```

Raffle-Auszahlung:

```text
interner Gesamtgewinn = 5000 Kekskrümel
Auszahlung je Gewinner = floor(5000 / winnerCount)
Rest bleibt unvergeben
Transaktionstyp = raffle_win
reason = loyalty_raffle_win
sourceModule = loyalty_giveaways
sourceProvider = raffle
mode = live
```

## Öffentliche Raffle-Textkeys

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

Hinweis: Diese Keys wurden bewusst als neue `raffle.public.*`-Keys eingeführt, damit alte DB-Varianten mit Pool-Anzeige oder unvollständigen Texten nicht mehr zufällig verwendet werden.

## Dashboard-Stand Mini-Spiele

Erledigte Dashboard-STEPS:

```text
LC-MINIGAMES-1B Dashboard-Tab Mini-Spiele
LC-MINIGAMES-1C Dashboard Layout-Cleanup
LC-MINIGAMES-1D Raffle Detail-Layout unten
```

Live sichtbarer Stand:

```text
Loyalty -> Mini-Spiele vorhanden
Raffle-Karte sichtbar
Gamble-Karte sichtbar
Gamble-KPIs sauber getrennt
Raffle-KPIs sauber getrennt
Raffle-Gewinn gesamt korrekt benannt
Gewinnerregel als saubere Liste
Textkeys als einzelne Chips
Raffle-Config im Dashboard lädt und speichert
```

Geänderte Dashboard-Dateien:

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```

Wichtig für ZIPs/Deploy:

```text
Für Repo-Root: dashboard/modules/...
Für direktes Entpacken nach D:\Streaming\stramAssets: htdocs/dashboard/modules/...
```

Es gab ein Problem, weil ein ZIP zuerst nur Repo-Pfade (`dashboard/modules`) enthielt und deshalb beim direkten Entpacken nach `D:\Streaming\stramAssets` nicht im Live-`htdocs` landete. Dafür wurde zusätzlich ein FULLPATH-ZIP erstellt.

## Strukturentscheidung: Config & Texte

Entscheidung/Empfehlung für den nächsten Umbau:

```text
Mini-Spiele = Bedien-/Status-/Übersichtsseite
Einstellungen = dauerhafte Config
Texte = Textvarianten / Multitexte
Chat & Befehle = Trigger, Rechte, Cooldowns, Command-Verwaltung
```

Raffle im Mini-Spiele-Tab soll langfristig eher anzeigen:

```text
Status
aktueller/letzter Lauf
Teilnehmer
letzte Gewinner/Auszahlung
Kurzwerte read-only
Buttons: Raffle konfigurieren / Texte bearbeiten
```

Dauerhafte Raffle-Config gehört langfristig nach:

```text
Loyalty -> Einstellungen -> Bereich Raffle oder Mini-Spiele / Raffle
```

Raffle-Textvarianten gehören nach:

```text
Loyalty -> Texte -> Bereich Raffle
```

Commands sind Grenzfall, langfristig besser unter:

```text
Loyalty -> Chat & Befehle
```

## Wichtige offene Punkte

```text
1. Mini-Spiele Struktur-Cleanup: Config aus Mini-Spiele herausziehen und in Einstellungen integrieren.
2. Raffle-Texte im zentralen Texte-Bereich komfortabel filterbar/bearbeitbar machen.
3. Raffle-Shortcuts im Mini-Spiele-Tab auf Einstellungen/Texte verlinken.
4. Subscriber-Tier-Erkennung prüfen: Watch-Buchungen nutzen oft subscriber_multiplier_fallback.
5. GiftSub-Receiver-Konfig/Buchung abgleichen.
6. Alert-Twitch-Events weiter nur Shadow beobachten.
```

## Nicht ändern ohne Freigabe

```text
Keine Alert-Produktivumschaltung.
Keine produktive DB ersetzen oder überschreiben.
Kein neues Raffle-Parallelmodul bauen.
Keine bestehende Giveaway-/Wheel-/Gamble-Logik umbauen.
Keine Funktionalität entfernen.
```
