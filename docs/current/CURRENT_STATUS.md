# CURRENT_STATUS – stream-control-center

Stand: 2026-06-16

## Aktueller bestätigter Arbeitsstand

```text
LC-MINIGAMES-2B FIX3 – Raffle Teilnahmekosten vorbereitet, Text-DB-Cleanup bestätigt
Nächster offener Test: Raffle-Teilnahmekosten live prüfen
```

## Kurzfazit

Der Loyalty-Core ist live. Raffle ist weiterhin bewusst im bestehenden Modul `backend/modules/loyalty_giveaways.js` integriert und wurde im Dashboard sauberer in die Loyalty-Struktur einsortiert.

Bestätigt:

```text
Loyalty Core läuft produktiv.
StreamElements-Punkteimport wurde durchgeführt.
Watch-Punkte und Twitch-Event-Boni wurden produktiv gebucht.
Raffle-Config ist im Dashboard unter Loyalty -> Einstellungen -> Raffle.
Raffle-Status/Bedienung bleibt unter Loyalty -> Mini-Spiele.
Raffle-Texte sind unter Loyalty -> Texte -> Raffle sichtbar.
Raffle-Textvarianten-Tabelle filtert nur noch den ausgewählten Bereich.
```

## Raffle / Mini-Spiele – bestätigter Stand

```text
backend/modules/loyalty_giveaways.js
moduleVersion = 0.1.13
moduleBuild = STEP_LC_MINIGAMES_2B_FIX3_TEXT_DB_CLEANUP
```

Bestätigte Raffle-Routen:

```text
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
GET  /api/loyalty/giveaways/raffle/status   Kompatibilität
```

## Raffle-Config

Aktuell fachlich relevante Config:

```text
enabled
liveOnly
durationSeconds
maxDurationSeconds
prizePoolAmount
entryCostAmount
entryCostEnabled
showPoolInChat = false
```

Command-Felder werden nicht mehr im Raffle-Config-Bereich bearbeitet. Sie bleiben intern erhalten und gehören langfristig nach `Loyalty -> Chat & Befehle` bzw. in das zentrale Command-Modul.

## Teilnahmekosten

Teilnahmekosten wurden backendseitig vorbereitet/eingebaut:

```text
entryCostAmount = 0  -> kostenlos
entryCostAmount > 0  -> entryCostEnabled=true, Join soll Punkte abbuchen
```

Bestätigt:

```text
POST/GET /api/loyalty/raffle/config speichert entryCostAmount=10 und entryCostEnabled=true korrekt.
```

Noch offen:

```text
Live-Test mit !raffle / !join bei genug Punkten
Live-Test mit !join bei zu wenig Punkten
Cancel-Test mit Erstattung bezahlter Teilnahmen
Normaler Ablauf mit Auszahlung und ohne Erstattung
```

## Textsystem / Cleanup

Raffle/Giveaway/Ticket/Wheel-Texte laufen weiter über den vorhandenen Helper:

```text
backend/modules/helpers/helper_texts.js
helper_texts.renderModuleText(...)
```

Keine eigene Zufallslogik wurde gebaut.

Bestätigt:

```text
Alte aktive mehrzeilige Sammelvarianten wurden für loyalty_giveaways Textbereiche bereinigt.
Prüfung auf aktive Varianten mit Zeilenumbrüchen lieferte keine Ausgabe.
Raffle nutzt produktiv neue Keys raffle.public.*.
Alte raffle.* Seed-Keys wurden aus dem aktiven Pfad entfernt/bereinigt.
```

Betroffene Textbereiche:

```text
chat_raffle
chat_giveaway
chat_ticket
chat_wheel
```

## Dashboard-Stand

Geänderte Dashboard-Datei im aktuellen Mini-Spiele-/Raffle-Cleanup:

```text
htdocs/dashboard/modules/loyalty_games.js
```

Bestätigt:

```text
Mini-Spiele ist Status-/Bedienseite.
Raffle-Config wurde aus Mini-Spiele herausgezogen.
Einstellungen -> Raffle zeigt nur fachliche Config.
Texte -> Raffle zeigt nur Raffle-Texte.
Dropdown „Alle Textbereiche“ wurde entfernt.
Texttabelle zeigt immer nur den aktuell gewählten Bereich.
```

## Wichtige Beobachtung zum StreamElements-Import

Beim StreamElements-Punkteimport am 2026-06-15 wurden die StreamElements-Punkte importiert, aber Punkte, die im neuen Loyalty-System bereits gesammelt wurden, wurden dabei nicht addiert. Das muss für spätere Prüfungen/Korrekturen berücksichtigt werden.

## Nicht geändert

```text
Keine produktive SQLite ersetzt.
Keine User-Balances pauschal verändert.
Keine Transaktionen gelöscht.
Keine Raffle-Gewinnerregel geändert.
Keine Command-Registry umgebaut.
Keine Alert-Produktivumschaltung.
Keine neue Raffle-Parallelstruktur gebaut.
```
