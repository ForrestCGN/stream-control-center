# STEP193.4 - SoundAlerts Direct Entry Actions

Stand: 2026-05-06

## Ziel

SoundAlerts-Eintraege sollen bei direkten Aktionen nicht mehr erst lokal im Dashboard geaendert und danach ueber "Config speichern" persistiert werden muessen.

Insbesondere:

- Loeschen soll nach Sicherheitsabfrage sofort im Backend/DB passieren.
- Ignorieren soll nach Sicherheitsabfrage sofort im Backend/DB passieren.
- Bearbeiten/Speichern normaler Felder bleibt weiterhin ueber "Eintraege speichern" / "Config speichern" moeglich.
- Upload-UX aus STEP193.3 bleibt erhalten.
- Keine bestehende Funktionalitaet entfernen.

## Geaenderte Dateien

- `backend/modules/soundalerts_bridge.js`
- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `project-state/STEP193_4_SOUNDALERTS_DIRECT_ENTRY_ACTIONS_2026-05-06.md`

## Backend

Version:

- `soundalerts_bridge` von `0.1.8` auf `0.1.9`

Neue direkte Entry-Routen:

- `DELETE /api/soundalerts/entries/:entryKey`
- `POST /api/soundalerts/entries/:entryKey/delete`
- `POST /api/soundalerts/entries/:entryKey/ignore`

Neue interne Helper:

- `findEntryByKey(entryKey)`
- `deleteEntryRule(entryKey)`
- `ignoreEntryRule(entryKey, source)`

## Dashboard

Geaendert:

- `Löschen` ruft jetzt direkt `DELETE /api/soundalerts/entries/:entryKey` auf.
- Nach erfolgreichem Loeschen wird `loadAll(true)` ausgefuehrt.
- Kein nachtraegliches `Config speichern` mehr noetig.
- `Ignorieren` ruft jetzt direkt `POST /api/soundalerts/entries/:entryKey/ignore` auf.
- Nach erfolgreichem Ignorieren wird ebenfalls neu geladen.
- Sidebar-Karten wurden leicht entschärft, damit Buttons und Metadaten im schmalen Layout nicht mehr so stark gequetscht werden.

## Fachregel

- Loeschen bedeutet: Eintrag wird aus `soundalerts_bridge_entries` entfernt.
- Wenn derselbe SoundAlerts-Chat spaeter erneut kommt, darf er wieder als neuer offener Eintrag erstellt werden.
- Ignorieren bedeutet: Eintrag bleibt mit `status = ignored` in der DB.
- Wenn derselbe SoundAlerts-Chat spaeter erneut kommt, wird kein neuer offener Eintrag erstellt.

## Tests

Lokal/syntaktisch:

```powershell
node -c backend\modules\soundalerts_bridge.js
node -c htdocs\dashboard\modules\soundalerts.js
```

Live nach Deploy pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

Loesch-Test:

1. Testtrigger ausfuehren, z. B. `Loesch Test Sound`.
2. Eintrag im Dashboard loeschen.
3. Ohne Config-Speichern API pruefen: Eintrag muss weg sein.
4. Denselben Testtrigger erneut ausfuehren: Eintrag darf neu angelegt werden.

Ignore-Test:

1. Eintrag ignorieren.
2. Ohne Config-Speichern API pruefen: `status = ignored`.
3. Denselben Testtrigger erneut ausfuehren: kein zweiter/offener Eintrag wird erstellt.

## Bewusst offen

- Vollstaendiger UX-Feinschliff der SoundAlerts-Eintragskarten kann spaeter separat erfolgen.
- Doku-Rollup in `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` folgt in einem separaten Doku-Sync, falls STEP193.4 live sauber getestet wurde.
