# Changelog

## 0.2.29 - Media Persistent Index Cache Readonly Plan

- Doku-/Plan-Step fuer spaeteren persistenten Media-Server-Index.
- Festgelegt: Lokal bleibt Master/Wahrheit fuer echte Media-Dateien.
- Festgelegt: Webserver darf spaeter hoechstens sanitisierten Metadaten-Index speichern.
- Geplantes Metadatenmodell dokumentiert: mediaId, rootKey, kind, relativePath, name, extension, sizeBytes, modifiedAt, lastSeenAt, deleted, syncVersion, source.
- Speicheroptionen dokumentiert: vorhandene Projekt-DB/Helper bevorzugen, SQLite nur falls sauber begruendet, JSON-Cache nicht bevorzugt fuer produktiven Index.
- Offline-/Reconnect-Verhalten geplant: Server zeigt letzten bekannten Index stale/offline; Agent bringt Index bei Reconnect auf Stand.
- Snapshot-vor-Delta-Reihenfolge festgelegt.
- Upload/Edit/Delete, bidirektionaler Datei-Sync, Agent-Apply-Queue und Conflict-Handling bleiben fuer spaetere eigene Steps geparkt.
- Keine Runtime-Aenderung, keine DB-Migration, keine Datei-Inhalte, keine absoluten Pfade, keine Shell-/Prozess-Actions.

## 0.2.28 - Media Agent Slow Sync Status Polish Readonly

- Status-/UI-Polish fuer den getesteten Media-Agent-Slow-Sync.
- Online-Media-Seite beschreibt Agent-Sync, kompakte Liste, Memory-only und fehlende Server-Persistenz klarer.
- `GET /api/remote/media/status` liefert `syncInfo` mit `memoryOnly`, `serverPersistence=false`, `compactTransport` und `localIsMaster`.
- Gekuerzte Online-Liste (`truncated=true`) wird als erwartete kompakte Liste dargestellt, nicht als Fehler.
- Persistenter Server-Index wird nur als naechster separater Plan-Step vorbereitet.
- Keine Uploads, Edits, Deletes, DB-Migrationen, Datei-Inhalte, absoluten Pfade oder Shell-/Prozess-Actions.

## 0.2.27B - Media Sync Compact Frame Fix

- Hotfix fuer Deploy-Befund nach 0.2.27.
- Ursache: Media-WSS-Payload kam als 64-bit WebSocket-Frame an und wurde vom Webserver-Decoder mit `agent_payload_too_large_64bit_frame` abgelehnt.
- Lokaler Agent baut Media-Sync jetzt als kompakte Transport-Payload.
- Transport-Limits werden stufenweise reduziert: 120, 80, 40, 20 Items.
- `groups.items` werden im WSS-Transport nicht doppelt mitgeschickt; der Webserver baut Gruppen aus `items` neu auf.
- Agent sendet keine zu grosse Media-Payload mehr und soll nach Media-Sync verbunden bleiben.
- Media bleibt read-only, memory-only und nutzt weiter eigenes Protokoll `rdap-agent-media-inventory.v1`.
- Upload, Edit und Delete bleiben deaktiviert.
- Keine Datei-Inhalte, keine absoluten Pfade, keine DB-Migration, keine Shell-/Prozess-Actions.
- Standard-Arbeitsweise ergaenzt: Server-/API-Checks standardmaessig kurz ausgeben, volles JSON nur bei Diagnose.

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
