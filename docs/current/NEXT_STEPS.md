# NEXT_STEPS – stream-control-center

Stand: 2026-06-15

## Aktueller bestätigter Stand

```text
LC-CORE-CLEANUP-1 bestätigt.
LC-CORE-POINTS-1 bestätigt.
LC-CORE-POINTS-2A bestätigt.
LC-CORE-POINTS-2B bestätigt.
LC-CORE-POINTS-2C bestätigt.
```

## Kein weiteres StepDone nötig

```text
LC-CORE-POINTS-1 wurde bereits nach dem Einspielen per StepDone markiert.
Die folgenden Tests 2A/2B/2C bestätigen den Ablauf fachlich und benötigen kein zweites StepDone.
```

## Nächster sinnvoller Kurzentscheid

### ForrestCGN ignorieren?

Im Presence-Test bekam `forrestcgn` Watch-Punkte, weil der User aktuell nicht aktiv ignoriert wurde.

Prüfbefehl:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/ignored-users" | ConvertTo-Json -Depth 8
```

Falls `forrestcgn` wieder ignoriert werden soll:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/ignored-users" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","reason":"broadcaster/system account","enabled":true}' | ConvertTo-Json -Depth 8
```

## Nächster Core-Block

```text
LC-CORE-POINTS-3 – EventBonus-Pfad mit echten Twitch-Events prüfen
```

Ziel:

```text
Follow/Sub/Resub/Cheer/Raid/Tip über zentrale Twitch-Events bzw. Ingest-Pfade prüfen.
Sicherstellen, dass Event-Boni im Shadow-Modus korrekt, dedupliziert und dashboardfähig laufen.
Keine Live-/Shadow-Umschaltung.
Keine produktive SQLite ersetzen.
```

## Relevante Test-Routen

```text
GET /api/loyalty/status
GET /api/loyalty/settings
GET /api/loyalty/events
POST /api/loyalty/events/ingest
GET /api/loyalty/events/test/:type
GET /api/loyalty/transactions?limit=20
GET /api/loyalty/ignored-users
```

## Später

```text
- Subscriber-Tier-Erkennung aus Presence verbessern.
- Testdaten-Bereinigung planen.
- Dashboard-Anzeige für Stream-State/Presence verständlicher machen.
- Giveaways/Loyalty Games an bestätigte Core-Pfade anbinden.
```
