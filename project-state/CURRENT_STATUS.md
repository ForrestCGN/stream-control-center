# CURRENT_STATUS – stream-control-center

Stand: 2026-06-15
Fokus: Loyalty Core / Dashboard / Go-Live Vorbereitung / Punkteimport

## Aktueller Status

```text
Loyalty Core ist produktiv über Twitch Events + Communication Bus angebunden.
Dashboard wurde in zentrale Bereiche aufgeräumt: Einstellungen, Texte, Logs.
Mehrere Core-Einstellungen sind inzwischen wirklich speicherbar.
Logs sind zentral lesbar.
Texte sind zentral bearbeitbar, soweit Varianten sichere IDs haben.
```

## Wichtige Versionen / Stände

```text
backend/modules/loyalty.js: 0.1.23
htdocs/dashboard/modules/loyalty_games.js: Stand LC-DASHBOARD-TEXTS-4
htdocs/dashboard/modules/loyalty.js: Stand nach Dashboard-Cleanup/Core-Config-Arbeiten
```

## Bestätigte Core-Funktion

```text
Twitch EventSub → twitch.js → twitch_events → Communication Bus → loyalty
7 gezielte Support-Event-Bindings aktiv:
- follow
- sub
- resub
- subgift
- giftbomb
- cheer
- raid
```

## Bestätigte speicherbare Dashboard-Settings

Unter `Loyalty → Einstellungen → Core`:

```text
Core-Grundregeln
Automatische Punkte
Abo-Bonus bei automatischen Punkten
Geschenk-Abo-/GiftBomb-Empfänger-Modus
Raid-Regel
```

Getestet:

```text
Gift Receiver Mode speichert und wird vom Backend gelesen.
Raid maxAmount speichert und verändert Samples.
watch.amount speichert korrekt.
subscriberMultiplier und subscriberTierAmounts speichern korrekt.
```

## Dashboard Struktur

Aktuelle Top-Navigation:

```text
Start
Core
Glücksrad
Presets
Giveaways
Gamble
Einstellungen
Texte
Chat & Befehle
Logs
```

Core-Untermenü ist entschlackt:

```text
Übersicht
Steuerung
Auswertung
User
Bots ignorieren
```

Core-Regeln liegen zentral unter Einstellungen. Core-Verlauf/Events liegen zentral unter Logs.

## Logs

`Loyalty → Logs` ist zentrale Log-Ansicht für:

```text
Core Events / Punktebuchungen
Glücksrad Sessions
Gamble Logs
```

Details werden über Modal angezeigt. Technische IDs stehen nicht mehr direkt in der Haupttabelle.

## Texte

`Loyalty → Texte` ist zentrale Textpflege.

```text
Bereichsauswahl
Suche
kompakte Haupttabelle
Editor-Modal pro Textzweck
Neue Varianten hinzufügen
Aktivieren/Deaktivieren/Löschen mit Nachfrage, wenn sichere Varianten-ID vorhanden
```

Nutzt aktuell:

```text
/api/loyalty/giveaways/texts
/api/loyalty/games/texts
```

## Alert-System

```text
Alert-Bus-Weg bleibt im Shadow-Modus.
Produktive Alerts laufen weiterhin über alten Direktpfad.
Nicht vor Stream-Go-Live umschalten.
```

## Nächster Fokus

```text
Stream-Go-Live vorbereiten und Punkteimport planen/umsetzen.
```
