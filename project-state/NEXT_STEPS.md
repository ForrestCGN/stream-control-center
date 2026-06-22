# NEXT STEPS

Stand: RDAP1 + DASHUI1 / Dashboard-v2 Designrichtung dokumentiert
Datum: 2026-06-22

## Nächster sinnvoller Schritt

RDAP2 / offene Architekturfragen für Webserver-Agent klären

Ziel:

- klären, was dauerhaft auf dem Webserver liegt
- klären, was dauerhaft auf dem Stream-PC bleibt
- klären, welche Datenbank für welche Daten führend ist
- klären, wie Media, Texte und Configs später synchronisiert werden
- klären, ob der Agent Teil des bestehenden Backends oder ein separater Prozess wird
- klären, welche Webserver-Technik/Domain/HTTPS-WSS-Basis genutzt wird

## Danach sinnvoll

RDAP3 / Minimal-Agent-Konzept planen

Ziel:

- kleinste Agent-Version planen
- nur Verbindung, Anmeldung, Heartbeat, Status und `agent.ping`
- Request/Result/Audit-Struktur finalisieren
- Allowlist-Schema planen
- keine Sound-/OBS-/Media-Aktionen vor dem Minimaltest

## Danach

RDAP4 / Permission- und Lock-Datenmodell planen

Ziel:

- Rollen-/Permission-Modell technisch planen
- Modulfreigaben planen
- Locks mit Heartbeat/Timeout planen
- Audit-Events für Locks planen
- noch keine DB-Migration ohne explizites `go`

## Dashboard-v2 Frontend nach RDAP-Grundlagen

DASHUI2 / Frontend-Tech-Entscheidung konkretisieren

Ziel:

- `React + Vite` als bevorzugte Richtung prüfen und final bestätigen
- Build-/Deploy-Ziel nach `htdocs/dashboard-v2/` planen
- Modul-Registry und Navigation-Registry planen
- CGN-Komponentensystem planen
- API-/WebSocket-/Lock-Clients sauber trennen
- keinen Creative-Tim-/Vision-UI-Code übernehmen

DASHUI3 / Minimaler React-Prototyp erst nach Freigabe

Ziel:

- AppShell mit Topbar/Sidebar/PageHeader/ModuleTabs
- eine Beispielseite, z. B. Remote Agent oder Übersicht
- keine produktive Modulmigration
- kein alter Dashboard-Umbau ohne separaten Step

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

- kein produktiver Dashboard-v2-Code ohne Agent-/Security-Plan
- kein Permission-Code ohne Datenmodell-Plan
- keine DB-Migration ohne separaten Step
- keine OBS-Quellen automatisch ändern
- keine produktive Remote-Agent-Verbindung ohne Minimaltest
- keine Sound-/Media-/Config-Remote-Actions als ersten Agent-Test
- kein Creative-Tim-/Vision-UI-Template direkt einbauen
- keine alte Dashboard-Struktur blind umbauen
