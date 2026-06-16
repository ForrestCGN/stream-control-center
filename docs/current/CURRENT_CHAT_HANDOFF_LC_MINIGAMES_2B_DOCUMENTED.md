# CURRENT CHAT HANDOFF – LC-MINIGAMES-2B dokumentiert

Stand: 2026-06-16
Projekt: `stream-control-center`
Branch: `dev`
Kontext: Loyalty Core live, Raffle/Mini-Spiele Dashboard bereinigt, Raffle-Teilnahmekosten eingebaut, Text-DB-Cleanup bestätigt.

## Kurzstatus

```text
Loyalty Core ist live.
Raffle bleibt im bestehenden Backend-Modul loyalty_giveaways.js.
Raffle Config ist jetzt unter Loyalty -> Einstellungen -> Raffle.
Raffle Bedienung/Status bleibt unter Loyalty -> Mini-Spiele.
Raffle Texte sind unter Loyalty -> Texte -> Raffle.
Teilnahmekosten sind eingebaut, aber Live-Kosten-Test ist noch offen.
Text-DB-Cleanup ist bestätigt: keine aktiven mehrzeiligen Varianten mehr.
```

## Bestätigte Backend-Stände

```text
backend/modules/loyalty_giveaways.js
moduleVersion = 0.1.13
moduleBuild = STEP_LC_MINIGAMES_2B_FIX3_TEXT_DB_CLEANUP
```

## Bestätigte Raffle-Routen

```text
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
GET  /api/loyalty/giveaways/raffle/status
GET  /api/loyalty/giveaways/texts
```

## Raffle Config aktueller Stand

Bestätigt wurde per `/api/loyalty/raffle/config`:

```text
entryCostAmount = 10
entryCostEnabled = true
showPoolInChat = false
```

Die Teilnahmekosten-Config speichert korrekt. Der Live-Test der tatsächlichen Abbuchung/Erstattung steht noch aus.

## Dashboard-Entscheidungen

```text
Mini-Spiele = Bedien-/Status-/Übersichtsseite
Einstellungen = dauerhafte Config
Texte = Textvarianten / Multitexte
Chat & Befehle = Trigger, Rechte, Cooldowns, Command-Verwaltung
```

Umgesetzt:

```text
Raffle-Config aus Mini-Spiele herausgezogen.
Raffle Config auf reine fachliche Config reduziert.
Start-Command, Join-Command und Start-Berechtigung aus Raffle-Config entfernt.
Teilnahmekosten aktiv Checkbox entfernt; entryCostEnabled wird aus entryCostAmount > 0 abgeleitet.
Texte-Bereich zeigt keine Option Alle Textbereiche mehr.
Textvarianten-Tabelle zeigt nur den ausgewählten Bereich.
```

## Textsystem

Wichtig:

```text
Raffle/Giveaway/Ticket/Wheel Texte laufen weiter über helper_texts.renderModuleText(...).
Keine eigene Zufallslogik bauen.
Eine Variante darf nicht mehrere Varianten/Sätzeblöcke mit Zeilenumbrüchen enthalten.
```

Cleanup bestätigt:

```text
/api/loyalty/giveaways/texts enthält keine aktiven mehrzeiligen Varianten mehr.
```

Prüfung, die leer war:

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

## Produktive Raffle Textkeys

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

Alte `raffle.*` Keys nicht mehr produktiv nutzen.

## Wichtige offene Tests

```text
1. !raffle mit entryCostAmount=10 starten.
2. !join mit genug Punkten testen -> Punkteabzug + Teilnahme.
3. Balance vorher/nachher prüfen.
4. Doppeljoin testen -> keine zweite Abbuchung.
5. Zu wenig Punkte testen -> keine Teilnahme + raffle.public.insufficient_balance.
6. Cancel testen -> Refund bezahlter Teilnahmen.
7. Normalen Abschluss testen -> keine Erstattung, Gewinner-Auszahlung.
```

## Wichtige Zusatznotiz StreamElements Import

Beim StreamElements-Punkteimport am 2026-06-15 wurden die StreamElements-Punkte in die Datenbank importiert, aber Punkte, die im neuen System bereits gesammelt wurden, wurden nicht addiert. Für spätere Prüfungen/Korrekturen berücksichtigen.

## Nicht ändern ohne Freigabe

```text
Keine produktive SQLite ersetzen.
Keine Punkte/Transaktionen blind korrigieren.
Keine alten raffle.* Textkeys reaktivieren.
Keine Raffle-Command-Felder zurück in Einstellungen -> Raffle.
Keine Alert-Produktivumschaltung.
Keine neue Raffle-Parallelstruktur.
```

## Nächster sinnvoller Schritt

```text
LC-MINIGAMES-2B Kosten-Live-Test abschließen.
Danach Doku erneut als bestätigt aktualisieren.
Danach LC-CORE-POINTS-3A / Twitch Events weiterführen.
```
