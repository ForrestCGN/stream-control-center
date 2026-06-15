# Modul-Doku – Dashboard Loyalty Games / Mini-Spiele

Stand: 2026-06-15 19:55

## Zweck

Das Dashboard-Modul `loyalty_games` bündelt die Loyalty-Dashboard-Oberflächen für Core-nahe Games, Glücksrad, Presets, Giveaways, Mini-Spiele, Einstellungen, Texte, Chat & Befehle und Logs.

## Aktueller sichtbarer Stand

```text
Loyalty -> Mini-Spiele ist sichtbar.
Raffle und Gamble werden gemeinsam angezeigt.
Raffle-Config lädt und speichert.
Raffle-Gewinn gesamt ist als interner Dashboard-Wert sichtbar.
Pool bleibt im Chat ausgeblendet.
Gewinnerregel und Textkeys werden sauber dargestellt.
```

## Relevante Dateien

Repo-Pfade:

```text
dashboard/modules/loyalty.js
dashboard/modules/loyalty_games.js
dashboard/modules/loyalty_games.css
```

Live-Pfade:

```text
D:\Streaming\stramAssets\htdocs\dashboard\modules\loyalty.js
D:\Streaming\stramAssets\htdocs\dashboard\modules\loyalty_games.js
D:\Streaming\stramAssets\htdocs\dashboard\modules\loyalty_games.css
```

## Umgesetzte Dashboard-STEPS

```text
LC-MINIGAMES-1B Dashboard-Tab Mini-Spiele
LC-MINIGAMES-1C Dashboard Layout-Cleanup
LC-MINIGAMES-1D Raffle Detail-Layout unten
```

## Navigation

Vorher:

```text
Start | Core | Glücksrad | Presets | Giveaways | Gamble | Einstellungen | Texte | Chat & Befehle | Logs
```

Jetzt:

```text
Start | Core | Glücksrad | Presets | Giveaways | Mini-Spiele | Einstellungen | Texte | Chat & Befehle | Logs
```

## Mini-Spiele Tab

Zeigt aktuell:

```text
Raffle-Karte
Gamble-Karte
Gamble-KPIs
Raffle-KPIs
Raffle-Formular
Gewinnerregel
Textkeys
```

## Raffle Dashboard

Raffle nutzt:

```text
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
```

Konfigurierbar im aktuellen Stand:

```text
Raffle aktiv
Dauer in Sekunden
Raffle-Gewinn gesamt
Start-Berechtigung
Start-Command
Join-Command
Nur live
Teilnahmekosten vorbereitet
```

Wichtig:

```text
showPoolInChat bleibt serverseitig false.
Dashboard zeigt internen Gewinnbetrag, Chat nicht.
```

## Bekannte Strukturentscheidung

Aktuell liegt noch zu viel Config direkt im Mini-Spiele-Tab. Die Zielstruktur soll später sauberer werden:

```text
Mini-Spiele = Übersicht/Status/Shortcuts
Einstellungen = Config
Texte = Textvarianten
Chat & Befehle = Commands/Rechte/Cooldowns
```

Empfohlener nächster Schritt:

```text
LC-MINIGAMES-2A Struktur-Cleanup
```

Ziel:

```text
Mini-Spiele zeigt Raffle/Gamble read-only + Buttons.
Raffle-Config wandert nach Einstellungen -> Bereich Raffle.
Raffle-Textpflege bleibt/kommt nach Texte -> Bereich Raffle.
Commands langfristig nach Chat & Befehle.
```

## ZIP-/Deploy-Hinweis

Für Repo-Root müssen ZIPs Pfade enthalten:

```text
dashboard/modules/...
```

Für direktes Entpacken nach `D:\Streaming\stramAssets` müssen ZIPs Pfade enthalten:

```text
htdocs/dashboard/modules/...
```

Bei LC-MINIGAMES-1C/1D wurden zusätzlich FULLPATH-ZIPs erstellt, weil direktes Entpacken nach Live sonst nicht korrekt im `htdocs`-Ordner landet.
