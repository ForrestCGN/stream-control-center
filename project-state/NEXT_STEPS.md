# NEXT_STEPS

Stand: RDAP119_STREAMING_PC_CONNECTION_CLIENT_MVP  
Datum: 2026-06-27

## Direkt testen

```text
RDAP119 lokal installieren.
Lokalen Node-Server neu starten.
/api/streaming-pc-connection/status prüfen.
Bei gesetzten Env-Werten STREAMING_PC_CONNECTION_ENABLED=true und Verbindungsschlüssel prüfen, ob der Webserver /api/remote/agent/status Heartbeat/connected zeigt.
```

## Danach

```text
- Streaming-PC-Verbindung dauerhaft machen: Autostart/Windows-Dienst oder bestehender Node-Start sauber einbinden.
- Online- und Lokal-Dashboard/Login parallel planen: Twitch-Login online und lokal, lokale Adresse 192.168.16.200.
- Rollen/Rechte minimal bedienbar machen, damit Mods praktisch arbeiten können.
- Erst danach erste echte erlaubte Funktion über die Verbindung anbinden.
```
