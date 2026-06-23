# NEXT STEPS

Stand: RDAP3A-FIX1 / DASHUI7 Stream-PC Verbindung UI-Begriffe korrigiert  
Datum: 2026-06-23

## Aktueller nächster Schritt nach Einspielen

Zuerst RDAP3A-FIX1 testen.

Build und Testdeploy:

```cmd
build-dashboard-v2.cmd
testdeploy.cmd
```

API prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/status" | ConvertTo-Json -Depth 8
```

Erwartung:

```text
ok: true
module: remote_agent
moduleBuild: RDAP3A_DASHUI7_READONLY_STATUS
readOnly: true
writeEnabled: false
actionEnabled: false
status.connectionState: offline
```

Dashboard prüfen:

```text
http://127.0.0.1:8080/dashboard-v2/?v=rdap3a-fix1
Live -> Stream-PC
```

Erwartung:

```text
Stream-PC Verbindung
Stream-PC nicht verbunden
read-only
kein WSS-Dienst verbunden
keine Schreibroute
keine produktiven Aktionen
```

Die alte Platzhalteranzeige darf nicht mehr sichtbar sein:

```text
Status in DASHUI5
Platzhalter
```

## Nächster Planungsstep

```text
RDAP3B / Minimaler WSS-Dienst lokal im Testmodus planen
```

RDAP3B soll zuerst nur planen:

- eigener lokaler Node-Dienst für den Stream-PC
- lokale Config
- agentId + Secret
- WSS-Verbindung im Testmodus
- Heartbeat senden
- Statusdaten an Server übergeben
- Reconnect-Verhalten
- Auth-Fehler sauber anzeigen
- weiterhin keine produktiven Aktionen

## Nicht in RDAP3B ohne gesondertes go

- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Media-Schreiboperation
- keine Text-/Config-Änderung
- keine Commands/Kanalpunkte
- keine DB-Aktionen
- keine Datei-/Shell-/Prozessaktionen
- kein Remote-Start/Stop

## Spätere Steps

```text
RDAP3C / Webserver Reverse Proxy + WSS-Test planen
RDAP3D / Agent Heartbeat live gegen mods.forrestcgn.de planen
RDAP4 / Permission-/Lock-/Audit-Modell konkretisieren
```

## Wichtig

Vor jedem weiteren Step:

- echten Repo-/Dateistand prüfen
- keine Annahmen
- fehlende Dateien konkret anfordern
- Umsetzung nur nach Forrests `go`
- keine bestehende Funktionalität entfernen
