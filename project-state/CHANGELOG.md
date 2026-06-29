# Changelog

## 0.2.33 - UI i18n Media Labels Fix Plan

- Media-Sprachkeys in `remote-modboard/backend/public/assets/languages/de.js` ergaenzt.
- Media-Sprachkeys in `remote-modboard/backend/public/assets/languages/en.js` ergaenzt.
- Media-Modulregistrierung in `remote-modboard/backend/public/assets/modules/media/library.js` nutzt jetzt zentrale `labelKey`, `descriptionKey`, `titleKey` und `tabKey` mit Fallbacks.
- Lokaler UI-Pfad `htdocs/dashboard-v2/assets/modules/media/library.js` gleichgezogen.
- Sichtbarer Befund behoben: rohe Keys `module.media.label`, `page.media.library.title`, `page.media.library.label` sollten nicht mehr angezeigt werden.
- Keine Backend-Routen-Aenderung, keine DB-Migration, keine Agent-Aenderung, keine Media-Persistenz, keine Upload-/Edit-/Delete-Actions, keine neue Runtime-Datei.

## 0.2.32 - Media Persistent Index Foundation Plan No Code

- Doku-/Plan-Step fuer spaetere Persistent-Index-Foundation.
- Festgelegt: Persistent Index braucht wahrscheinlich eine DB-Tabelle und damit einen eigenen bestaetigten Migration-/Foundation-Step.
- Festgelegt: Keine DB-Migration heimlich in einem kleinen Code-Step.
- Festgelegt: `agent-runtime.service.js` bleibt spaeterer Server-Eingang fuer Agent-Media-Snapshot, Sanitization und Memory.
- Festgelegt: `media-readonly.routes.js` bleibt spaetere API-Ausgabe; Live-Memory zuerst, persistenter Index nur Fallback/Stale.
- Festgelegt: `backend/core/database.js` ist bevorzugte DB-Schicht, falls im Server-Kontext sauber nutzbar.
- Festgelegt: Neue Runtime-Dateien bleiben verboten, ausser Forrest genehmigt sie ausdruecklich.
- Aufgenommen: UI-/i18n-Befund aus Screenshot mit sichtbaren Keys `module.media.label`, `page.media.library.title`, `page.media.library.label`.
- Festgelegt: UI/i18n-Fix ist separater kleiner Step und wird nicht mit Persistent-Index-Code vermischt.
- Keine Runtime-Aenderung, keine DB-Migration, keine neue Runtime-Datei, keine Datei-Inhalte, keine absoluten Pfade, keine Shell-/Prozess-Actions.

## 0.2.31 - Media 8080/3010 File Module Inventory No Code

- Doku-/Inventory-Step nach 0.2.30 Projektbremse.
- Echte 8080-/3010-relevante Dateien aus GitHub/dev gelesen und eingeordnet.
- Dokumentiert: lokale 8080-Wahrheit fuer `/api/remote/media/status` liegt in `backend/modules/local_remote_modboard_adapter.js`.
- Dokumentiert: lokaler Agent/Media-WSS-Sender liegt in `backend/modules/remote_agent.js`.
- Dokumentiert: zentrale DB-Schicht liegt in `backend/core/database.js`, Low-Level-SQLite in `backend/modules/sqlite_core.js`.
- Dokumentiert: Server-3010-WSS-Runtime und Media-Memory liegen in `remote-modboard/backend/src/services/agent-runtime.service.js`.
- Dokumentiert: Server-3010-Route `/api/remote/media/status` liegt in `remote-modboard/backend/src/routes/media-readonly.routes.js`.
- Markiert: Media Roots/Extensions/Limits/Sanitization existieren aktuell mehrfach und koennen driften.
- Festgelegt: Neue Runtime-Dateien bleiben verboten, ausser Forrest genehmigt sie ausdruecklich.
- Festgelegt: Nach 0.2.31 kommt zuerst ein Plan fuer Persistent Index, kein direkter Code-Step.
- Keine Runtime-Aenderung, keine DB-Migration, keine neue Runtime-Datei, keine Datei-Inhalte, keine absoluten Pfade, keine Shell-/Prozess-Actions.

## 0.2.30 - Stop and Inventory No Code

- Doku-/Stop-Step nach fehlerhaftem und zurueckgesetztem 0.2.30-Versuch.
- Festgelegt: Vor weiterem Persistent-Index-Code muss zuerst eine echte 8080-/3010-Datei-/Modulkarte erstellt werden.
- Festgelegt: Neue Runtime-Dateien sind fuer den naechsten Code-Step verboten, ausser Forrest genehmigt sie ausdruecklich nach konkreter Begruendung.
- Festgelegt: Lokale Checks bleiben strikt gegen 8080; 3010 nur fuer Webserver-/RDAP-Checks nach GitHub/dev + Deploy.
- Dokumentiert: 8080 lokale Verantwortung liegt insbesondere bei `backend/modules/local_remote_modboard_adapter.js`, `backend/modules/remote_agent.js`, `backend/core/database.js` und `backend/modules/sqlite_core.js`.
- Dokumentiert: 3010 Server-/RDAP-Verantwortung liegt insbesondere bei `remote-modboard/backend/src/routes/media-readonly.routes.js`, `remote-modboard/backend/src/services/agent-runtime.service.js`, `remote-modboard/backend/src/app.js` und `remote-modboard/backend/server.js`.
- Keine Runtime-Aenderung, keine DB-Migration, keine neue Runtime-Datei, keine Datei-Inhalte, keine absoluten Pfade, keine Shell-/Prozess-Actions.

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
