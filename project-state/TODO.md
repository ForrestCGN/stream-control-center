# TODO

Stand: RDAP1 / Remote Dashboard Agent Plan
Datum: 2026-06-22

## Remote Dashboard / Webserver-Agent

- Architekturfragen für Webserver↔Stream-PC-Agent klären.
- Entscheiden, was dauerhaft auf dem Webserver liegt.
- Entscheiden, was dauerhaft auf dem Stream-PC bleibt.
- Führende Datenquelle je Datenart planen:
  - User/Rollen/Rechte
  - Texte
  - Configs
  - Media
  - Audit
  - Runtime-Status
- HTTPS/WSS-Basis klären.
- Domain/Subdomain klären.
- Agent-Betriebsform klären:
  - bestehendes Backend-Modul
  - separater Node-Prozess
  - später evtl. Service
- Minimal-Agent-Version planen:
  - Auth
  - Heartbeat
  - Status
  - `agent.ping`
  - Ergebnisantwort
  - Audit
- Agent-Allowlist konkret finalisieren.
- Payload-Schemas für Agent-Actions planen.
- Offline-/Reconnect-Verhalten finalisieren.
- Agent-Statusanzeige fürs spätere Dashboard planen.

## Rollen / Permissions / Multi-User

- Rollenmatrix aus `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md` prüfen und finalisieren.
- Lokale Dashboard-Rollen gegen Twitch-Rollen-Mapping prüfen.
- Spezialrolle `Sound-Profi` fachlich final bestätigen.
- Entscheiden, ob `Media-Manager` als eigene Rolle gebraucht wird.
- Permission-Gruppen finalisieren.
- Modulfreigaben finalisieren.
- Schutzstufen finalisieren.
- Lock-System technisch planen:
  - Lock-Key
  - Heartbeat
  - Timeout
  - Übernahme
  - Audit
- Klären, welche Rollen Locks übernehmen dürfen.
- Klären, welche Bereiche zwingend Locks brauchen.

## Dashboard-v2 Navigation / Struktur

- Erst nach Security-/Agent-/Rollenplanung:
  - Dashboard-v2 Navigation planen.
  - Accordion-Sidebar nach Material-Admin-Pro-Verhalten planen.
  - Kategorie→Modul/Seite als maximale Sidebar-Tiefe festlegen.
  - Moduldetails innerhalb der Modulseiten planen.
  - Admin-Bereich für Texte, Einstellungen, Tests und Diagnose planen.
  - Media als zentralen Hauptbereich planen.
  - Overlays als zentralen Hauptbereich planen.
  - Multi-Language-Struktur planen.

## HypeTrain / Central Event Overlay

- Echte HypeTrain-Live-Payloads während eines echten HypeTrains prüfen.
- Prüfen, ob `central_event_overlay.html` alle relevanten HypeTrain-Felder korrekt anzeigt.
- Finale Template-/Mode-Struktur für das zentrale Event-Overlay planen.
- Später weitere Eventtypen nur nach Prüfung ihrer echten Bus-Events anbinden.
- Keine parallele HypeTrain-Overlay-Struktur bauen.
- OBS-Quelle für das zentrale Overlay erst separat planen und nicht automatisch ändern.

## HypeTrain Sounds

- Level-Up-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.
- Ende-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.

## Dashboard / Security / größere Refactors

- Dashboard-Cleanup-/Refactor-Step separat planen.
- Userverwaltung/Auth/Permissions separat planen.
- Produktive API-Routen später serverseitig auth-/permissionfähig absichern.
- Audit-Logging für produktive Dashboard-/Mod-/Admin-Aktionen weiter vorbereiten.

## Dauerhafte Schutzregeln

- Keine bestehenden Funktionen entfernen.
- Keine produktive DB löschen/ersetzen/droppen.
- Keine Patch-/Apply-/Regex-/Append-Scripte.
- Tests/Diagnose getrennt von normaler Konfiguration halten.
- Keine freien Shell-/Datei-/Prozessbefehle im Remote-Agent.
- Remote-Actions nur über Allowlist.
- Jede produktive Remote-Aktion braucht Rechteprüfung und Audit.
