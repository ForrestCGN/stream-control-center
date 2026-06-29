# Changelog

## 0.2.34 - Media Persistent Index Migration Foundation Readonly

- DB-Migration/Foundation fuer spaeteren persistenten Media-Index eingefuehrt.
- Tabelle `remote_media_index` wird ueber bestehende DB-Schicht `backend/core/database.js` und `ensureSchema` vorbereitet.
- `/api/remote/media/status` meldet `persistentIndex` mit Tabelle, Schema-Version, Daten-Write-Status und Fallback-Status.
- Memory bleibt online zuerst; lokaler Modus bleibt Datei-Wahrheit.
- Agent-Media-Sync schreibt in diesem Step noch keine Media-Daten in die DB.
- DB-Fallback-Lesen bleibt deaktiviert.
- Keine Uploads, Edits, Deletes, Agent-Actions, Datei-Inhalte, absoluten Pfade oder Shell-/Prozess-Actions.
- Keine neue Runtime-Datei erstellt.

## 0.2.33 - UI i18n Media Labels Fix Plan

- Fehlende Media-Sprachkeys in `de.js` und `en.js` ergaenzt.
- Media-Modulregistrierung nutzt zentrale label/title/description/tab Keys mit Fallbacks.
- Beide UI-Pfade angepasst: `remote-modboard` public assets und `htdocs/dashboard-v2`.
- Keine Backend-Routen, keine DB-Migration, keine Agent-Aenderung.

## 0.2.32 - Media Persistent Index Foundation Plan No Code

- Doku-/Plan-Step fuer spaetere Persistent-Index-Foundation.
- Festgelegt: Persistent Index braucht wahrscheinlich eine DB-Tabelle und damit einen eigenen bestaetigten Migration-/Foundation-Step.
- Festgelegt: Keine DB-Migration heimlich in einem kleinen Code-Step.
- Aufgenommen: UI-/i18n-Befund aus Screenshot mit sichtbaren Keys `module.media.label`, `page.media.library.title`, `page.media.library.label`.
- Keine Runtime-Aenderung, keine DB-Migration, keine neue Runtime-Datei, keine Datei-Inhalte, keine absoluten Pfade, keine Shell-/Prozess-Actions.
