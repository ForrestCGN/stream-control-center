# STEP LC-RAFFLE-2A – Raffle Config-Routen / Mini-Spiele-Vorbereitung

Datum: 2026-06-15

## Ziel

Raffle bleibt funktional unverändert im bestehenden Backend-Modul `loyalty_giveaways`, wird aber für den künftigen Dashboard-Bereich **Loyalty → Mini-Spiele** vorbereitet.

## Geändert

- `backend/modules/loyalty_giveaways.js`

## Neuer Modulstand

- `MODULE_VERSION = 0.1.8`
- `MODULE_BUILD = STEP_LC_RAFFLE_2A_CONFIG_ROUTES`

## Neue Routen

- `GET /api/loyalty/raffle/status`
- `GET /api/loyalty/raffle/config`
- `POST /api/loyalty/raffle/config`

Die bestehende Kompatibilitätsroute bleibt erhalten:

- `GET /api/loyalty/giveaways/raffle/status`

## Neue Config-Tabelle

Sanft per `CREATE TABLE IF NOT EXISTS`:

- `loyalty_raffle_config`

Es werden keine bestehenden Tabellen ersetzt oder überschrieben.

## Aktuell konfigurierbar

- Raffle aktiviert/deaktiviert
- Dauer in Sekunden
- interner Gewinnpool
- Live-only Flag als Config-Wert
- Startberechtigung als Config-Wert
- Raffle-/Join-Command als Config-Wert

Wichtig: `entryCostAmount` bleibt in diesem Schritt bewusst bei `0`, weil Teilnahme-Kosten noch keine Abbuchungslogik haben.

## Laufzeitänderung

Die Raffle nutzt jetzt die Config für:

- Dauer
- interner Gewinnpool
- Aktiviert/Deaktiviert

Der Pool bleibt intern und wird weiterhin nicht im Chat angezeigt.

## Nicht geändert

- Keine Dashboard-Oberfläche
- Keine neuen Module
- Keine Änderung an Giveaway-/Wheel-Logik
- Keine Änderung an Gamble
- Keine Änderung an bestehenden Commands
- Keine Entfernung der alten Raffle-Statusroute
- Keine Änderung an bestehenden Raffle-Textkeys
- Keine DB-Daten werden gelöscht oder ersetzt

## Tests

Syntax:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Nach Neustart/Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" | ConvertTo-Json -Depth 6
```

Config-Test ohne Funktionsänderung:

```powershell
$body = @{ durationSeconds = 120; prizePoolAmount = 5000; enabled = $true } | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 6
```

## Nächster Schritt

`LC-MINIGAMES-1B`: Dashboard-Bereich **Mini-Spiele** vorbereiten und dort Karten/Unterbereiche für Raffle und Gamble anzeigen.
