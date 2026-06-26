# CHANGELOG

## 2026-06-26 - RDAP102_STREAM_PC_CONNECTION_DASHBOARD_STATUS_VISIBLE_PLAN

```text
- Plan fuer sichtbaren Stream-PC Verbindungsstatus im Remote-Modboard/Dashboard dokumentiert.
- Geplanter UI-Bereich: Verbindungen.
- Geplante Kachel: Stream-PC Verbindung.
- Geplanter Untertitel: Webserver <-> Stream-PC.
- Datenquelle: bestehende read-only Route GET /api/remote/agent/status.
- Anzeige geplant fuer verbunden/getrennt/veraltet, letzter Heartbeat, heartbeatAge, stale und Actions disabled.
- Keine Start/Stop Buttons geplant.
- Keine Agent-Actions geplant.
- Keine Secret-/Header-/Token-/Rohpayload-Anzeige geplant.
- Naechster Step: RDAP103_STREAM_PC_CONNECTION_STATUS_UI_READONLY_CARD.
- Doku-only; kein Code, keine Runtime-Aenderung, keine Nginx-Aenderung, kein Webserver-Deploy noetig.
```
