# Dashboard v2 Parallelbetrieb und Modul-Migrationsplan

Stand: 2026-06-23  
Status: DASHUI3.DOC1 / Parallelbetrieb und Modul-Migration geplant  
Projekt: ForrestCGN / stream-control-center

## Zweck

Diese Datei legt fest, wie das neue Dashboard-v2 aufgebaut und wie die bestehenden Module schrittweise migriert werden.

Dieser Step ist ein reiner Planungs-/Doku-Step.

Nicht geändert durch diesen Step:

- kein Backend-Code
- kein bestehendes lokales Dashboard
- kein Frontend-Code
- kein React-/Vite-Projekt
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service
- kein lokaler Node-Neustart

## Grundentscheidung

Das neue Dashboard-v2 wird parallel zum bestehenden Dashboard aufgebaut.

```text
bestehendes produktives Dashboard:
http://127.0.0.1:8080/dashboard

neues Dashboard-v2:
http://127.0.0.1:8080/dashboard-v2
```

Das bestehende Dashboard bleibt produktiv, bis Dashboard-v2 die jeweiligen Module vollständig und mehrfach getestet ersetzen kann.

Wichtig:

- keine Big-Bang-Migration
- kein blindes Ersetzen von `htdocs/dashboard/`
- keine bestehende Funktionalität entfernen
- alte Module bleiben erreichbar, solange v2 nicht freigegeben ist
- Dashboard-v2 bekommt eine eigene Struktur
- Migration erfolgt Modul für Modul

## Zielbild

```text
htdocs/dashboard/       = bestehendes produktives Dashboard
htdocs/dashboard-v2/    = gebauter statischer Output von Dashboard-v2
frontend/dashboard-v2/  = geplanter React-/Vite-Quellcode
```

Lokales Dashboard-v2:

```text
http://127.0.0.1:8080/dashboard-v2
```

Remote-Modboard langfristig:

```text
https://mods.forrestcgn.de
```

Remote-Modboard ist nicht direkt der Stream-PC. Produktive Aktionen laufen später nur über Webserver + Agent + Permissions + Allowlist + Audit.

## Warum Parallelbetrieb

Parallelbetrieb ist Pflicht, weil das bestehende Dashboard produktive Stream-Funktionen enthält.

Risiken bei direktem Umbau:

- produktive Stream-Aktionen könnten kaputtgehen
- Module könnten Funktionen verlieren
- alte APIs könnten unvollständig verstanden werden
- UI-/Routing-Fehler könnten den Streambetrieb blockieren
- Login-/Permission-/Lock-Themen könnten zu früh vermischt werden

Vorteile des Parallelbetriebs:

- altes Dashboard bleibt als Fallback
- v2 kann read-only getestet werden
- Module können einzeln übernommen werden
- keine Panik-Migration vor Streams
- neue Architektur kann sauber wachsen

## Reihenfolge der Dashboard-v2-Arbeit

### Phase 1: Grundgerüst

Ziel:

- AppShell
- Topbar
- Sidebar
- Routing
- PageHeader
- ModuleTabs
- CGN-Designbasis
- leere Seiten
- Beispielseite

Keine produktiven Aktionen.

### Phase 2: gemeinsame Basisdienste

Bevor echte Module migriert werden, müssen zentrale Dienste vorhanden sein.

Geplante Dienste:

```text
apiClient
wsClient
authClient
permissionClient
lockClient
agentClient
toast/notification service
modal/confirm service
form helpers
table helpers
```

Regel:

Module dürfen später nicht jeweils eigene Fetch-, WebSocket-, Toast-, Lock- oder Permission-Logik bauen.

### Phase 3: nur lesende Seiten

Erste echte Modulseiten werden read-only gebaut.

Ziel:

- Status anzeigen
- API-Erreichbarkeit prüfen
- WebSocket-/Live-Status anzeigen
- keine Speichern-/Start-/Stop-/Löschen-Aktion
- keine produktive Bearbeitung

### Phase 4: erste Schreibfunktionen

Schreibfunktionen kommen erst, wenn folgende Themen sauber vorbereitet sind:

- Permissions
- Edit-Sessions
- Locks
- resourceVersion
- Confirm-Dialoge
- Audit
- Fehleranzeige
- Rollback-/Fehlerverhalten

Schreibfunktionen werden pro Modul separat freigegeben.

### Phase 5: Modulweise Migration

Jedes Modul bekommt einen eigenen Migrations-Step.

Pro Modul gilt:

1. Bestand prüfen
2. aktuelle alte Dashboard-Funktionen auflisten
3. bestehende APIs prüfen
4. fehlende Dateien anfordern, wenn nötig
5. v2 read-only bauen
6. v2 Schreibfunktionen bauen
7. Tests
8. altes Modul weiter verfügbar lassen
9. erst nach bestätigtem Test als v2 bevorzugt markieren

## Modul-Migrationsstatus

Jedes Modul bekommt einen Status.

```text
not_started
read_only
write_beta
v2_preferred
legacy_retained
legacy_deprecated
```

Bedeutung:

### not_started

Modul existiert nur im alten Dashboard oder ist noch nicht in v2 angelegt.

### read_only

Modul ist in v2 sichtbar, zeigt aber nur Daten an.

Keine produktiven Aktionen.

### write_beta

Modul kann in v2 schreiben oder Aktionen ausführen, bleibt aber Beta.

Altes Modul bleibt als Fallback.

### v2_preferred

v2 ist bevorzugt, weil die wichtigsten Funktionen getestet sind.

Altes Modul bleibt zunächst erreichbar.

### legacy_retained

Altes Modul bleibt absichtlich erhalten, z. B. für Fallback, Vergleich oder Spezialfälle.

### legacy_deprecated

Altes Modul soll später entfernt oder versteckt werden, aber erst nach separatem Step.

## Migrationsreihenfolge

Empfohlene Reihenfolge:

```text
1. System / Diagnose
2. Remote Agent / Agent Status
3. Twitch-Events Status
4. Sound-System Status
5. Shot-Alarm
6. HypeTrain / Twitch-Events Zusatzseiten
7. Event-System
8. Loyalty Core
9. Loyalty Giveaways / Glücksrad
10. Media
11. Overlays
12. OBS
13. Commands / Kanalpunkte
14. Admin / Benutzer / Rollen / Permissions / Audit
```

Warum diese Reihenfolge:

- Statusseiten sind risikoarm.
- Agent-Status ist wichtig für Remote-Modboard, aber zuerst ungefährlich.
- Sound/Twitch/Shot/Event/Loyalty sind produktiv wichtig und müssen kontrolliert migriert werden.
- Media, OBS, Commands und Kanalpunkte sind riskanter.
- Admin/Rechte/Audit müssen sauber geplant sein und dürfen nicht hektisch entstehen.

## Login-Reihenfolge

Login wird nicht als erstes hart in das lokale Dashboard-v2 eingebaut.

Geplante Reihenfolge:

```text
Phase A: lokales Dashboard-v2 ohne echten Login, aber mit vorbereiteter Auth-Struktur
Phase B: lokaler Dev-/Owner-Kontext
Phase C: Webserver-Login für Remote-Modboard
Phase D: Permission-System aktiv
Phase E: produktive Agent-Aktionen nur mit Permission + Lock + Audit
```

Wichtig:

- keine Secrets ins Frontend
- Frontend entscheidet keine echten Rechte
- Backend prüft Login/Rollen/Permissions
- Agent prüft lokal zusätzlich Allowlist und Payload
- lokale Dev-/Owner-Annahme ist nur Übergang, keine Security-Grenze

## URLs und Routing

Geplante lokale Routen:

```text
/dashboard-v2/
 /live/overview
 /live/remote-agent
 /community-events/stream-events
 /community-events/shot-alarm
 /loyalty/core
 /loyalty/giveaways
 /media/library
 /overlays/layouts
 /actions/commands
 /admin/users
 /admin/locks
 /admin/audit
```

Sidebar-Regel:

```text
Hauptkategorie -> Modul
```

Keine dritte Sidebar-Ebene.

Tabs und Detailseiten liegen innerhalb der Modulseite.

## Modul-Tabs

Beispiel Shot-Alarm:

```text
Übersicht
Logs
Statistik
Texte
Einstellungen
Tests/Diagnose
```

Regel:

Tests/Diagnose dürfen nicht dauerhaft in normale Config-Oberflächen gemischt werden.

## Read-only-first-Regel

Jedes produktive Modul startet in Dashboard-v2 zuerst lesend.

Erlaubt in read-only:

- Status anzeigen
- letzte Events anzeigen
- Logs anzeigen
- Statistik anzeigen
- Config anzeigen
- Textvarianten anzeigen
- Agent-Online/Offline anzeigen

Nicht erlaubt in read-only:

- speichern
- löschen
- starten
- stoppen
- Medien ändern
- OBS schalten
- Commands ändern
- Kanalpunkte ändern
- produktive Agent-Requests ausführen

## Schreibfunktionen-Regel

Schreibfunktionen brauchen mindestens:

- passende Permission
- Modulfreigabe
- gültige Edit-Session, wenn Ressource bearbeitet wird
- aktiven Lock, wenn Ressource schreibgeschützt ist
- resourceVersion-Prüfung
- Confirm bei kritischen Aktionen
- Audit-Eintrag
- saubere Fehlermeldung
- kein stilles Überschreiben

## Legacy-Regel

Das alte Dashboard wird nicht entfernt, solange:

- nicht alle Funktionen des Moduls bekannt sind
- nicht alle v2-Funktionen getestet sind
- kein Fallback mehr nötig ist
- Forrest nicht ausdrücklich zugestimmt hat

Alte Dashboard-Dateien werden nicht nebenbei umgebaut.

## Kein Parallelchaos

Nicht erlaubt:

- gleiche Funktion in zwei neuen v2-Varianten bauen
- neue Helper parallel zu vorhandenen Systemen erfinden
- Modultexte erneut außerhalb bestehender Text-/Message-Systeme bauen
- Media-Upload-Inseln bauen
- direkte Twitch-/OBS-/Sound-Sonderwege bauen
- Security im Frontend vortäuschen

Vorhandene Systeme bleiben führend:

```text
communication_bus
twitch_events
sound_system
media system
helper_messages / helper_texts
SQLite produktiv lokal
```

## Remote-Modboard-Abgrenzung

Remote-Modboard ist langfristig die öffentliche Oberfläche.

Für Remote gilt:

- Browser spricht Webserver
- Webserver entscheidet Login/Rechte
- Webserver spricht Agent per WSS
- Agent spricht lokal erlaubte Schnittstellen
- Agent führt keine freien Shell-/Datei-/Prozessaktionen aus
- keine Offline-Queue
- wenn Agent offline ist: Lesen möglich, produktive Aktionen gesperrt

## DASHUI4-Vorschlag

Nächster möglicher Step nach dieser Doku:

```text
DASHUI4 / Minimaler React-Vite-Prototyp
```

Umfang DASHUI4:

- `frontend/dashboard-v2/` Grundgerüst
- React + Vite
- AppShell
- Sidebar
- Topbar
- PageHeader
- ModuleTabs
- Beispielseite `Remote Agent`
- Beispielseite `Übersicht`
- zentrale Styles/Tokens
- keine produktive Modulmigration
- keine Schreibfunktion
- kein Login-Zwang
- kein altes Dashboard ändern
- Build-Ziel für spätere Ausgabe nach `htdocs/dashboard-v2/` vorbereiten

## Offene Punkte

- genaue Package-Versionen für React/Vite prüfen
- Build-Script festlegen
- Entwicklungsstart lokal dokumentieren
- späteren statischen Build nach `htdocs/dashboard-v2/` planen
- Webserver-Deploy für `mods.forrestcgn.de` separat planen
- Remote-Login separat planen
- Permissions/Locks erst nach Backend/Webserver-Planung umsetzen
- Module vor Migration einzeln prüfen

## StepDone-Vorschlag

```powershell
.\stepdone.cmd "DASHUI3 Parallelbetrieb und Modul-Migrationsplan dokumentiert: altes Dashboard bleibt produktiv, dashboard-v2 entsteht parallel, Migration Modul für Modul, read-only-first, Login später gestuft, Schreibfunktionen erst mit Permission/Lock/Audit; kein Code und kein Node-Neustart nötig"
```
