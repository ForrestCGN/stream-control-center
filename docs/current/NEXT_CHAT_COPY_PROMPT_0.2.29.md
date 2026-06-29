# NEXT CHAT COPY PROMPT - RDAP 0.2.29

Du bist im Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch.

## Wichtig

GitHub/dev ist Wahrheit. Nicht aus Erinnerung arbeiten.

Erst lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_RUNTIME_PROFILE_MODULE_PERMISSION_STANDARD.md
docs/current/MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN_0.2.29.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Dann Plan nennen, auf explizites `go` warten, erst danach ZIP bauen.

## Aktueller Stand

```text
0.2.29 - Media Persistent Index Cache Readonly Plan
```

Bestaetigt:

```text
0.2.27B: Agent bleibt nach kompaktem Media-Sync verbunden.
0.2.28: Online-Media-Status bestaetigt: active=true, returned=120, truncated=true, memoryOnly=true, serverPersistence=false.
0.2.29: Persistenter Server-Index nur geplant, noch nicht gebaut.
```

## Naechster sinnvoller Step

```text
RDAP_0.2.30_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_FOUNDATION
```

Vor Planung/Code unbedingt echte DB-/Storage-/Service-Dateien aus GitHub/dev lesen.

Ziel fuer 0.2.30:

```text
- kleinste read-only Foundation fuer persistenten Media-Metadaten-Index planen/bauen
- vorhandene Projekt-DB/Helper bevorzugen, keine Parallelstruktur blind bauen
- Server speichert nur Metadaten, keine Datei-Inhalte
- keine absoluten Pfade
- lokal bleibt Master
- Agent-Snapshot darf Server-Index aktualisieren
- keine Uploads, Deletes, Edits
- keine bidirektionale Datei-Synchronisation
- Migration nur, wenn als eigener bestaetigter Teil sauber geplant
```

Nicht tun:

```text
Keine Technikmodule in Navigation.
Kein media-agent-sync Modul.
Kein OBS-Protokoll fuer Media.
Keine Upload-/Delete-/Edit-Buttons aktivieren.
Keine Datei-Inhalte speichern.
Keine lokalen absoluten Pfade speichern oder anzeigen.
Keine Agent-Apply-Queue ohne separaten Sicherheits-Step.
```

## Standard-Arbeitsweise

```text
GitHub/dev lesen -> Plan -> auf go warten -> ZIP mit echten Zielpfaden.
Wenn Connector-Dateien abgeschnitten sind: Source-Sammel-Script liefern, Source-ZIP abwarten, daraus Install-ZIP bauen.
Check-Ausgaben kurz halten.
Lokal Windows: Invoke-RestMethod + pscustomobject statt jq.
Webserver: curl + jq mit ausgewaehlten Feldern.
```
