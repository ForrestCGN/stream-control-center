# NEXT STEPS - stream-control-center

Stand: RDAP_UI2_READONLY_COMFORT
Datum: 2026-06-24

## Aktueller Schritt

```text
RDAP_UI2_READONLY_COMFORT
```

## Test nach Einspielen

Lokal/Windows nach `installstep.cmd`:

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
```

Danach Webserver-Deploy mit dem bestätigten Script:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP_UI2_READONLY_COMFORT
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP_UI2_READONLY_COMFORT
cd RDAP_UI2_READONLY_COMFORT
sudo bash tools/remote-modboard-deploy.sh RDAP_UI2_READONLY_COMFORT dev
```

Dann im Browser prüfen:

```text
https://mods.forrestcgn.de/
```

Erwartung:

- UI zeigt weiterhin read-only Diagnose
- Auto-Refresh-Zähler sichtbar
- letzte Aktualisierung sichtbar
- Schnellstatus sichtbar
- Endpoint-Status sichtbar
- manueller Refresh funktioniert
- OAuth Start/Callback bleiben HTTP 403

## Danach

Wenn UI2 live bestätigt ist:

```text
RDAP_UI2_READONLY_COMFORT_LIVE_CONFIRMED
```

dokumentieren und danach erst nächsten Scope planen.

Möglicher nächster Scope danach:

- UI3 read-only Details/Filter
- oder Auth/Login-Konzept separat planen, aber noch nicht aktivieren
