# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.22D - lokaler/online OBS Inventory-Sync read-only bestaetigt/vorzubereiten`.

Verbindlich: GitHub/dev ist Wahrheit. Erst echte Dateien lesen, Plan nennen, auf go warten.

## Bisher bestaetigt

```text
0.2.20C: Agent WSS, Heartbeat slim, OBS Live-Szene online.
0.2.21: OBS Allowlist-/Rechte-Modell read-only.
0.2.22B: Online Inventory-Sync empfaengt echte OBS-Listen.
0.2.22D: Lokaler Inventory-Endpunkt und UI nutzen echte OBS-Listen statt leerer Statusdaten.
```

## Datenklassen

```text
Heartbeat = klein/stabil.
Live-State = aktuelle Szene schnell.
Inventory-Sync = Szenen/Quellen/Audio separat langsam, nur read-only.
```

## Grenzen

```text
Keine OBS-Steuerung.
Keine Agent-Actions.
Keine Writes.
Keine DB-Migration.
Keine freien OBS-Payloads.
```


## 0.2.22E

Lokale und Online-OBS-Seite nutzen dieselbe Anzeige-Logik fuer Live/Offline/Wartet. Lokal wird der lokale Live-Endpunkt zuerst genutzt, online der Webserver-Endpunkt.
