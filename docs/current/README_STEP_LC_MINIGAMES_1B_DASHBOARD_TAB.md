# STEP LC-MINIGAMES-1B – Dashboard-Tab „Mini-Spiele"

Datum: 2026-06-15

## Ziel

Der Loyalty-Bereich bekommt einen eigenen Haupttab **Mini-Spiele**. Dort werden Raffle und Gamble gemeinsam angezeigt, weil beide keine klassischen Giveaways sind.

## Geänderte Dateien

- `dashboard/modules/loyalty.js`
- `dashboard/modules/loyalty_games.js`

## Änderung

### Loyalty-Hauptnavigation

Der bisherige direkte Haupttab `Gamble` wurde durch `Mini-Spiele` ersetzt.

Neue Struktur im Loyalty-Bereich:

- Start
- Core
- Glücksrad
- Presets
- Giveaways
- Mini-Spiele
- Einstellungen
- Texte
- Chat & Befehle
- Logs

### Mini-Spiele-Tab

Der neue Tab zeigt:

- Übersichtskarte Mini-Spiele
- Raffle-Karte
- Gamble-Karte
- Raffle-Status
- Raffle-Konfiguration
- Raffle-Gewinnerregel read-only
- Raffle-Textkeys read-only mit Verweis auf den zentralen Texte-Bereich
- Gamble-Kurzstatus mit Buttons für bestehende Statistik/Audit/Config

### Raffle-Config

Raffle liest und speichert über:

- `GET /api/loyalty/raffle/config`
- `POST /api/loyalty/raffle/config`

Konfigurierbar im Dashboard:

- aktiv/inaktiv
- Dauer in Sekunden
- Gewinnpool intern
- Start-Berechtigung
- Start-Command
- Join-Command
- liveOnly
- Teilnahmekosten vorbereitet

Wichtig: `showPoolInChat` wird beim Speichern weiterhin auf `false` gesetzt. Der Pool bleibt im Chat ausgeblendet.

## Nicht geändert

- Keine Backend-Änderung
- Keine DB-Änderung
- Keine Gamble-Logik geändert
- Keine Raffle-Buchungslogik geändert
- Keine Giveaways/Wheel-Logik geändert
- Keine Textvarianten geändert

## Tests

Nach Einspielen:

```powershell
cd D:\Git\stream-control-center
node -c .\dashboard\modules\loyalty.js
node -c .\dashboard\modules\loyalty_games.js
```

Danach Dashboard neu laden:

- `http://127.0.0.1:8080/dashboard`
- Loyalty öffnen
- Tab `Mini-Spiele` prüfen
- Raffle-Config laden
- Raffle-Config speichern
- Danach prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" | ConvertTo-Json -Depth 6
```

## Hinweis

Raffle bleibt technisch vorerst im bestehenden Backend-Modul `loyalty_giveaways.js`, wird aber im Dashboard als Mini-Spiel geführt. Ein späterer technischer Split ist möglich, aber in diesem STEP bewusst nicht enthalten.
