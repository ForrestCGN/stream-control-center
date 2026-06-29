# Current Status

Stand: 2026-06-29

Aktuell: `0.2.30 - Stop and Inventory No Code`.

## Technischer Stand

```text
- 0.2.27B ist lokal und online getestet: Agent bleibt nach Media-Sync verbunden.
- Webserver-Check bestaetigt: connected=true, lastMediaSync gesetzt, mediaReject=null, heartbeatReject=null.
- Online /api/remote/agent/media/inventory/status liefert Media-Inventar aus Agent-Memory.
- 0.2.28 ist online bestaetigt: runtimeMode=online, active=true, returned=120, truncated=true, memoryOnly=true, serverPersistence=false.
- Lokal liefert Media-Inventar vollstaendig aus htdocs/assets/* und bleibt Master/Wahrheit.
- 0.2.29 ist ein reiner Plan-/Doku-Step fuer persistenten Server-Index-Cache read-only.
- 0.2.30 ist ein Stop-/Inventory-/No-Code-Step nach fehlerhaftem und zurueckgesetztem 0.2.30-Versuch.
- Es gibt weiterhin keinen persistenten Server-Cache fuer Media-Daten im Runtime-Code.
- Media-System bleibt fachliches Modul; Agent/Sync/Cache bleiben Infrastruktur.
- Upload/Edit/Delete bleiben false.
- Keine Datei-Inhalte, keine absoluten Pfade, keine DB-Migration, keine Shell-/Prozess-Actions.
- Keine neuen Runtime-Dateien ohne ausdrueckliche Forrest-Freigabe.
- OBS-Modul bleibt bei 0.2.22E geparkt.
```

## Grund fuer 0.2.30 Stop

```text
Der vorherige 0.2.30-Versuch wurde zurueckgesetzt, weil lokale 8080-Struktur und Server-3010-Struktur nicht sauber genug gemeinsam betrachtet wurden.
Ab jetzt darf kein Persistent-Index-Code gebaut werden, bevor echte Dateien erneut gelesen und eine 8080/3010-Datei-/Modulkarte erstellt wurde.
```

## Naechste Architekturentscheidung

```text
Persistenter Server-Index ist weiterhin sinnvoll, aber nur als spaeterer separater read-only Code-/Migration-Step nach echter Dateipruefung.
Keine neue Runtime-Datei als Standardloesung.
Vorhandene Dateien/Helper bevorzugen.
Kein voller bidirektionaler Datei-Sync ohne Permission, Confirm, Audit, Conflict-Handling und lokalen Agent-Apply-Mechanismus.
Lokal bleibt wichtigste Quelle, weil dort die produktiven Medien benutzt werden.
```

## 0.2.29 Plan-Ergebnis bleibt gueltig

```text
- Server darf spaeter hoechstens sanitisierten Metadaten-Index speichern.
- Keine Datei-Inhalte.
- Keine absoluten lokalen Pfade.
- Lokal bleibt Master.
- Agent reconnect soll spaeter Server-Index wieder auf aktuellen Stand bringen.
- Upload/Edit/Delete bleiben fuer separate spaetere Steps geparkt.
```

## 0.2.30 Ergebnis

```text
- Projektbremse gesetzt.
- Keine Runtime-Dateien geaendert.
- Keine DB-Migration eingefuehrt.
- Keine neue Runtime-Datei erstellt.
- Kein Webserver-Deploy noetig.
- Naechster Schritt muss zuerst eine Datei-/Modulkarte fuer 8080 und 3010 liefern.
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
keine absoluten Pfade in API/UI/DB
keine Datei-Inhalte im Server-Index
keine Secrets in Logs/Status/UI/Docs
keine neuen Runtime-Dateien ohne ausdrueckliche Forrest-Freigabe
```
