# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## Nächster empfohlener Schritt

### STEP204 - Loyalty Dashboard Basic

Nach STEP203 sollte zuerst ein schlankes Dashboard-Modul entstehen.

Ziel:

```text
Loyalty sichtbar und kontrollierbar machen,
ohne StreamElements abzulösen.
```

Geplanter Umfang:

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
Einbindung in htdocs/dashboard/index.html
```

Dashboard-Tabs zuerst schlank:

```text
Übersicht
Settings
User
Transaktionen
Ignored Users
Routen/Test
```

Noch nicht bauen:

```text
Rewards
Giveaways
Games
Overlays
Import
```

## Nach Live-Deploy von STEP203 testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/routes" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/test/watch?login=testviewer&displayName=TestViewer" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/test/watch?login=testsub&displayName=TestSub&subscriber=1" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/users" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
testviewer bekommt +2
testsub bekommt +6
mode = shadow
StreamElements bleibt aktiv
```

## Verbindliche Loyalty-Regeln

```text
Alles, was Kekskrümel gibt, nimmt, prüft, reserviert, erstattet oder verändert, läuft ausschließlich über das Loyalty-System.
```

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
```

```text
Shadow Mode zuerst, StreamElements bleibt aktiv, Import später.
```
