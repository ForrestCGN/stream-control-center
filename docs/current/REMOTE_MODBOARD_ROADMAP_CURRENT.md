# Remote-Modboard Roadmap — ab RDAP120

## Erledigt

- RDAP119: Streaming-PC-Verbindung Client MVP geprüft.
- RDAP120: Verbindung im Dashboard sichtbar und sprachlich auf Streaming-PC statt Agent ausgerichtet.

## Nächste sinnvolle Schritte

1. RDAP121: Verbindung stabilisieren/autostart prüfen
   - lokaler Start beim Streaming-PC-Boot
   - Reconnect sichtbar prüfen
   - Verbindungsstatus nach Neustart Webserver/Streaming-PC validieren

2. RDAP122: erste sichere Modul-Anbindung planen
   - keine freie Shell
   - nur feste Allowlist-Aktion
   - Confirm/Audit/Permission erst wenn echte Aktion gebaut wird

3. Rollen/Rechte bedienbar machen
   - minimal für Forrest, EngelCGN, Mods, Sound-Profi
   - keine UI-Fantasie ohne Serverprüfung
