# STEP257 DeathCounter DB Read-Test

Dieses Paket ergänzt eine reine Read-only-Route:

```text
GET /api/deathcounter/v2/storage/read-test
```

Sie baut aus den importierten DeathCounter-DB-Tabellen einen Public-State und vergleicht ihn mit dem weiterhin aktiven JSON-State.

Wichtig:

```text
- kein DB-Write
- kein Import
- kein Storage-Wechsel
- keine Overlay-/Streamer.bot-Änderung
- JSON bleibt produktiv aktiv
```

Nach dem Entpacken nach `D:\Git\stream-control-center`:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP257 deathcounter db read test"
```

Live-Test:

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/read-test?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/read-test?includeState=true&limit=20" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```
