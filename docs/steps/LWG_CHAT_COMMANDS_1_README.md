# LWG_CHAT_COMMANDS_1

## Zweck

Aktiviert die vorbereiteten Chat-Commands fuer das normale Loyalty-Giveaway/Glücksrad:

- `!ticket` / `!ticket <anzahl>` fuer Teilnahme am aktuell offenen Giveaway.
- `!wheel` und Alias `!rad` fuer Gewinner mit offener Wheel-Permission.

## Nicht geändert

- `!join` bleibt Raffle-Command.
- `!raffle` bleibt Raffle-Control.
- Draw-, Exclusion-, Wheel-Claim- und Bound-Wheel-Logik bleiben fachlich unverändert.
- DB-Schema wird nicht geändert.
- Keine Dashboard-Dateien werden geändert.

## Geänderte Datei

- `backend/modules/loyalty_giveaways.js`

## Technische Hinweise

- Modulversion: `0.1.16`
- Modulbuild: `LWG_CHAT_COMMANDS_1`
- Die Seed-Logik aktualisiert vorhandene DB-Einträge fuer `ticket` und `wheel`, weil diese in bestehenden Installationen bereits als deaktivierte Rows vorhanden sein koennen.
- Nur `ticket` und `wheel` werden per Seed-Update angefasst. Raffle-/Join-Commands werden nicht überschrieben.

## Nach dem Einspielen

1. ZIP nach Repo-Root entpacken.
2. Deploy/Live aktualisieren wie üblich.
3. StepDone ausführen.
4. Backend neu starten, falls der Deploy das nicht automatisch macht.
5. Prüfen:

```powershell
$base = "http://127.0.0.1:8080"
Invoke-RestMethod "$base/api/loyalty/giveaways/commands" | ConvertTo-Json -Depth 10
Invoke-RestMethod "$base/api/loyalty/giveaways/central-commands" | ConvertTo-Json -Depth 10
```

Erwartung:

- `ticket enabled=true active=true`
- `wheel enabled=true active=true`
- zentrale Commands `ticket` und `wheel` enabled=true
