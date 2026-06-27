# REMOTE_MODBOARD_ROADMAP_CURRENT

Stand: RDAP119_STREAMING_PC_CONNECTION_CLIENT_MVP  
Datum: 2026-06-27

## Zuletzt erledigt

```text
RDAP117C: Admin-Modul-/Navigation-Vertrag korrigiert.
RDAP118: Admin-/System-Navigation sichtbar poliert und zentral normalisiert.
RDAP119: Lokaler Streaming-PC-Verbindungsclient-MVP in backend/modules/remote_agent.js integriert.
```

## Naechster sinnvoller Step

```text
Streaming-PC-Verbindung live stabil testen:
- lokale Env setzen
- lokalen Node-Server neu starten
- lokalen Status pruefen
- Webserver /api/remote/agent/status pruefen
- Heartbeat/connected bestaetigen
```

## Danach

```text
- Online-/Lokal-Twitch-Login sauber zusammenfuehren.
- Lokale Adresse fuer Dashboard: http://192.168.16.200:8080/dashboard.
- Twitch Redirect lokal: http://192.168.16.200:8080/api/remote/auth/callback bzw. spaeter passende lokale Remote-Auth-Route.
- Rollen/Rechte minimal praktisch bedienbar machen.
- Erstes echtes Modul nur ueber feste Allowlist-Aktion anbinden.
- Keine Admin-Notizen weiterbauen, solange Forrest das nicht ausdruecklich verlangt.
```
