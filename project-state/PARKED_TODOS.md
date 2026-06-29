# PARKED_TODOS - zentrale Merkstelle fuer zurueckgestellte Arbeit

Stand: 2026-06-29  
Step: `RDAP_0.2.23_PARK_OBS_START_MEDIA_DOCS`

## Zweck

Diese Datei ist die zentrale Langzeit-Merkstelle fuer Punkte, die bewusst nach hinten geschoben wurden.

Regel:

- Neue geparkte Punkte hier eintragen, nicht in alten Handoff-Dateien verstecken.
- Nichts aus dieser Datei loeschen, nur weil es gerade nicht im aktuellen Step bearbeitet wird.
- Erledigte Punkte abhaken oder mit Datum in einen erledigt-Abschnitt verschieben.
- Bei Unsicherheit Quelle stehen lassen und Punkt als `zu pruefen` markieren.
- `project-state/TODO.md` bleibt kurz und aktiv; Langzeitpunkte bleiben hier.

## Quellen dieser Rekonstruktion

Rescue 1 basiert auf:

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

Rescue 2 hat zusaetzlich gezielt ausgewertet:

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

Rescue 2 hat viele alte CAN-/STEP-Install-/Deploy-Todos bewusst nicht wiederbelebt, wenn sie nachweislich reine Schritt-Reste oder bereits bestaetigte Diagnose-/Doku-Zwischenstaende waren.

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
- [ ] Zentrale Admin-Diagnose bleibt Wahrheit fuer Diagnosewerte; alte Modul-Diagnosekarten/-Extensions erst deaktivieren/entfernen, wenn zentrale Diagnose die Werte ausreichend abbildet und Sichttest positiv ist.
- [ ] Fuer weitere Module nach Todo-Referenz vorgehen: Statusroute pruefen, bestehende Statusfelder behalten, `diagnostics` ergaenzen, Admin > Diagnose bevorzugt `diagnostics` lesen lassen, alte Modul-Diagnosekarte deaktivieren, Sichttest, dokumentieren.
- [ ] Kandidaten fuer Diagnose-Standardisierung aus CAN-42.6b nachziehen: `tagebuch`, `commands`, `hug`, `message_rotator`, `overlay_monitor`, `bus_diagnostics`, `vip`, `alerts`, `sound_system`, `media`.

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
- [ ] Dashboard-Verlauf fuer zuletzt gespielte Sounds streamer-/modfreundlich ausbauen: Alerts, UserSounds, EventSound/Snippets, Fehler, uebersprungene/gestoppte Sounds, Dauer und Gap sichtbar machen.
- [ ] `GET /api/sound/recent-playback` als API-Basis fuer Verlauf/Filter nutzen und nach Status, Source, Kategorie, Sound-ID filterbar machen.

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
- [ ] Backend-Regeln fuer Text-Spiel V1 beachten: erster kompletter Loeser bekommt Punkte; danach Satz im Event erledigt/aus Rotation; keine weiteren Loeser/Zeitfenster; Teiltreffer geben keine Punkte.
- [ ] Pro Event/Satz/User/Wort spaeter speichern, ob ein Teiltreffer-Wort bereits erkannt wurde; Unique-Regel: ein Wort pro User/Satz nur einmal melden/zaehlen.
- [ ] Punktebuchung fuer geloeste Saetze ins vorhandene Punkte-Ledger integrieren.
- [ ] Chat-Auswertung ueber vorhandenes `twitch.chat.message` / Twitch Events / Communication Bus bauen, keine Streamer.bot- oder Parallel-Chatquelle.
- [ ] Textmeldungen ueber `helper_texts` / `module_text_variants` fuehren.
- [ ] Event-Text-Config im Dashboard ausbauen: mehrere Saetze, Teiltreffer-Hinweise, Cooldown, Meldeverhalten, Textvarianten.
- [ ] `stream_events` spaeter sauber am vorhandenen `communication_bus` / `helper_communication` anmelden; keinen eigenen neuen Bus bauen.
- [ ] `stream_events` Heartbeats senden und Status fuer Modul, Config, Runtime, aktives Event und Fehlerzustand publizieren.
- [ ] Runtime-Events fuer Eventstart/-ende, Sound/Text-Runden, Treffer, Punkte und Ranking ueber vorhandenen Bus publizieren.
- [ ] Dashboard-/Diagnoseanzeige fuer letzten `stream_events`-Heartbeat, Sound/Text/Chat-Bereitschaft, aktives Event und Fehler ueber Bus/Diagnose planen.

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
- [ ] Tagebuch/Todo Dashboard-Module fuer Settings/Texte ueber vorhandene Admin-Routen weiterpruefen bzw. modernisieren; JSON bleibt Seed/Fallback, Dashboard greift nur ueber Backend-APIs zu.
- [ ] Community-Bereich um Tagebuch/Todo-Ansichten pflegen/modernisieren, ohne bestehende Chat-/Discord-/Stats-/Reload-Routen zu entfernen.

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

## O. Rescue-Status / noch offene Nachsuche

Rescue 2 hat die in Rescue 1 markierten Quellen gezielt gelesen. Dabei wurden neue Langzeitpunkte uebernommen und erledigte/abgeloeste reine CAN-/STEP-Reste bewusst nicht reaktiviert.

Weiterhin moeglich, aber nicht blockierend:

- [ ] Bei konkretem Feature-Fokus alte Modul-Dokus erneut themenspezifisch durchsuchen, bevor geplant wird.
- [ ] Bei jedem neuen geparkten Punkt diese Datei direkt aktualisieren.
- [ ] Wenn Forrest sich an weitere alte Planungen erinnert, diese als neue Quelle aufnehmen und mit Datum/Quelle eintragen.

## P. OBS / Agent-WSS / Mod-Bedienflaeche - geparkt ab 0.2.23

Stand beim Parken: `0.2.22E - Local/Online OBS Status Parity read-only`.

- [ ] OBS-Modul spaeter fortsetzen, aber aktuell zugunsten Media-System pausiert.
- [ ] Vor weiterer OBS-Arbeit wieder echte OBS-/Agent-Dateien aus GitHub/dev lesen.
- [ ] Sichttest mit echten Situationen nachholen: OBS an/aus, Agent an/aus, Szenenwechsel, OBS-Neustart, Webserver-Neustart, lokal vs. online, Reload vs. ohne Reload.
- [ ] Pruefen, ob Live -> Wartet/Offline lokal und online ohne Browser-Reload sauber wirkt.
- [ ] Mod-Ansicht spaeter sprachlich vereinfachen: keine Diagnosebegriffe wie Inventory, Endpoint oder Payload fuer normale Mods.
- [ ] Keine OBS-Steuerung aktivieren, bevor ein separater Control-Step ausdruecklich freigegeben ist.
- [ ] Spaetere OBS-Aktionen nur ueber feste Action-Endpunkte mit Rechtepruefung, Allowlist und Audit.
- [ ] Keine freien OBS-Payloads wie `POST /obs/call { requestType: ... }`.
- [ ] Webserver baut weiterhin keine eigene OBS-WebSocket-Verbindung auf; OBS-Daten kommen read-only vom Stream-PC-Agent.
- [ ] Heartbeat bleibt klein/stabil, Live-State schnell/klein, Inventory-Sync separat.

