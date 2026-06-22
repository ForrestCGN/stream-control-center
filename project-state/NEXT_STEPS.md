# NEXT STEPS

Stand: RDAP1 / Remote Dashboard Agent Plan
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

- kleinste Agent-Version ohne produktive gefährliche Aktionen planen
- nur Verbindung, Auth, Heartbeat, Status und `agent.ping`
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

## Parallel fachlich offen

HypeTrain / Central Event Overlay:

- Echte HypeTrain-Live-Payloads während eines echten HypeTrains prüfen.
- Prüfen, ob `central_event_overlay.html` alle relevanten HypeTrain-Felder korrekt anzeigt.
- Finale Template-/Mode-Struktur für das zentrale Event-Overlay planen.
- Level-Up-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.
- Ende-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.

## Nicht als nächstes nebenbei machen

- kein Dashboard-Design
- kein Bootstrap-Umbau
- kein Dashboard-v2-Code ohne Agent-/Security-Plan
- kein Auth-/Permission-Code ohne Datenmodell-Plan
- keine DB-Migration ohne separaten Step
- keine OBS-Quellen automatisch ändern
- keine produktive Remote-Agent-Verbindung ohne Minimaltest
- keine Sound-/Media-/Config-Remote-Actions als ersten Agent-Test
