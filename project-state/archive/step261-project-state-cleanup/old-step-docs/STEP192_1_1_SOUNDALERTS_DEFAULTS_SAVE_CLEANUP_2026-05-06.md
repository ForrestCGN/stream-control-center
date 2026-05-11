# STEP192.1.1 - SoundAlerts Defaults/Save Cleanup

Stand: 2026-05-06

## Ziel

Nach STEP192.1 wurden SoundAlert-Eintraege korrekt aus der DB gelesen. Beim Speichern aus dem Dashboard konnten aber unsaubere Werte entstehen:

- `outputTarget` blieb leer.
- normale SoundAlerts sollten klar als `channel_reward` laufen.
- Kategorie-Standard-Prioritaet und Prioritaets-Override sollten sauber getrennt bleiben.

## Geaendert

### backend/modules/soundalerts_bridge.js

- Version auf `0.1.3` gesetzt.
- Normalisierung fuer Eintraege ergaenzt:
  - leere Kategorie -> `channel_reward`
  - Video -> `outputTarget: overlay`
  - Audio -> `outputTarget: device`
- `dbRowToRule()` gibt normalisierte Werte aus, damit API/Dashboard keine leeren Output-Werte mehr sehen.
- Sound-System-Payload berechnet die effektive Prioritaet nun aus:
  1. explizitem Override `priority`
  2. Kategorie-Standard
  3. Modul-Default
- Bestehende JSON-/DB-Fallback-Logik bleibt erhalten.

### htdocs/dashboard/modules/soundalerts.js

- Kategorie-Label fuer normale SoundAlerts angepasst:
  - `SoundAlerts / Kanalpunkte (70)`
- Rule-Normalisierung ergaenzt:
  - leere Kategorie -> `channel_reward`
  - Video -> `outputTarget: overlay`
  - Audio -> `outputTarget: device`
- Prioritaet bleibt leer/null, wenn kein echter Override gesetzt wurde.
- Upload setzt den passenden OutputTarget anhand des Medientyps mit.

## Nicht geaendert

- Keine Funktionalitaet entfernt.
- Upload-System bleibt unveraendert.
- DB-Events bleiben unveraendert.
- JSON bleibt Seed/Fallback.
- SoundAlert-Eintraege bleiben DB-Hauptquelle.

## Tests

Syntax:

```powershell
node -c backend/modules/soundalerts_bridge.js
node -c htdocs/dashboard/modules/soundalerts.js
```

Live nach Deploy:

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/reload" -Method POST | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

Erwartung fuer Fahrstuhl Sound:

```json
"category": "channel_reward",
"outputTarget": "overlay"
```

`priority` soll fehlen/null bleiben, wenn kein Override gesetzt ist.

## Commit

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: normalize soundalerts entry defaults"
```
