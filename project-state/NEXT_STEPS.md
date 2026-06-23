# NEXT STEPS

Stand: RDAP4.DOC1 / Permission- und Lock-Modell dokumentiert  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

DASHUI2 / Frontend-Tech-Entscheidung konkretisieren

Ziel:

- `React + Vite` als bevorzugte Richtung final prüfen und bestätigen
- Build-/Deploy-Ziel nach `htdocs/dashboard-v2/` planen
- lokale Dashboard-v2-Nutzung auf Stream-PC planen
- Remote-Modboard-Nutzung unter `mods.forrestcgn.de` planen
- AppShell mit Topbar/Sidebar/PageHeader/ModuleTabs planen
- Modul-Registry planen
- Navigation-Registry planen
- CGN-Komponentensystem planen
- API-/WebSocket-/Lock-Clients sauber trennen
- Frontend-Sicherheitsgrenzen festhalten
- keinen Creative-Tim-/Vision-UI-Code übernehmen
- noch keinen produktiven Dashboard-v2-Code ohne separaten Umsetzungsstep

Wichtig:

- RDAP3 hat nur den Minimal-Agent geplant, keinen Agent-Code erstellt.
- RDAP4 hat nur Permission-/Lock-/Edit-Session-Modell geplant, keine DB und keinen Code geändert.
- Ohne separate Freigabe kein React-Prototyp und kein produktiver Umbau.

## Danach sinnvoll

DASHUI3 / Minimaler React-Prototyp erst nach Freigabe

Ziel:

- AppShell mit Topbar/Sidebar/PageHeader/ModuleTabs
- eine Beispielseite, z. B. Remote Agent oder Übersicht
- lokale statische Auslieferung planen/testen
- kein altes Dashboard umbauen
- keine produktive Modulmigration
- keine produktiven Actions
- keine Secrets im Frontend

RDAP5 / Agent-Webserver-Minimaltest planen

Ziel:

- Webserver-WSS-Endpunkt planen
- Agent-Dateistruktur planen
- Secret-Speicherort finalisieren
- Agent-Registry auf Webserver planen
- `agent.ping` und `agent.status.request` als erste Testaktionen planen
- noch keine produktiven Actions

## Bestätigter RDAP4-Planungsstand

Siehe:

- `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`

Geplant / festgelegt:

- Backend entscheidet, Frontend zeigt nur an.
- Rollen sind Permission-Bündel.
- Konkrete Prüfung passiert über Permissions.
- Twitch-Rollen sind nicht führend.
- Produktive Bearbeitung kritischer Ressourcen braucht Edit-Session und Lock.
- `resourceKey`, `resourceType` und `resourceVersion` sind geplant.
- `resourceVersion` schützt gegen stille Überschreibung.
- Lock-Heartbeat und Timeout sind geplant.
- Lock-Übernahme braucht Permission und Audit.
- Agent-Verlust während Bearbeitung sperrt produktives Speichern.
- Keine Offline-Queue.
- Lokales Dashboard und Remote-Modboard sollen denselben Lock-/Edit-Session-Mechanismus verwenden.

## Bestätigter RDAP3-Planungsstand

Siehe:

- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`

Geplant / festgelegt:

- Agent ist ein separater Node-Prozess.
- Agent verbindet sich aktiv per WSS zum Webserver.
- Remote-Ziel: `https://mods.forrestcgn.de`.
- Webserver-Node-App später intern, bevorzugt `127.0.0.1:3000`.
- Öffentlich nur HTTPS/WSS, kein öffentlicher Node-Port.
- Lokales Backend bleibt `http://127.0.0.1:8080`.
- Auth mit `agentId` + Secret.
- Secret nicht ins Repo, nicht ins Frontend, nicht ins Audit.
- Minimal erlaubte Actions:
  - `agent.ping`
  - `agent.status.request`
- Request-/Result-/Audit-Struktur geplant.
- Offline-/Reconnect-Verhalten geplant.
- Keine Offline-Queue.

## Bestätigte Webserver-Basis

Siehe:

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`

Festgelegt / geprüft:

- Subdomain: `mods.forrestcgn.de`
- Webserver: Hetzner/KVM-VM, Debian 13 `trixie`
- nginx aktiv und gültig
- Let's Encrypt-Zertifikat enthält `mods.forrestcgn.de`
- HTTPS über IPv4 und IPv6 liefert `HTTP/2 200`
- apt-Repository-Stand ist wieder sauber
- Rspamd-Key wurde repariert
- Node.js `v20.19.2`, npm `9.2.0`, npx `9.2.0`
- Node-App später intern, bevorzugt `127.0.0.1:3000`
- öffentlich nur HTTPS/WSS, kein öffentlicher Node-Port

## Bestätigte Designbasis für spätere Frontend-Arbeit

Siehe:

- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`

Wichtigster Design-Teststand:

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`

Festgelegte UI-Regeln:

- Sidebar = Hauptkategorie → Modul
- keine dritte Sidebar-Ebene
- Modul-Navi/Tabs innerhalb der Modulseite
- Topbar zeigt `Hauptbereich` und `Modul • aktiver Tab`
- normale Seiten bleiben streamer-/modfreundlich
- Admin enthält Technik, tiefe Config, Diagnose, Rechte, Audit
- Module müssen leicht erweiterbar und umstrukturierbar bleiben

## Parallel fachlich offen

HypeTrain / Central Event Overlay:

- Echte HypeTrain-Live-Payloads während eines echten HypeTrains prüfen.
- Prüfen, ob `central_event_overlay.html` alle relevanten HypeTrain-Felder korrekt anzeigt.
- Finale Template-/Mode-Struktur für das zentrale Event-Overlay planen.
- Level-Up-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.
- Ende-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.

## Nicht als nächstes nebenbei machen

- kein produktiver Dashboard-v2-Code ohne separaten Umsetzungsstep
- kein Agent-Code ohne separaten Umsetzungsstep
- kein Permission-Code ohne RDAP4-Plan bewusst in einen Umsetzungsstep zu überführen
- keine DB-Migration ohne separaten Step
- keine OBS-Quellen automatisch ändern
- keine produktive Remote-Agent-Verbindung ohne Minimaltest
- keine Sound-/Media-/Config-Remote-Actions als ersten Agent-Test
- kein Creative-Tim-/Vision-UI-Template direkt einbauen
- keine alte Dashboard-Struktur blind umbauen
