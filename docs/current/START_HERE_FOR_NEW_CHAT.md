# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.13 - OBS read-only Grundlage vorbereitet`.

Verbindlich:

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI, keine separate lokale Navigation, kein eigenes lokales Design.
```

## Zugangsregel

```text
Mods:
immer https://mods.forrestcgn.de/

Forrest/Engel zuhause:
lokal am Streaming-PC/LAN ueber /dashboard-v2

Forrest/Engel unterwegs:
online ueber https://mods.forrestcgn.de/
```

## Brueckenregel

```text
Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Stream-PC-Agent.
Der Agent ist der zentrale Executor fuer Stream-PC-Aktionen.
Der Webserver ist die sichere Online-Tuer fuer Mods.
```

## Sync-Regel

```text
User/Rechte duerfen lokal und online geaendert werden.
Beide Seiten synchronisieren sich.
Sperren/Entzug von Rechten muessen online sofort wirken.
Der lokale Stand wird ueber den Agent nachgezogen, sobald verbunden.
```

## Stand 0.2.12

0.2.12 macht den Agent-Executor-Weg diagnostisch sichtbar:

```text
/api/remote/local-dashboard/agent-executor/status
/api/remote/local-dashboard/agent-executor/handshake
```

Der lokale Adapter sieht den bestehenden `remote_agent`; der Agent ist per WSS mit dem Webserver verbunden. Aktionen bleiben deaktiviert.

## Stand 0.2.13

0.2.13 bereitet OBS als erstes fachliches Modul read-only vor:

```text
/api/remote/local-dashboard/obs/status
/api/remote/local-dashboard/obs/model
```

Diese Routen lesen nur den bestehenden `remote_agent`-/Komponentenstatus und machen OBS-Erreichbarkeit/OBS-Modell sichtbar. Es werden keine OBS-WebSocket-Befehle gesendet, keine Szenen gewechselt, keine Quellen/Mutes veraendert und keine Agent-Actions ausgefuehrt.

Weiterarbeit: Erst lokale Smoke-Tests und `stepdone`. Danach `0.2.14 - OBS Inventar read-only planen/vorbereiten` oder `OBS Action-Envelope disabled`.
