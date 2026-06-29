# Changelog

## 0.2.27 - Media Agent Slow Sync Readonly

- Media-Agent-WSS-Slow-Sync read-only vorbereitet.
- Eigenes Media-Protokoll `rdap-agent-media-inventory.v1` ergaenzt.
- Webserver-Agent-Runtime haelt Media-Inventar memory-only.
- Online `GET /api/remote/media/status` liest Agent-Media-Memory-Cache, sobald Daten vorliegen.
- Lokaler Agent scannt Media-Roots read-only und sendet sanitisiertes Inventar.
- Lokaler Agent bietet `GET /api/remote-agent/media/inventory/status`.
- Webserver bietet `GET /api/remote/agent/media/inventory/status`.
- OBS-Inventar-Protokoll bleibt getrennt; Media nutzt nicht das OBS-Protokoll.
- Upload, Edit und Delete bleiben deaktiviert.
- Keine Datei-Inhalte, keine absoluten Pfade, keine DB-Migration, keine Shell-/Prozess-Actions.
- Standard-Arbeitsweise ergaenzt: bei abgeschnittenem GitHub/dev-Kontext zuerst Source-Sammel-Script und Source-ZIP, danach Install-ZIP.

## 0.2.26 - Runtime Profile / Module / Permission Standard Docs

- Doku-only Step.
- Harte Architekturregel festgeschrieben: Eine UI, zwei Runtime-Profile.
- Remote-Modboard UI bleibt einzige UI-Wahrheit.
- Lokales `dashboard-v2` bleibt dieselbe UI mit `runtimeMode=local`.
- Online-Modboard bleibt dieselbe UI mit `runtimeMode=online`.
- Fachliche Modulgrenzen festgeschrieben: Sync/Agent/Cache sind Infrastruktur, keine Navigationsmodule.
- Regel festgeschrieben: gleiche Funktionen bleiben im gleichen fachlichen Modul.
- Datenklassen dokumentiert: `realtimePush`, `pullOnDemand`, `slowSync`.
- Rechte-/User-/Rollen-Regel festgeschrieben: jede Funktion muss Permission-/Rollenbezug haben.
- UI ist nie Sicherheitsgrenze; Backend-Enforcement bleibt Pflicht.
- Installationsziel fuer andere Streamer dokumentiert: lokal zuerst, Cloud optional, Agent verbindet sich ausgehend, keine Router-Portfreigabe.
- Naechster technischer Step vorbereitet: `RDAP_0.2.27_MEDIA_AGENT_SLOW_SYNC_READONLY`.
- Keine Codeaenderung, kein Deploy noetig.

## 0.2.25 - Media Local Inventory Readonly

- Lokales Media-Inventar read-only vorbereitet.
- Lokale Roots: `htdocs/assets/sounds`, `htdocs/assets/videos`, `htdocs/assets/images`.
- Scan-Limit vorbereitet: Default 500, Hard-Limit 2000, Max-Tiefe 5.
- API meldet `truncated/hasMore/nextCursor`, damit spaeter Paging ohne Breaking Change ergaenzt werden kann.
- UI zeigt lokale Medienliste mit Filter nach Bereich/Typ.
- Online bleibt korrekt pending bis Agent-WSS-Sync.
- Keine Uploads, keine Edits, keine Deletes, keine DB-Migration, keine Agent-Actions.

## 0.2.24 - Media Readonly Foundation

- Media-System als neuer Modboard-Bereich vorbereitet.
- Neue read-only Statusroute `GET /api/remote/media/status`.
- Remote-Modboard und lokales `dashboard-v2` bekommen dieselbe Media-Grundseite.
- Lokal/Online-Hinweise vorbereitet: online keine Fake-Dateien, lokales Inventar folgt separat.
- Upload, Bearbeiten und Loeschen bleiben deaktiviert.
- Keine DB-Migration, keine Agent-Actions, keine produktiven Writes.

## 0.2.23 - Park OBS / Start Media Docs

- Doku-only: OBS-Ausbau bei `0.2.22E` bewusst geparkt.
- Offene OBS-Sichttests und spaetere Mod-UX-Korrektur in `project-state/PARKED_TODOS.md` aufgenommen.
- Aktiven Fokus auf Media-System im Remote-Modboard umgestellt.
- Naechster Schritt: echte Media-/Sound-/Dashboard-Dateien aus GitHub/dev lesen und ersten kleinen read-only Media-Modboard-Step planen.
- Keine Codeaenderung, keine OBS-Steuerung, keine Agent-Actions, keine Writes, keine DB-Migration.

## 0.2.22E - Local/Online Status Parity read-only

- Lokale OBS-Seite nutzt lokalen Live-Endpunkt zuerst.
- Online-OBS-Seite nutzt Webserver-Live-Endpunkt zuerst.
- Gleiche Live/Offline/Wartet-Logik fuer lokal und online vorbereitet.
- Stand wirkt fast gut, muss aber spaeter mit echten Situationen getestet werden.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.22D - OBS Live Disconnect Refresh read-only

- OBS-Seite setzt Live-Anzeige ohne Browser-Reload zurueck, wenn Agent/Live-State offline oder stale ist.
- Von offline zu live und von live zu wartend wird im normalen Refresh-Loop aktualisiert.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.22C - Local OBS Inventory Endpoint read-only

- Lokaler Endpoint `/api/remote-agent/obs/inventory/status` liefert den zuletzt gesendeten Inventory-Sync mit echten Listen.
- UI nutzt lokal/online direkt die Inventory-Endpunkte, bevor sie auf alte Statusdaten zurueckfaellt.
- Lokales Inventory bestaetigt: 19 Szenen, 48 Quellen, 35 Audioquellen.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.22B - OBS Inventory Sync Receiver Fix read-only

- Webserver-Receiver verarbeitet mehrere WebSocket-Frames pro TCP-Chunk.
- Online Inventory bestaetigt: 19 Szenen, 48 Quellen, 35 Audioquellen.

## 0.2.22 - OBS Inventory Sync read-only

- Inventory-Sync als separater read-only Datenkanal vorbereitet.
- Szenen/Quellen/Audio nicht im Heartbeat und nicht im schnellen Live-State.
- Keine OBS-Steuerung.

## 0.2.21 - OBS Allowlist Rights Model read-only

- OBS-Allowlist-/Rechte-Modell read-only vorbereitet.
- Keine OBS-Actions.

## 0.2.20C - Agent OBS Live-State Scene Mapping read-only

- Scene-Mapping im Live-State korrigiert.
- Online-Live-Szene bestaetigt.
