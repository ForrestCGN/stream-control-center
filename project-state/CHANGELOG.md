# CHANGELOG

## 0.2.119 - Local Logs Readonly API Design

- Lokale Logs-read-only-API konkret designt.
- Bestehende Agent-/Runtime-/OBS-/Media-read-only Struktur geprueft.
- `/api/remote/agent/status` als read-only Design-Anker erkannt.
- Geplante lokale Logs-Routen festgelegt:
  - `GET /api/remote/local/logs/status`
  - `GET /api/remote/local/logs/list`
- Antwortformat fuer Status/List und Log-Items festgelegt.
- Offline-/nicht-erreichbar-Verhalten definiert.
- Sicherheitsgrenzen dokumentiert.
- Doku-only.
- Keine Runtime-Aenderung.
- Kein Deploy noetig.

## 0.2.118 - Local Logs Source Plan

- Lokale Log-Quelle geplant.
- Erste sinnvolle Bereiche festgelegt.
- Bevorzugte Quelle: `127.0.0.1:8080` Dashboard/Agent.
- Read-only Schutzgrenzen dokumentiert.
- Folgeschritt fuer API-Design vorbereitet.
- Doku-only.
- Keine Runtime-Aenderung.
- Kein Deploy noetig.

## 0.2.117 - Logs Clean Selector UI Deploy Confirmed

- 0.2.116E bestaetigt.
- Logs-Hauptansicht ist bereinigt.
- Retention-/Selbstbereinigungsinfos sind aus Logs entfernt.
- Log-Quelle und Log-Bereich bleiben als Auswahl sichtbar.
- Lokal / Stream-PC ist vorbereitet, aber noch ohne API.
- Doku-only.
- Keine Runtime-Aenderung.
- Kein Deploy noetig.

## 0.2.116E - Logs Clean Selector UI

- Logs-Hauptansicht bereinigt.
