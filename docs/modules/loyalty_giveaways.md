# Modul-Doku – Loyalty Giveaways / Raffle

Stand: 2026-06-16

## Zweck

`loyalty_giveaways.js` verwaltet bestehende Giveaway-/Wheel-/Ticket-Funktionen und enthält zusätzlich die einfache Chat-Raffle.

Raffle wurde bewusst **nicht** als neues Parallelmodul gebaut, sondern kompatibel in das bestehende Modul integriert.

## Aktueller Modulstand

```text
Datei: backend/modules/loyalty_giveaways.js
moduleVersion = 0.1.13
moduleBuild = STEP_LC_MINIGAMES_2B_FIX3_TEXT_DB_CLEANUP
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

## Text-/Editor-Route

```text
GET /api/loyalty/giveaways/texts
```

Diese Route liefert die Textkeys/Varianten für Loyalty-Giveaways/Mini-Spiele. Nach LC-MINIGAMES-2B FIX3 wurde bestätigt, dass keine aktiven mehrzeiligen Textvarianten mehr vorhanden sind.

## Commands

Aktuelle produktive Commands laufen über das zentrale Command-System:

```text
!raffle -> mod
!join   -> everyone
```

Command-Felder werden nicht mehr im Raffle-Config-Bereich bearbeitet. Langfristig gehören Command, Rechte, Cooldowns und Aliases nach `Loyalty -> Chat & Befehle` bzw. in das zentrale Command-Modul.

## Raffle-Config

Fachlich relevante Werte:

```text
enabled
liveOnly
durationSeconds
maxDurationSeconds
prizePoolAmount
entryCostAmount
entryCostEnabled
showPoolInChat = false
dashboardGroup = minigames
dashboardLabel = Raffle
textCategory = chat_raffle
```

Interne/Kompatibilitätswerte bleiben erhalten:

```text
startPermission
raffleCommand
joinCommand
```

Sie werden im Raffle-Config-Dashboard nicht mehr direkt angezeigt.

## Teilnahmekosten

```text
entryCostAmount = 0  -> kostenlos
entryCostAmount > 0  -> entryCostEnabled=true
```

Geplantes/implementiertes Verhalten:

```text
Bei genug Punkten: Betrag wird abgezogen, User wird eingetragen.
Bei zu wenig Punkten: keine Teilnahme, kein Abzug, Text über helper_texts.
Bei Doppeljoin: keine zweite Abbuchung.
Bei Cancel: bezahlte Teilnahmen werden erstattet.
Bei normalem Abschluss: keine Erstattung, Gewinner erhalten Auszahlung.
```

Bestätigt:

```text
/api/loyalty/raffle/config speichert entryCostAmount=10 und entryCostEnabled=true korrekt.
```

Noch offen:

```text
Live-Test von Abbuchung, Block bei zu wenig Punkten, Doppeljoin, Cancel/Refund und Auszahlung.
```

## Auszahlung

```text
Gesamtgewinn intern = prizePoolAmount
Auszahlung je Gewinner = floor(prizePoolAmount / winnerCount)
Rest = unvergeben
Transaktionstyp = raffle_win
reason = loyalty_raffle_win
sourceModule = loyalty_giveaways
sourceProvider = raffle
mode = live
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

## Öffentliche Raffle-Textkeys

Produktiver Raffle-Pfad nutzt:

```text
raffle.public.started
raffle.public.started_paid
raffle.public.already_active
raffle.public.joined
raffle.public.joined_paid
raffle.public.insufficient_balance
raffle.public.already_joined
raffle.public.no_active
raffle.public.status
raffle.public.cancelled
raffle.public.no_entries
raffle.public.winners
raffle.public.permission_denied
```

Alte `raffle.*` Seed-Keys wurden aus dem aktiven Pfad entfernt/bereinigt. Sie sollen nicht wieder als produktiver Chatpfad genutzt werden.

## Textsystem

Texte laufen über:

```text
backend/modules/helpers/helper_texts.js
helper_texts.renderModuleText(...)
```

Regel:

```text
Eine Textvariante = eine Chatmeldung.
Keine mehrzeiligen Sammelvarianten als aktive Varianten.
```

LC-MINIGAMES-2B FIX3 bereinigt aktive mehrzeilige Seed-/Sammelvarianten für:

```text
chat_raffle
chat_giveaway
chat_ticket
chat_wheel
```

Prüfung:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/texts"

$t.keys |
  ForEach-Object {
    $key = $_.key
    $_.variants | ForEach-Object {
      $_ | Add-Member -NotePropertyName key -NotePropertyValue $key -Force
      $_
    }
  } |
  Where-Object { $_.enabled -eq $true -and $_.value -match "(`r|`n)" } |
  Select-Object id,key,category,enabled,source,value |
  Format-List
```

Erwartung:

```text
Keine Ausgabe.
```

## Dashboard-Bezug

Langfristige Struktur:

```text
Mini-Spiele = Status/Bedienung/Shortcuts
Einstellungen = dauerhafte Raffle-Config
Texte = Raffle-Textvarianten
Chat & Befehle = Trigger/Rechte/Cooldowns
```

Aktuell umgesetzt:

```text
Loyalty -> Mini-Spiele       Status/Bedienung
Loyalty -> Einstellungen     Raffle-Config
Loyalty -> Texte             Raffle-Texte, bereichsgefiltert
```

## Nicht ändern ohne Freigabe

```text
Keine neue Raffle-Parallelstruktur.
Keine Entfernung bestehender Giveaway-/Wheel-/Ticket-Funktionalität.
Keine Änderung an Punktebuchung ohne Test.
Keine öffentliche Pool-Anzeige im Chat.
Keine Command-Bearbeitung im Raffle-Config-Bereich.
Keine Reaktivierung alter raffle.* Chatkeys.
```
