# Current Status

Stand: 2026-06-29

Aktuell: `0.2.28 - Media Agent Slow Sync Status Polish Readonly`.

## Technischer Stand

```text
- 0.2.27B ist lokal und online getestet: Agent bleibt nach Media-Sync verbunden.
- Webserver-Check bestaetigt: connected=true, lastMediaSync gesetzt, mediaReject=null, heartbeatReject=null.
- Online /api/remote/agent/media/inventory/status liefert Media-Inventar aus Agent-Memory.
- Aktueller Online-Stand im Test: 120 Eintraege, truncated=true, Quelle agent-wss-media-inventory-sync.
- 0.2.28 verfeinert nur Status-/UI-Texte fuer den kompakten Agent-Memory-Index.
- Es gibt weiterhin keinen persistenten Server-Cache fuer Media-Daten.
- Lokal bleibt Master/Wahrheit fuer echte Media-Dateien unter htdocs/assets/*.
- Media-System bleibt fachliches Modul; Agent/Sync/Cache bleiben Infrastruktur.
- Upload/Edit/Delete bleiben false.
- Keine Datei-Inhalte, keine absoluten Pfade, keine DB-Migration, keine Shell-/Prozess-Actions.
- OBS-Modul bleibt bei 0.2.22E geparkt.
```

## Naechste Architekturentscheidung

```text
Persistenter Server-Index ist sinnvoll, aber nur als separater read-only Plan-/Code-Step.
Kein voller bidirektionaler Datei-Sync ohne Permission, Confirm, Audit, Conflict-Handling und lokalen Agent-Apply-Mechanismus.
Lokal bleibt wichtigste Quelle, weil dort die produktiven Medien benutzt werden.
```

## Standard-Arbeitsweise Zusatz

```text
Wenn GitHub/dev ueber Connector nur unvollstaendig oder abgeschnitten verfuegbar ist:
1. Assistant liefert zuerst ein Sammel-Script fuer die benoetigten Quell-Dateien.
2. Forrest fuehrt es lokal im Repo aus und laedt die Source-ZIP hoch.
3. Assistant baut daraus erst danach den echten Install-Step-ZIP mit echten Repo-Zielpfaden.
4. Source-ZIP ist niemals Install-ZIP.

Server-/API-Checks:
- Standardmaessig kurze `jq '{...}'` Ausgaben verwenden.
- Volles JSON nur bei Fehlerdiagnose oder ausdruecklicher Anforderung.
- Lokal unter Windows PowerShell `Invoke-RestMethod` statt jq verwenden.
```

## Sicherheitsgrenzen

```text
keine Media-Uploads
keine Media-Deletes
keine Media-Edits
keine DB-Migration ohne separaten Step
keine Shell-/Datei-/Prozess-Actions
keine absoluten Pfade in API/UI
keine Secrets in Logs/Status/UI/Docs
```
