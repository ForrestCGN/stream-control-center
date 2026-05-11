# STEP198 – Globaler Modul-/DB-/Dashboard-Standard

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Doku-/Planungs-STEP  
Status: vorbereitet

## Ziel

Alle größeren Systeme im stream-control-center sollen künftig einheitlich aufgebaut werden:

- gleiche Basis-API-Endpunkte je Modul
- DB als primäre Quelle für dashboardfähige Einstellungen
- JSON nur noch als Seed/Fallback/technische Boot-Konfiguration
- Secrets ausschließlich über `.env`/Secret-Dateien
- Dashboard greift nie direkt auf Dateien oder SQLite zu, sondern immer über Backend-APIs
- Installer/Setup muss DB-Seeding aus JSON/Defaults berücksichtigen
- bestehende Funktionalität darf nicht entfernt werden

Dieser STEP ist bewusst ein Planungs-/Doku-STEP ohne Codeänderung.

---

## Neuer verbindlicher Grundsatz

### Quellen-Priorität

Für normale Modulkonfiguration gilt künftig:

```text
ENV / Secrets > DB > JSON > Code-Default
```

Für Secrets gilt:

```text
ENV / Secret-Dateien only
```

Secrets dürfen nicht in Status-/Settings-APIs ausgegeben werden.

---

## DB statt JSON

### In die DB gehören künftig

Alles, was dashboardfähig, benutzeränderbar oder laufzeitrelevant ist:

- Modul-Settings
- Aktiv/Inaktiv-Schalter
- Prioritäten
- Lautstärken
- Zielausgaben
- Overlay-/Sound-Verhalten
- Regeln und Staffelungen
- Display-/Design-Profile
- Textvarianten
- Chat-Textblöcke
- Zuordnungen zwischen Regeln, Sounds, Bildern und Profilen
- Benutzer/Rollen/Rechte
- Audit-/Action-Logs
- Events/History/Stats, soweit sinnvoll
- Queue-/Runtime-State, wenn persistierbar gewünscht

### In JSON bleiben nur noch

Nur technische Boot-/Fallback-/Seed-Werte:

- Basis-Pfade
- Upload-Verzeichnisse
- erlaubte MIME-/Dateitypen
- maximale Dateigrößen als Installer-Default
- WebSocket-OP-Namen
- Default-Seed-Werte für Erstinstallation
- Fallbackwerte, falls DB-Setting fehlt
- technische Optionen, die vor DB-Initialisierung gebraucht werden

JSON ist Fallback, nicht Hauptquelle.

---

## Installer-/Setup-Regel

Ein späterer Installer muss diesen Ablauf unterstützen:

1. Projektdateien installieren.
2. technische JSON-Defaults/Seed-Dateien lesen.
3. DB initialisieren/migrieren.
4. Default-Settings in DB seeden, wenn sie dort fehlen.
5. Danach gewinnt DB gegenüber JSON.
6. Secrets separat in `.env`/Secret-Dateien einrichten.
7. Status-/Settings-APIs geben keine Secrets aus.

Wichtig: JSON-Dateien dürfen nach der Erstinstallation nicht die aktive DB-Konfiguration überschreiben.

---

## Standard-API je Modul

Jedes größere Modul soll langfristig möglichst folgende Basis-Endpunkte anbieten:

```text
GET  /api/<modul>/status
GET  /api/<modul>/config
GET  /api/<modul>/settings
POST /api/<modul>/settings
POST /api/<modul>/reload
GET  /api/<modul>/integration-check
```

Optional je nach Modul:

```text
GET  /api/<modul>/routes
GET  /api/<modul>/admin/...
POST /api/<modul>/test/...
GET  /api/<modul>/history
GET  /api/<modul>/stats
GET  /api/<modul>/texts
POST /api/<modul>/texts
```

### Bedeutungen

#### `/status`

Nur aktueller Betriebszustand:

- enabled/ready
- current/queue
- Fehlerstatus
- Zähler
- wichtige, ungefährliche Statusdaten

Keine Secrets.

#### `/config`

Aktive, gemergte Runtime-Konfiguration:

- DB-Werte müssen JSON-Fallback überschreiben.
- technische Felder dürfen sichtbar sein, sofern ungefährlich.
- keine Secrets.

#### `/settings`

Dashboard-editierbare Einstellungen:

- aus DB
- updatefähig über API
- validiert
- keine Secrets
- mit Info über Quelle, z. B. `source: database`

#### `/reload`

Lädt Config/Settings neu:

- JSON-Fallback neu lesen
- DB-Settings neu anwenden
- Runtime-State nicht unnötig zerstören
- keine Queues/History löschen, außer ausdrücklich nötig

#### `/integration-check`

Prüft typische Integrationsfehler:

- DB/JSON-Mismatch
- fehlende Dateien
- fehlende Routen
- fehlende Assets
- nicht erreichbare Abhängigkeiten
- Overlay-/WebSocket-Client-Status
- Sound-/TTS-/Alert-Verknüpfungen

---

## Dashboard-Standard

Das Dashboard muss passend zum neuen Modulstandard arbeiten.

### Grundregeln

- Dashboard greift nicht direkt auf SQLite oder Dateien zu.
- Dashboard nutzt nur Backend-APIs.
- Dashboard-Settings werden über `/api/<modul>/settings` gelesen/geschrieben.
- Dashboard soll klar zwischen Status, Settings, Regeln, Texten, Assets und Historie trennen.
- Keine technischen Massenboxen, wenn sie für Benutzer nicht hilfreich sind.
- UI schlank, praktisch und konsistent.
- Keine Funktionalität entfernen.

### Dashboard-Seiten je Modul

Ein größeres Modul sollte langfristig so aufgebaut sein:

```text
Übersicht / Status
Einstellungen
Regeln / Zuordnungen
Texte / Varianten
Assets / Medien
Historie / Events
Integration / Diagnose
```

Nicht jedes Modul braucht alle Seiten sofort. Aber die Struktur soll wiedererkennbar sein.

### UX-Regeln

- Erst Überblick, dann Details.
- Aktiv/Inaktiv statt Ja/Nein.
- Sortierbare Tabellen, wo Listen größer werden.
- Letzte/relevante Einträge oben.
- Fehler klar anzeigen, aber nicht mit Techniktext überladen.
- Tooltips für erklärungsbedürftige Felder.
- Speichern/Reload/Reset getrennt und eindeutig.
- Keine direkte Bearbeitung sensibler Werte im Klartext.
- Keine Secrets anzeigen.

### Dashboard und DB

Dashboard-editierbare Werte müssen in DB landen, nicht dauerhaft in JSON.

Wenn JSON-Defaults vorhanden sind, soll das Dashboard erkennen können:

```text
source: database
source: json_fallback
source: default
```

Damit sieht man, ob ein Wert bereits wirklich in der DB gespeichert ist.

---

## Aktueller Anlass / Befund

Beim Alert-System wurde in STEP196 festgestellt:

```text
DB-Setting:
livealert.soundSystemEnabled = true

aktive Runtime-Config vorher:
liveAlert.soundSystemEnabled = false
```

Ursache war eine unvollständige DB-Settings-Übernahme in die aktive Config. Das wurde mit STEP196 funktional behoben.

Zusätzlich wurde bei STEP197.1 festgestellt, dass der falsche Overlay-Pfad `htdocs/overlay/...` statt `htdocs/overlays/...` erzeugt wurde. Das wurde korrigiert.

---

## Aktueller TTS-Befund

TTS ist aktiv und frei, aber noch nicht standardisiert:

```text
GET /api/tts/status  vorhanden
GET /api/tts/config  404
GET /api/tts/voices  404
GET /api/tts/routes  404
```

Damit ist TTS ein guter nächster Kandidat für Standardisierung.

---

## Priorität für kommende Modul-Angleichungen

### Bereits teilweise/weitgehend modernisiert

- Alerts/Sound-System-Integration: funktional grün nach STEP196/STEP197.1
- SoundAlerts: DB-Tabellen vorhanden, helper_settings/Core-DB bereits teilweise genutzt
- Hug/Rehug: Texte dashboardfähig
- Tagebuch/Todo: Textvarianten/DB-Settings weit fortgeschritten

### Nächste sinnvolle Kandidaten

1. TTS-System
2. Sound-System Settings/Config-Dashboard
3. Alert-System Settings-Dashboard sauber nach DB-Quelle darstellen
4. Dashboard-Controlcenter/Admin-Configs nach gleichem Schema prüfen
5. Message-Rotator
6. VIP-Sound-Overlay
7. Twitch-Chat-Overlay
8. Discord/Sound-Output-Konfiguration

---

## Verbotene Vorgehensweisen

- keine Secrets in DB/JSON/API-Ausgaben anzeigen
- keine SQLite-Datei überschreiben
- keine JSON-Dateien blind leeren
- keine bestehenden Funktionen entfernen
- keine neuen Parallelstrukturen bauen
- keine direkten Dashboard-Datei-/SQLite-Zugriffe
- keine PowerShell-Textpatches für JS/CSS/HTML/MD
- keine historischen Snapshots überschreiben

---

## Definition „fertig“ für zukünftige Modul-Standardisierung

Ein Modul gilt erst dann als sauber standardisiert, wenn:

- `/status` vorhanden ist
- `/config` aktive gemergte Config zeigt
- `/settings` DB-basierte dashboardfähige Werte zeigt
- DB-Werte JSON-Fallback überschreiben
- `/reload` DB+JSON sauber neu lädt
- `/integration-check` die wichtigsten Mismatches erkennt
- Dashboard die Settings über API bearbeitet
- keine Secrets sichtbar sind
- Doku aktualisiert wurde
- Live-Test erfolgreich war
