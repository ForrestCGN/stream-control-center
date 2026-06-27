# PARKED_TODOS - zentrale Merkstelle fuer zurueckgestellte Arbeit

Stand: 2026-06-27  
Step: `RDAP_TODO_RESCUE_1_SPLIT_ACTIVE_AND_PARKED_TODOS`

## Zweck

Diese Datei ist die zentrale Langzeit-Merkstelle fuer Punkte, die bewusst nach hinten geschoben wurden.

Regel:

- Neue geparkte Punkte hier eintragen, nicht in alten Handoff-Dateien verstecken.
- Nichts aus dieser Datei loeschen, nur weil es gerade nicht im aktuellen Step bearbeitet wird.
- Erledigte Punkte abhaken oder mit Datum in einen erledigt-Abschnitt verschieben.
- Bei Unsicherheit Quelle stehen lassen und Punkt als `zu pruefen` markieren.

## Quellen dieser Rekonstruktion

Diese erste Wiederherstellung basiert auf belegten alten Quellen:

```text
docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt
docs/system-inspection/STEP532_TODO_RESCUE_REPORT.md
docs/archive/docs-current-cleanup-7/TODO_EVENT_SOUND_RUNTIME.md
docs/archive/docs-current-cleanup-7/TODO_EVENT_SOUND_DASHBOARD.md
docs/archive/docs-current-cleanup-8/NEXT_TODO_STEP279.md
docs/archive/docs-current-cleanup-7/VIP_STATUS_ROUTE_TODO_CAN42_4D.md
docs/archive/docs-current-cleanup-7/TODO_STREAM_EVENTS_EVS49_38.md
project-state/TODO.md @ RDAP43 commit 16da32a84a3559d1b147030582530548079c503f
project-state/TODO.md @ RDAP_META1 commit 84586b9da1cd3eedce2da9c7190b42f744e517d1
```

Diese Liste ist eine Rescue-1-Rekonstruktion, nicht zwingend vollstaendig. Weitere alte TODO-/Handoff-Dateien duerfen spaeter in einem Rescue-2 gezielt nachgetragen werden.

---

## A. RDAP / Remote-Modboard / Admin-Users / Admin-Notes

- [ ] Admin-User/Admin-Notes weiterfuehren: Zieluser-Auswahl fuer Admin-Notizen oder kleine Admin-User-Detail-Anbindung vorbereiten.
- [ ] Vor RDAP-Admin-User-Code echte Admin-User-/Frontend-Dateien erneut pruefen.
- [ ] Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit, Lock, Backup, Confirm und Read-Back.
- [ ] Route-/Service-/Modul-Audit gegen echten GitHub/dev-Code planen: `app.js`, Mount-Pfade, Services, Status-/Diagnose-Endpunkte.
- [ ] Keine produktiven Admin-Writes ohne Backup/Rollback/Permission/Confirm/Audit/Locking bauen.
- [ ] Owner/Admin-Fallback-Reason spaeter verstaendlicher machen.

## B. Lokal/LAN / Heimnetz-Betrieb

- [ ] `RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN` spaeter fortsetzen.
- [ ] Remote-Modboard zusaetzlich lokal im Heimnetz betreiben koennen.
- [ ] ForrestCGN und EngelCGN sollen lokal im LAN arbeiten koennen.
- [ ] Lokaler Login soll ebenfalls ueber Twitch laufen.
- [ ] Erst fortsetzen, wenn das Web-Dashboard online stabil genug ist.
- [ ] Keine lokalen Secrets ins Repo.
- [ ] Lokalen Betrieb mit klaren Auth-/Rechte-/Sicherheitsgrenzen planen.

## C. Fruehe System-Inspektion / Sicherheitsbasis

- [ ] STABLE-ZIP vom kompletten aktuellen Arbeitsstand ohne Secrets erstellen, wenn wieder ein grosser lokaler Systemstand aufgenommen wird.
- [ ] Exclude-Liste verbindlich halten: `node_modules`, `secrets`, `.env`, `google_tts_service_account.json`, grosse Sounds/Videos, Archive/Backups.
- [ ] Aktive OBS-Quellenliste ergaenzen.
- [ ] Live-Routencheck per PowerShell ergaenzen.
- [ ] Node-Startlog und aktive Dashboard-/Overlay-Versionen bei groesseren Umbauten dokumentieren.
- [ ] Welche Overlays wirklich aktiv in OBS eingebunden sind, spaeter sauber erfassen.

## D. Aufraeumen ohne Funktionsaenderung

- [ ] Backup-/Alt-Dateien aus `backend/modules` in ein Archiv verschieben, nicht loeschen.
- [ ] Backup-/Alt-Dateien aus `htdocs/dashboard` in ein Archiv verschieben, nicht loeschen.
- [ ] Backup-/Alt-Dateien aus `htdocs/overlays` in ein Archiv verschieben, nicht loeschen.
- [ ] Root-`dashboard/` klaeren: produktiv nein, Arbeitskopie/Archiv ja.
- [ ] Nach jedem Verschieben Node starten und Dashboard/Overlays testen.
- [ ] Keine alten Routen loeschen, bevor Verhalten getestet und Legacy-Alias gesichert ist.

## E. API-/Route-/Response-Standards

- [ ] Offizielle API-Regel weiterfuehren: neue/aktive APIs unter `/api/*`.
- [ ] Legacy-Routen dokumentieren und behalten.
- [ ] `/api/obs/*` Aliase ergaenzen, `/obs/*` behalten.
- [ ] `/api/deathcounter/*` Aliase optional vorbereiten, bestehende v2-Routen behalten.
- [ ] Einheitliches Response-Format ueber Helper staerken: `ok`, `module`, `data`/`error`.
- [ ] Einheitliches Error-Logging und Audit-Hook definieren.
- [ ] Fireworks-Dopplung pruefen und spaeter sauber zentralisieren: erst testen, nicht blind loeschen.

## F. Dashboard / Diagnose / Modul-Standardisierung

- [ ] Dashboard-Modul-Skeleton festlegen: `state`, `renderShell`, `render`, `bindActions`, `loadAll`.
- [ ] Gemeinsame Dashboard-Helper erweitern: Toast, Errorbox, Loading, Permission-Check.
- [ ] Encoding/Mojibake in `adminconfigs.js` pruefen und korrigieren.
- [ ] Encoding/Mojibake in `sound.js` pruefen und korrigieren.
- [ ] `app.js` so vorbereiten, dass Navigation spaeter aus `/api/dashboard/controlcenter/navigation` kommen kann.
- [ ] Keine produktiven Fallback-Configs als heimliche zweite Wahrheit verwenden.
- [ ] Viele alte Test-/STEP-Skripte unter `tools/` spaeter pruefen/archivieren, nicht blind loeschen.
- [ ] Admin/Diagnose-Statusrouten weiter standardisieren; unklare Module als `unknown/statusroute fehlt` nur dann anzeigen, wenn wirklich korrekt.

## G. Overlay / EventBus / WebSocket-Standardisierung

- [ ] Gemeinsamen Overlay-Client `htdocs/overlays/overlay_client.js` vorbereiten.
- [ ] WebSocket-URL ueber `location.host` oder zentralen Helper standardisieren.
- [ ] `safeJson`, `escapeHtml`, `cacheBust`, Reconnect zentralisieren.
- [ ] Start/Pause Chat-Logik spaeter auslagern.
- [ ] Clip-Player Twitch-GQL aus Browser entfernen und Backend-Route nutzen.
- [ ] Fireworks als Legacy markieren oder sauber integrieren.
- [ ] Overlay/EventBus-Themen aus TODO-Rescue weiter pruefen: Overlay-Hello/Registrierung, Master-Overlay, Reconnect/Direct-Overlay-Regeln.

## H. Sound-System / SoundBus / EventSound

- [ ] Pause zwischen Sounds im Dashboard editierbar machen.
- [ ] Recent Playback um Filter erweitern: alle, Alerts, Channelpoints/UserSounds, EventSound, Fehler.
- [ ] Optional Detail-Modal pro Playback-Eintrag.
- [ ] Optional Persistenz von Recent Playback nach Neustart pruefen.
- [ ] Sound-System Einstellung „Pause zwischen Sounds“ mit Audit/Log bei Aenderung in Dashboard/Config/DB-Pattern bringen.
- [ ] EventSound-Konfiguration ins Dashboard bringen.
- [ ] Sound-Snippet-Auswahl aus Media-System fuer EventSound planen.
- [ ] Countdown-Sekunden, Antwortzeit, Rotation und Verhalten nach erkannter/nicht erkannter Runde konfigurierbar machen.
- [ ] EventSound/Runtime-Overlay darf Sound nicht direkt starten; Sound-System bleibt Owner fuer Playback, Queue, Gating, Pause und Ausgabe.
- [ ] Reveal-Video nach korrekter Loesung ueber vorhandenes Media-System planen.
- [ ] SoundBus/Consumer/Dashboard-Monitoring aus Rescue-Report weiter pruefen.

## I. StreamEvents / Satz-System / Runtime-Overlay

- [ ] Winner-Finale-Design vor Jubilaeum nicht mehr umbauen.
- [ ] Layout-JSON nicht versehentlich neu positionieren.
- [ ] Dashboard-CSS nie teilweise ersetzen; immer vollstaendige Datei liefern.
- [ ] Produktive SQLite niemals ersetzen/ueberschreiben.
- [ ] Aktuellen echten Stand der Satz-/Text-Konfiguration pruefen.
- [ ] Vorhandene Text-/Phrase-Datenstrukturen dokumentieren.
- [ ] Aktuelle Routen fuer Text-Runtime und Test-Chat pruefen.
- [ ] Pruefen, welche Antworten als richtig/falsch erkannt werden.
- [ ] Pruefen, ob geloeste Saetze aus der Rotation entfernt werden.
- [ ] Satz-Runden sauber im Dashboard testbar machen.
- [ ] Falsche Antwort simulieren.
- [ ] Richtige Antwort simulieren.
- [ ] Mehrere User / mehrere Antworten testen.
- [ ] Punktevergabe bei richtiger Antwort pruefen.
- [ ] Doppelte Loesung verhindern.
- [ ] Optional Followup-Solves pruefen.
- [ ] Satz-Teilspiel Abschlussstatus stabilisieren.
- [ ] Text/Satz-Status im Runtime-Overlay klarer anzeigen.
- [ ] Aktueller Satz / Hinweis / Antwortfenster pruefen.
- [ ] Abschluss Text-Teilspiel anzeigen.
- [ ] Kombination Sound + Text pruefen.
- [ ] Gesamt-Event erst fertig, wenn Sound-Teil und Text-Teil beendet sind.
- [ ] Dashboard-Testbereich fuer Satz-System erweitern.
- [ ] Ergebnis/Report streamerfreundlich anzeigen; keine technischen Rohdaten als Hauptansicht.
- [ ] Modul-Doku Text-/Satz-System aktualisieren, Testablaeufe/Routen/Grenzen dokumentieren.

## J. VIP / Statusrouten

- [ ] Saubere VIP-Diagnose-Statusroute ergaenzen: `GET /api/vip/status`.
- [ ] Wunschfelder pruefen: `ok`, `module`, `version`, `enabled`, `schemaVersion`, `activeVipCount`, `maxVipSlots`, `expiringSoon`, `lastError`, DB/Config/Text-Status.
- [ ] Solange Route fehlt, ist `Unbekannt / Statusroute fehlt` in Admin-Diagnose kein echter VIP-Fehler.

## K. Heartbeat / Communication-Bus / Modulstatus

- [ ] Einheitlichen Heartbeat-Standard fuer Kernmodule finalisieren.
- [ ] Heartbeat-Intervall fuer Kernmodule entscheiden.
- [ ] Statuswerte finalisieren.
- [ ] Speicherort fuer Heartbeats entscheiden.
- [ ] Gueltigkeit/TTL alter Heartbeats entscheiden.
- [ ] Dashboard-Anzeige fuer offline/stale/warning/error planen.
- [ ] Pilot: `communication_bus.js` Registry/Storage vorbereiten.
- [ ] Pilot: `/api/communication/status` Heartbeats anzeigen.
- [ ] Pilot-Module: `sound_system.js`, `alert_system.js`, `obs.js`.

## L. Modulweise Modernisierung

- [ ] Sound-System Dashboard + Backend sauber angleichen.
- [ ] OBS `/api`-Aliase + Dashboard-Anpassung planen.
- [ ] Hug Dashboard spaeter von readonly zu bearbeitbar erweitern.
- [ ] Message-Rotator Dashboard-Modul planen.
- [ ] Clips Historie/Discord-Post/DB vollstaendig machen.
- [ ] Deathcounter optional im Dashboard sichtbar machen; JSON vorerst behalten.
- [ ] Alerts erst nach Stabilisierung in Teilmodule splitten.
- [ ] Allgemeines Upload-System fuer Sound- und Video-Dateien bauen, nicht nur SoundAlerts-spezifisch; spaeter fuer VIP, Alerts, Sound-System und andere Module nutzbar machen.
- [ ] Loeschen in Medien-/Sound-Verwaltung spaeter nur mit Sicherheitsabfrage.

## M. Sicherheit / Rechte / Audit

- [ ] Backend-Rechtepruefung je schreibender Route.
- [ ] Dashboard-Buttons anhand Permissions deaktivieren/verstecken.
- [ ] Audit-Logging fuer Config-Aenderungen, Sound-Aktionen, OBS-Schaltungen, Alert-Tests.
- [ ] Retention aus `dashboard_logging.json` nutzen.
- [ ] Sensible Config-Werte maskieren.
- [ ] Dashboard darf bei Google-TTS-Credentials nur Status anzeigen, niemals Inhalt.
- [ ] Gefaehrliche Routen wie Config-Saves, OBS-Steuerung, Sound-Steuerung, Alert-Uploads mit Rechte/Audit versehen.

## N. Doku-/Repo-Hygiene

- [ ] `docs/current/` schlank halten; historische Handoffs und alte Cleanup-/Step-Dokus archivieren.
- [ ] Neue Feature-Doku bevorzugt in bestehende Current-/Domaenen-Doku integrieren.
- [ ] `project-state/TODO.md` bleibt kurz und aktiv; Langzeitpunkte bleiben hier in `PARKED_TODOS.md`.
- [ ] Bei jedem erledigten Step pruefen, ob Punkte aus `PARKED_TODOS.md` erledigt/teilweise erledigt wurden.
- [ ] `_handoff`-Reports bewusst committen oder lokal loeschen, nicht untracked liegen lassen.

## O. Noch gezielt nachzurettende Quellen fuer Rescue-2

Diese Quellen wurden in Rescue 1 erkannt, aber noch nicht vollstaendig einzeln ausgewertet:

```text
docs/archive/docs-current-cleanup-7/CAN-43.7_todo_diagnostics_review.md
docs/archive/docs-current-cleanup-7/TODO_INTEGRATION_MAPPING_CAN42_4D.md
docs/archive/docs-current-cleanup-7/TODO_DETAIL_VALUES_MAPPING_CAN42_5B.md
docs/archive/docs-current-cleanup-7/TODO_INTEGRATION_RAW_COUNTS_CAN42_5C.md
docs/archive/docs-current-cleanup-7/TODO_DIAGNOSTICS_TAB_DISABLED_CAN42_5.md
docs/archive/docs-current-cleanup-7/TODO_DIAGNOSTICS_CENTRALIZATION_CAN42_4.md
docs/archive/docs-current-cleanup-7/TODO_STATUS_DIAGNOSTICS_STANDARD_CAN42_6.md
docs/archive/docs-current-cleanup-7/ADMIN_DIAGNOSTICS_TODO_STANDARD_BLOCK_CAN42_7.md
docs/archive/docs-current-cleanup-7/DIAGNOSTICS_STANDARD_ALL_MODULES_TODO_CAN42_6B.md
docs/archive/docs-current-cleanup-7/TODO_SOUND_DASHBOARD_RECENT_PLAYBACK.md
docs/archive/docs-current-cleanup-7/CURRENT_CHAT_HANDOFF_EVS_5C_TEXT_GAME_BACKEND_TODO_DOCS.md
docs/archive/docs-current-cleanup-7/CURRENT_CHAT_HANDOFF_EVS_8B_EVENTBUS_HEARTBEAT_TODO_DOCS.md
project-state/archive/step261-project-state-cleanup/old-step-docs/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md
project-state/archive/step261-project-state-cleanup/old-step-docs/STEP201_3C_TODO_ROUTES_INTEGRATION_CHECK_2026-05-08.md
```

Rescue-2 sollte diese Dateien gezielt lesen und nur belegte, noch relevante offene Punkte nachtragen.
