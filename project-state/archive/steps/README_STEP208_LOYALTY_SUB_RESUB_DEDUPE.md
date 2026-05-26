# STEP208 – Loyalty Subscribe/Resub Dedupe

Dieses ZIP direkt nach `D:\Git\stream-control-center` entpacken.

Danach ausführen:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: dedupe loyalty subscribe resub collision"
```

Nach Deploy prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 60
```

Erwartung:

- `version = 0.1.11`

Dedupe-Test:

```powershell
$u = "dedupetest_$(Get-Date -Format 'HHmmss')"

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/subscribe?login=$u&tier=1000&eventUid=test_sub_$u" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/resub?login=$u&tier=1000&months=12&eventUid=test_resub_$u" | ConvertTo-Json -Depth 100

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events?login=$u&limit=10" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?login=$u&limit=10" | ConvertTo-Json -Depth 100
```

Erwartung:

- Subscribe-Event wird nach dem Resub als `replaced_by_resub` markiert.
- Es gibt eine negative `event_dedupe_adjustment`-Transaktion.
- Resub bleibt normal verarbeitet.
- Netto entspricht nur dem Resub, nicht Subscribe + Resub.
