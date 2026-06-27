# CAN-44.21.12 – Shoutout Dashboard V2 Status / Phase-Abschluss

Stand: 2026-06-04  
Projekt: `ForrestCGN/stream-control-center`  
Branch/Ziel: `dev` / `D:\Git\stream-control-center`  
Live-Ziel: `D:\Streaming\stramAssets`

Dieses Dokument fasst den aktuellen Shoutout-V2-Stand nach CAN-44.21.11 zusammen.

---

## 1. Aktueller stabiler Arbeitsstand

Aktueller letzter Code-Stand:

```text
CAN-44.21.11_einstellungen_v2_readonly.zip
```

Aktuelle V2-Dateien:

```text
htdocs/dashboard/modules/shoutout_v2.js
htdocs/dashboard/modules/shoutout_v2.css
```

V2 läuft parallel zum alten Shoutout-System. Die alten Dateien bleiben bewusst vorhanden:

```text
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/shoutout_texts.js
```

Backend, DB, Runtime und alte Shoutout-Dateien wurden in den V2-UI-Schritten nicht verändert.

---

## 2. Wichtige Arbeitsregel ab CAN-44.21.R

Seit der Routen-Inventur gilt verbindlich:

```text
Keine neue V2-Funktion nutzt eine Route, bevor sie im Backend/GitHub oder in der Inventur eindeutig belegt ist.
```

Fehler aus früheren Steps wurden korrigiert:

```text
FALSCH:
GET  /api/clip-shoutout/auto/status
POST /api/clip-shoutout/auto/test

RICHTIG:
GET  /api/clip-shoutout/auto
POST /api/clip-shoutout/auto/test-chat
```

Queue-Korrektur:

```text
Display-/Overlay-Queue:
POST /api/clip-shoutout/display-queue/remove
POST /api/clip-shoutout/display-queue/retry

Official-Twitch-Queue:
POST /api/clip-shoutout/queue/remove
POST /api/clip-shoutout/queue/retry
```

---

## 3. Umgesetzte Tabs

### Übersicht

Status/Kurzüberblick ohne doppelte Detailtabellen.

Datenquellen:

```text
GET /api/clip-shoutout/status
GET /api/stream-status/status
GET /api/clip-shoutout/stats
GET /api/clip-shoutout/timeline
GET /api/clip-shoutout/inbound/stats
```

---

### Shoutout

Manuelles Auslösen eines Shoutouts.

Umgesetzt:

```text
Twitch-Kanal eingeben
Erzwingen/Force
Aufnehmen
kompakter Status rechts
keine technische Statusquelle im Bedienbereich
Render-Sicherung
```

Daten/Aktion:

```text
POST /api/clip-shoutout/run
GET  /api/clip-shoutout/status
GET  /api/stream-status/status
```

---

### AutoShoutout

Umgesetzt:

```text
Betriebsstatus
Live-Regel
Start-Szene / Scene-Gate Kurzstatus
Streamer-Verwaltung
Streamer speichern
Streamer testen
Streamer entfernen/deaktivieren
letzte AutoShoutout-Aktivität
```

Daten/Aktionen:

```text
GET  /api/clip-shoutout/auto
GET  /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers
POST /api/clip-shoutout/auto/streamers/remove
POST /api/clip-shoutout/auto/test-chat
GET  /api/clip-shoutout/scene-gate
```

Nicht im AutoShoutout-Tab:

```text
globale Cooldowns bearbeiten
Mindestnachrichten bearbeiten
Zeitfenster bearbeiten
Texte bearbeiten
```

Diese gehören in Einstellungen bzw. Texte.

---

### Queues

Umgesetzt:

```text
Overlay-/Display-Queue
Offizielle Twitch-Queue
Statuskarten Pending/Worker
Tabellen mit Ziel, Status, Verfügbar, Fehler, Aktionen
Retry
Entfernen
```

Daten/Aktionen:

```text
GET  /api/clip-shoutout/queue
POST /api/clip-shoutout/display-queue/remove
POST /api/clip-shoutout/display-queue/retry
POST /api/clip-shoutout/queue/remove
POST /api/clip-shoutout/queue/retry
```

---

### Texte

Umgesetzt:

```text
Kategorien
Textkeys
aktive Varianten pro Textkey
Variante hinzufügen
Variante entfernen
Speichern pro Textkey
Migration/Kompatibilität als aufklappbarer Bereich
Legacy AutoShoutout sichtbar
```

Daten/Aktionen:

```text
GET  /api/clip-shoutout/texts
POST /api/clip-shoutout/texts
GET  /api/clip-shoutout/texts/migration
GET  /api/clip-shoutout/auto/texts
```

---

### Auswertung

Umgesetzt:

```text
Kennzahlen
Top Zielkanäle
Top Auslöser
häufige Paarungen
Streamtage
Verlauf
eingehende / erstellte Twitch-Shoutout-Events
Lesbarkeits-Cleanup für Streamtage
```

Daten:

```text
GET /api/clip-shoutout/stats
GET /api/clip-shoutout/stats/user
GET /api/clip-shoutout/timeline
GET /api/clip-shoutout/inbound
GET /api/clip-shoutout/inbound/stats
```

Wichtige UI-Korrektur:

```text
Streamtage zeigen jetzt ein lesbares Datum.
Interne StreamDay-ID nur noch klein/gekürzt darunter.
```

---

### Diagnose

Umgesetzt:

```text
Produktionscheck
Live-Test
Decision Prep
Twitch Auth / Scopes
Start-Szene / Scene-Gate
Inbound-/Outbound-Debug-Testevents
```

Daten/Aktionen:

```text
GET  /api/clip-shoutout/production-check
GET  /api/clip-shoutout/live-test
GET  /api/clip-shoutout/decision-prep
GET  /api/clip-shoutout/official/auth-status
GET  /api/clip-shoutout/scene-gate
POST /api/clip-shoutout/inbound/debug
```

Wichtige UI-Korrektur:

```text
"Scene-Gate aktiv" wurde getrennt in:
- Überwachung aktiv
- Start-Szene blockiert gerade
```

Damit ist klar, ob nur die Regel eingeschaltet ist oder wirklich die Start-Szene blockiert.

---

### Einstellungen

Umgesetzt:

```text
Read-only Ansicht
Allgemein
Overlay / Display-Queue
Offizieller Twitch-Shoutout
AutoShoutout
Streamtag-Sperre
Start-Szene / Streamstatus
```

Daten:

```text
GET /api/clip-shoutout/settings
GET /api/clip-shoutout/auto/settings
GET /api/clip-shoutout/status
GET /api/clip-shoutout/scene-gate
```

Wichtig:

```text
Keine Speicherfunktion.
Keine Config-Änderung.
Kein POST auf Settings im V2-UI.
```

Editierbarkeit folgt nur mit separatem Plan.

---

## 4. Bekannte offene Punkte

### 4.1 Visuelles Final-Polish

Noch offen:

```text
Abstände prüfen
Tabellenbreiten prüfen
mobile/responsive Feinschliff
CGN-Design optisch final angleichen
unwichtige technische Details weiter reduzieren
```

### 4.2 Rechte/Rollen

Geplant, noch nicht umgesetzt:

```text
Mod darf bedienen:
- Shoutout auslösen
- AutoShoutout testen/verwalten je nach Recht
- Queues retry/remove je nach Recht

Owner/Admin:
- Einstellungen editieren
- Diagnose-Testevents
- spätere Config-Speicherung
```

### 4.3 Einstellungen editierbar machen

Noch nicht umsetzen ohne separaten Plan:

```text
Validierung
Rechteprüfung
Audit-Logging
sichere Teil-Updates
Rollback/Reload-Konzept
keine Secrets anzeigen
```

### 4.4 Alte UI ablösen

Noch nicht löschen.

Späterer Plan nötig:

```text
prüfen, ob V2 alle benötigten Funktionen abdeckt
alte Module nur nach Freigabe deaktivieren/entfernen
keine Funktionalität entfernen
```

---

## 5. Nächste sinnvolle Schritte

Empfohlene Reihenfolge:

```text
1. CAN-44.21.12.x – Sichtprüfung/UX-Polish nach Screenshots
2. CAN-44.21.13 – Rollen/Rechte-Plan für Shoutout V2
3. CAN-44.21.14 – Settings editierbar planen, noch nicht bauen
4. CAN-44.21.15 – Alte Shoutout-UI Ablöseplan
5. CAN-44.21.16 – Doku/README/TODO/NEXT_STEPS aktualisieren
```

---

## 6. Testbefehle

Nach jedem V2-Code-Step:

```cmd
cd /d D:\Git\stream-control-center
node -c htdocs\dashboard\modules\shoutout_v2.js
```

Nach Entpacken im Browser:

```text
Strg + F5
```

Optional Git-Status prüfen:

```cmd
git status
```
