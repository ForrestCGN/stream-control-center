# CURRENT STATUS

Stand: RDAP4A_PERMISSION_LOCK_AUDIT_MODEL_DOCS  
Datum: 2026-06-23

## Aktueller Stand

RDAP4A ist ein reiner Doku-/Planungs-Step für das spätere Remote-Dashboard/Modboard.

Dokumentiert wurde:

- Rollenmodell für Owner/Admin/Lead-Mod/Mod/Sound-Profi/Read-only
- konkrete Permission-Logik statt reiner Rollenprüfung
- Schutzstufen für Ressourcen
- Resource-Key- und Resource-Version-Modell
- Edit-Session-/Lock-Modell mit Heartbeat, Timeout und Übernahme
- Audit-Grundmodell
- Agent-Allowlist- und Sicherheitsprinzipien
- Verhalten bei Agent-Offline
- nächster Planungsschritt RDAP4B

## Vorheriger bestätigter Stand

RDAP3A/FIX1 und DASHUI6D wurden erfolgreich live geprüft:

- Dashboard-v2 ist lokal unter `/dashboard-v2/` erreichbar.
- Bestehendes Dashboard bleibt unter `/dashboard/` produktiv.
- Dashboard-v2 Build-Output liegt unter `htdocs/dashboard-v2/`.
- Deploy-Workflow nimmt `htdocs/dashboard-v2/` mit nach Live.
- Read-only API `/api/remote-agent/status` läuft.
- Dashboard-v2 zeigt sichtbar `Stream-PC Verbindung`.
- Status `offline` ist korrekt, da noch kein produktiver WSS-Agent existiert.

## Nicht geändert durch RDAP4A

- kein Backend-Code
- kein Frontend-Code
- keine API-Routen
- keine DB
- kein Agent
- kein WSS
- keine OBS-/Sound-/Overlay-Steuerung
- keine produktiven Aktionen
- kein Node-Neustart nötig

## Wichtige Leitplanken

- Keine produktive SQLite ersetzen oder löschen.
- Keine Schreibfunktionen ohne Permission/Lock/Audit.
- Keine Agent-Aktionen ohne Allowlist.
- Keine freie Shell-/Datei-/Prozesssteuerung.
- Frontend zeigt Rechte nur an; Backend entscheidet.
- Lokales Dashboard und Remote-Modboard sollen langfristig denselben Lock-Mechanismus nutzen.
