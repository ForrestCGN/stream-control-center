# CAN-44.21.R – Shoutout API-/Routen-Inventur

Stand: 2026-06-04  
Quelle: GitHub/dev, `backend/modules/clip_shoutout.js`, `htdocs/dashboard/modules/shoutout.js`, `auto_shoutout.js`, `shoutout_texts.js` als bekannte Dashboard-Nutzung.  
Scope: Dokumentation / Inventur. Keine Code-, Backend-, DB- oder Runtime-Änderung.

---

## 1. Grundregel für den weiteren V2-Aufbau

Ab jetzt gilt verbindlich:

```text
Keine neue V2-Funktion nutzt eine Route, bevor sie in dieser Inventur oder im Backend eindeutig belegt ist.
```

Wenn eine Route nicht sicher belegt ist, wird sie nicht verwendet. Dann wird zuerst GitHub/dev geprüft oder Forrest liefert die aktuelle Datei.

---

## 2. API-Basis

Backend-Modul:

```text
backend/modules/clip_shoutout.js
MODULE_NAME = clip_shoutout
MODULE_VERSION = 0.2.25
API_PREFIX = /api/clip-shoutout
```

Legacy-/Kompatibilitätsroute:

```text
/api/clip/shoutout
```

---

## 3. Gesicherte Routen aus Backend

Diese Routen sind im Backend in `clip_shoutout.js` registriert oder in `/status.routes` aufgeführt.

| Methode | Route | Zweck | V2-Tab |
|---|---|---|---|
| GET | `/api/clip-shoutout/status` | Gesamtstatus, Config-Snapshot, Queue-Kurzstatus, Inbound-Stats, AutoShoutout-Status, Streamstatus, Routenliste | Übersicht, Einstellungen read-only, AutoShoutout-Kurzstatus |
| GET | `/api/clip-shoutout/clips` | Clips für Zielkanal listen/suchen | Shoutout / Diagnose später |
| GET | `/api/clip-shoutout/run` | Shoutout ausführen/aufnehmen über Query | Shoutout |
| POST | `/api/clip-shoutout/run` | Shoutout ausführen/aufnehmen über Body | Shoutout |
| GET | `/api/clip/shoutout` | Legacy-Ausführung | nicht bevorzugt, nur Kompatibilität |
| POST | `/api/clip/shoutout` | Legacy-Ausführung | nicht bevorzugt, nur Kompatibilität |
| GET | `/api/clip-shoutout/settings` | komplette Shoutout-Config read-only | Einstellungen |
| POST | `/api/clip-shoutout/settings` | Shoutout-Config speichern | später Einstellungen editierbar, nur mit Rechte/Audit-Plan |
| GET | `/api/clip-shoutout/texts` | neuer Texteditor für `shoutout.*` Keys + Migration | Texte |
| POST | `/api/clip-shoutout/texts` | Textvarianten speichern | Texte |
| GET | `/api/clip-shoutout/texts/migration` | Migrationsplan Legacy-Texte → `shoutout.*` | Texte / Diagnose bei Bedarf |
| GET | `/api/clip-shoutout/queue` | Display-Queue und Official-Queue Status | Queues, Übersicht Kurzstatus |
| GET | `/api/clip-shoutout/timeline` | Verlauf ausgehender Shoutouts | Auswertung |
| GET | `/api/clip-shoutout/stats` | Statistiken nach Ziel/Auslöser/Paarung | Auswertung |
| GET | `/api/clip-shoutout/stats/user` | User-/Filter-Statistik, gleiche Basis wie stats | Auswertung |
| GET | `/api/clip-shoutout/inbound` | eingehende/ausgehende Twitch-Shoutout-Events | Auswertung |
| GET | `/api/clip-shoutout/inbound/stats` | Inbound-/Outbound-Shoutout-Statistik | Auswertung, Übersicht Kurzstatus |
| POST | `/api/clip-shoutout/inbound/debug` | Debug-Event für inbound/outgoing Shoutout | Diagnose / Test, nicht normaler Mod-Bereich |
| GET | `/api/clip-shoutout/production-check` | Shoutout-Produktionscheck | Shoutout-Diagnose |
| GET | `/api/clip-shoutout/live-test` | Live-Test-Entscheidung/Testplan | Shoutout-Diagnose |
| GET | `/api/clip-shoutout/decision-prep` | Alias/Alternative für Live-Test-Entscheidung | Shoutout-Diagnose |
| GET | `/api/clip-shoutout/official/auth-status` | Twitch User-Token/Scopes prüfen | Shoutout-Diagnose |
| GET | `/api/clip-shoutout/scene-gate` | Start-Szene-/Scene-Gate-Status | AutoShoutout Kurzstatus, Diagnose |
| GET | `/api/clip-shoutout/auto` | AutoShoutout Gesamtstatus inkl. Config, Streamer, Events, Activity, Texte | AutoShoutout, Einstellungen, Texte; V2 muss die Daten fachlich trennen |
| GET | `/api/clip-shoutout/auto/settings` | AutoShoutout-Settings read-only | Einstellungen |
| POST | `/api/clip-shoutout/auto/settings` | AutoShoutout-Settings speichern | später Einstellungen editierbar |
| GET | `/api/clip-shoutout/auto/texts` | Legacy AutoShoutout-Texteditor `auto.*` | Texte, Legacy/Fallback |
| POST | `/api/clip-shoutout/auto/texts` | Legacy AutoShoutout-Texte speichern | Texte, Legacy/Fallback |
| GET | `/api/clip-shoutout/auto/streamers` | konfigurierte AutoShoutout-Streamer | AutoShoutout |
| POST | `/api/clip-shoutout/auto/streamers` | AutoShoutout-Streamer speichern | AutoShoutout |
| POST | `/api/clip-shoutout/auto/streamers/remove` | AutoShoutout-Streamer deaktivieren/entfernen | AutoShoutout |
| POST | `/api/clip-shoutout/auto/test-chat` | AutoShoutout per Test-Chat simulieren/ausführen | AutoShoutout Test / Diagnose |
| POST | `/api/clip-shoutout/auto/clear-target` | AutoShoutout-Zieldaten/Queues für Ziel bereinigen | AutoShoutout Admin-/Power-Aktion |
| POST | `/api/clip-shoutout/auto/reset-day` | AutoShoutout-Tag/Queues/Events zurücksetzen | AutoShoutout Admin-/Power-Aktion |
| POST | `/api/clip-shoutout/display-queue/remove` | Display-/Overlay-Queue-Eintrag entfernen | Queues |
| POST | `/api/clip-shoutout/display-queue/retry` | Display-/Overlay-Queue-Eintrag erneut versuchen | Queues |
| POST | `/api/clip-shoutout/queue/remove` | Official-Queue-Eintrag entfernen | Queues |
| POST | `/api/clip-shoutout/queue/retry` | Official-Queue-Eintrag erneut versuchen | Queues |
| GET | `/api/stream-status/status` | zentraler Streamstatus | Übersicht, Shoutout-Kurzstatus, Diagnose nur kurz |

---

## 4. Wichtige Korrektur gegenüber dem fehlerhaften V2-Step

Diese Routen wurden im fehlerhaften Versuch falsch bzw. ungesichert angenommen:

```text
/api/clip-shoutout/auto/status      FALSCH / nicht vorhanden
/api/clip-shoutout/auto/test        FALSCH / nicht vorhanden
/api/clip-shoutout/queue/remove     existiert, aber nur Official-Queue
/api/clip-shoutout/queue/retry      existiert, aber nur Official-Queue
```

Korrekt ist:

```text
AutoShoutout Status:       GET  /api/clip-shoutout/auto
AutoShoutout Test:         POST /api/clip-shoutout/auto/test-chat
Display Queue remove:      POST /api/clip-shoutout/display-queue/remove
Display Queue retry:       POST /api/clip-shoutout/display-queue/retry
Official Queue remove:     POST /api/clip-shoutout/queue/remove
Official Queue retry:      POST /api/clip-shoutout/queue/retry
```

---

## 5. Tab-Zuordnung für V2

### Übersicht

Erlaubte Datenquellen:

```text
GET /api/clip-shoutout/status
GET /api/stream-status/status
GET /api/clip-shoutout/stats?limit=...
GET /api/clip-shoutout/inbound/stats?limit=...
GET /api/clip-shoutout/timeline?limit=5
```

Nur Kurzstatus, keine Detailtabellen.

---

### Shoutout

Erlaubte Datenquellen/Aktionen:

```text
GET  /api/clip-shoutout/status
GET  /api/stream-status/status
POST /api/clip-shoutout/run
```

Optional später:

```text
GET /api/clip-shoutout/clips
```

Nicht hier:

```text
AutoShoutout-Config
Texte
Statistik
Diagnose-Details
```

---

### AutoShoutout

Erlaubte Datenquellen/Aktionen:

```text
GET  /api/clip-shoutout/auto
GET  /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers/remove
POST /api/clip-shoutout/auto/test-chat
GET  /api/clip-shoutout/scene-gate
```

Nur Betrieb + Streamer-Verwaltung + letzte Auto-Aktivität.

Nicht hier:

```text
globale AutoShoutout-Config bearbeiten
Texte bearbeiten
Cooldowns/MinMessages/Zeitfenster bearbeiten
```

Diese gehören nach Einstellungen/Texte.

---

### Queues

Erlaubte Datenquellen/Aktionen:

```text
GET  /api/clip-shoutout/queue
POST /api/clip-shoutout/display-queue/remove
POST /api/clip-shoutout/display-queue/retry
POST /api/clip-shoutout/queue/remove
POST /api/clip-shoutout/queue/retry
```

Wichtig:

```text
display-queue/* = Overlay-/Display-Queue
queue/*         = Official-Twitch-Queue
```

---

### Texte

Erlaubte Datenquellen/Aktionen:

```text
GET  /api/clip-shoutout/texts
POST /api/clip-shoutout/texts
GET  /api/clip-shoutout/texts/migration
GET  /api/clip-shoutout/auto/texts
POST /api/clip-shoutout/auto/texts
```

Ziel:

```text
shoutout.* = neuer Zielstandard
auto.*     = Legacy/Fallback sichtbar machen, nicht verstecken
```

---

### Auswertung

Erlaubte Datenquellen:

```text
GET /api/clip-shoutout/stats
GET /api/clip-shoutout/stats/user
GET /api/clip-shoutout/timeline
GET /api/clip-shoutout/inbound
GET /api/clip-shoutout/inbound/stats
```

Keine Queue-Aktionen, keine Config.

---

### Diagnose

Erlaubte Datenquellen/Aktionen:

```text
GET  /api/clip-shoutout/production-check
GET  /api/clip-shoutout/live-test
GET  /api/clip-shoutout/decision-prep
GET  /api/clip-shoutout/official/auth-status
GET  /api/clip-shoutout/scene-gate
POST /api/clip-shoutout/inbound/debug
```

Nur Shoutout-Diagnose. Admin-Diagnose nicht doppeln.

---

### Einstellungen

Phase 1 read-only:

```text
GET /api/clip-shoutout/settings
GET /api/clip-shoutout/auto/settings
GET /api/clip-shoutout/status
```

Phase 2 editierbar nur nach separatem Plan:

```text
POST /api/clip-shoutout/settings
POST /api/clip-shoutout/auto/settings
```

Mit Rechteprüfung, Validierung, Audit-Logging und Save-/Reload-Konzept.

---

## 6. Sicherheitsregel für kommende V2-ZIPs

Vor jedem Code-Step muss geprüft werden:

```text
Welche Route nutzt der Step?
Ist sie in dieser Inventur belegt?
Passt sie fachlich zum Tab?
Ist die Methode korrekt?
Ist der Body korrekt genug belegt?
Kann der Tab auch rendern, wenn die API Fehler liefert?
```

Wenn eine Frage nicht beantwortet ist, wird zuerst nachgeschlagen statt geraten.
