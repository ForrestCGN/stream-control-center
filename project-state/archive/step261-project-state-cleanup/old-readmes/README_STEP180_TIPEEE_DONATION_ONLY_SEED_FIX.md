# STEP180 – Tipeee Donation-only Seed Fix

## Ziel
TipeeeStream soll standardmäßig nur Donation-Alerts anlegen und auslösen. Tipeee-Follow/Hosting/Subscription sollen nicht automatisch als aktive Alert-Regeln entstehen.

## Geändert
- `backend/modules/tipeee.js`
- STEP-Kennung auf `180` gesetzt.
- `seedAlertTypesAndRules()` seedet nur noch:
  - `tipeee / donation`
  - `Tipeee Donation Standard`
- Vorhandene Tipeee-Regeln/Typen für folgende Typen werden defensiv deaktiviert:
  - `subscription`
  - `follow`
  - `hosting`
  - `host`

## Nicht geändert
- Socket-Verbindung bleibt erhalten.
- Donation-Verarbeitung bleibt erhalten.
- Duplicate-Tracking bleibt erhalten.
- Webhook/Test/Status-Routen bleiben erhalten.
- Bestehende DB wird nicht ersetzt.

## Einbau
Datei ersetzen:

```txt
D:\Streaming\stramAssets\backend\modules\tipeee.js
```

Danach:

```powershell
Node/Backend neu starten
Dashboard mit STRG + F5 neu laden
```

## Prüfung
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/tipeee/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/rules" | ConvertTo-Json -Depth 20
```

Erwartung: Tipeee-Follow/Hosting/Subscription sind nicht aktiv. Tipeee-Donation bleibt aktiv.
