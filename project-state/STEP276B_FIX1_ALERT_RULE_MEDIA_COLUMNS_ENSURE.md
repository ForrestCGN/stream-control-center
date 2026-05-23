# STEP276B_FIX1_ALERT_RULE_MEDIA_COLUMNS_ENSURE

## Ziel

Nachfix zu STEP276B: Die neuen Alert-Regel-Spalten für Media-Registry-Referenzen müssen auch bei Live-Datenbanken vorhanden sein, wenn die gespeicherte Modul-Schema-Version bereits auf 6 steht.

## Geänderte Datei

- `backend/modules/alert_system.js`

## Änderung

- `ensureSchema()` ruft nach der normalen Schema-Migration zusätzlich `ensureAlertRuleMediaColumns()` auf.
- `ensureAlertRuleMediaColumns()` nutzt die zentrale DB-Hilfsfunktion `database.ensureColumn(...)` für:
  - `alert_rules.sound_media_id INTEGER`
  - `alert_rules.image_media_id INTEGER`

## Schutz bestehender Funktionalität

- Keine bestehende Funktion wurde entfernt.
- Keine Alert-Regel wurde verändert.
- Keine Assets wurden verändert oder gelöscht.
- Keine Dashboard-/Upload-/Playback-Logik wurde geändert.
- Legacy-Felder `sound_asset_id`, `image_asset_id`, `sound_url`, `image_url` bleiben unverändert.

## Erwarteter Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 5

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/rules"
$r.rules[0].PSObject.Properties.Name
```

Erwartung:

```text
sound_media_id
image_media_id
```

tauchen in der Property-Liste auf.
