# NEXT_STEPS

## Naechster Schritt

`RDAP_0.2.59_MEDIA_INDEX_DELTA_UPSERT_PLAN_GATED`

Ziel:
- Gated Delta-Upsert separat planen.
- Nur neue/geaenderte Agent-Dateien als spaetere Upsert-Kandidaten betrachten.
- Erforderliche Gates, Confirm, Audit/Lock und Readback definieren.
- Keine Upload/Edit/Delete-Funktion.
- Keine Datei-Inhalte, keine absoluten Pfade.
- Keine dauerhafte Write-Aktivierung.

## Davor pruefen

- 0.2.58A Webserver-Ergebnis gegen `/api/remote/media/index/diff/status` anschauen.
- Besonders `changedOnAgentCount`, `unchangedCount`, `metadataCompareWarnings` und `changeReasonCounts` bewerten.

## Danach

- Tombstone/`deleted=1` fuer fehlende Dateien separat planen.
- Online->Agent Queue separat und nur mit expliziten Permission-/Audit-/Confirm-Gates planen.
