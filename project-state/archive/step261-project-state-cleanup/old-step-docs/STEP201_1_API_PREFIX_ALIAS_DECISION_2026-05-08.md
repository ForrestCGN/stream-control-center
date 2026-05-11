# STEP201.1 – API-Prefix-/Alias-Entscheidung

Stand: 2026-05-08  
Projekt: stream-control-center  
Typ: Analyse-/Doku-/Entscheidungs-STEP  
Status: vorbereitet

## Ziel

Dieser STEP legt fest, wie wir künftig mit alten, abweichenden oder mehrfach vorhandenen API-Prefixen umgehen.

Grundlage ist STEP201:

```text
Dashboard-/Modul-Standard-Matrix
Analyse-Datei: D:\gpt\last_api.json
```

Zielstandard für neue/standardisierte Module:

```text
GET  /api/<module>/status
GET  /api/<module>/config
GET  /api/<module>/settings
GET  /api/<module>/routes
GET  /api/<module>/integration-check
POST /api/<module>/reload
```

---

## Grundregel

Bestehende Routen bleiben erhalten.

Neue Standard-Routen werden nur als Alias ergänzt, wenn sie sicher sind.

```text
keine bestehenden Routen entfernen
keine Streamer.bot-Flows brechen
keine Dashboard-Aufrufe brechen
keine Overlay-Aufrufe brechen
keine Funktionalität entfernen
```

---

## Entscheidung

### 1. Neue Module bevorzugen Standard-Prefix

Neue Module sollen künftig direkt mit dem Standard-Prefix gebaut werden:

```text
/api/<module>
```

Beispiel:

```text
/api/sound
/api/tts
/api/alerts
/api/soundalerts
```

### 2. Alte Module dürfen Legacy-Prefixe behalten

Wenn bestehende Systeme bereits produktiv auf Legacy-Prefixe zugreifen, bleiben diese bestehen.

Beispiele:

```text
/discord/tagebuch
/api/tagebuch/entry
/api/vip-sound-overlay
/api/vip-sound
```

### 3. Standard-Aliase dürfen ergänzt werden

Wenn ein Modul keinen passenden Standard-Prefix hat, darf zusätzlich ein Alias ergänzt werden.

Beispiel VIP:

```text
bestehend:
  /api/vip-sound-overlay
  /api/vip-sound

zukünftig optional:
  /api/vip
```

Wichtig:

```text
/api/vip darf nur Alias sein.
Die alten VIP-Routen bleiben aktiv.
```

### 4. /routes und /integration-check zuerst nachziehen

Bevor komplexe Alias-Migrationen gebaut werden, sollen zuerst sichere Read-only-Endpunkte ergänzt werden:

```text
GET /api/<module>/routes
GET /api/<module>/integration-check
```

Diese sind risikoarm und helfen späteren Umbauten.

---

## Modulbezogene Entscheidung

### Sound-System

Status:

```text
Standard-Prefix vorhanden: /api/sound
/routes vorhanden
/integration-check vorhanden
```

Entscheidung:

```text
Keine Alias-Arbeit nötig.
Sound-System bleibt Referenzmodul.
```

### TTS

Status:

```text
Standard-Prefix vorhanden: /api/tts
/routes vorhanden
/integration-check vorhanden
```

Entscheidung:

```text
Keine Alias-Arbeit nötig.
TTS bleibt Referenzmodul.
```

### Alert-System

Status:

```text
Standard-Prefix vorhanden: /api/alerts
/status vorhanden
/config vorhanden
/settings vorhanden
/reload vorhanden
/integration-check vorhanden
/routes fehlt
```

Entscheidung:

```text
Kein neuer Prefix nötig.
Nur /api/alerts/routes nachziehen.
```

Priorität:

```text
hoch
```

### SoundAlerts

Status:

```text
Standard-Prefix vorhanden: /api/soundalerts
/status vorhanden
/config vorhanden
/settings vorhanden
/reload vorhanden
/routes fehlt
/integration-check fehlt
```

Entscheidung:

```text
Kein neuer Prefix nötig.
Zuerst /api/soundalerts/routes und /api/soundalerts/integration-check nachziehen.
```

Priorität:

```text
hoch
```

### VIP

Status:

```text
Standard-Prüfung unter /api/vip schlägt fehl.
Tatsächliche Prefixe:
  /api/vip-sound-overlay
  /api/vip-sound
```

Entscheidung:

```text
Alte Prefixe bleiben.
Später optional /api/vip als Alias ergänzen.
Vorher keine bestehende VIP-Route entfernen.
```

Empfohlene Alias-Zuordnung:

```text
GET  /api/vip/status            -> /api/vip-sound-overlay/status
GET  /api/vip/state             -> /api/vip-sound-overlay/state
GET  /api/vip/config            -> /api/vip-sound-overlay/config
GET  /api/vip/settings          -> /api/vip-sound-overlay/settings
GET  /api/vip/routes            -> neue VIP-Routendoku
GET  /api/vip/integration-check -> neuer VIP-Integration-Check
POST /api/vip/reload            -> nur wenn sicher/benötigt, sonst später
```

Priorität:

```text
mittel
```

Begründung:

VIP ist funktional groß und hat viele bestehende Routen. Erst Doku-/Check-Endpunkte ergänzen, dann Alias.

### Tagebuch

Status:

```text
/api/tagebuch/status vorhanden
/api/tagebuch/reload vorhanden
/config fehlt
/settings fehlt
/routes fehlt
/integration-check fehlt
```

Legacy/zusätzlich vorhanden:

```text
/discord/tagebuch
/discord/tagebuch/status
/discord/tagebuch/reset
/api/tagebuch/entry
```

Entscheidung:

```text
Bestehende Routen behalten.
Standard-Endpunkte schrittweise ergänzen.
```

Priorität:

```text
mittel
```

### Todo

Status:

Aus STEP201 separat prüfen, aber Zielregel gilt:

```text
bestehende Routen behalten
/routes und /integration-check ergänzen
/settings/config nur wenn sinnvoll
```

Priorität:

```text
mittel
```

### Messages / Message Rotator

Status:

Zielstandard teilweise abweichend.

Entscheidung:

```text
keine Prefix-Änderung ohne echte Routenprüfung
/routes und /integration-check später ergänzen
```

Priorität:

```text
mittel
```

### Hug/Rehug

Status:

Nicht aus STEP201 sicher genug bewertet.

Entscheidung:

```text
separate echte Routenprüfung nötig
keine Alias-Entscheidung ohne Analyse
```

Priorität:

```text
später
```

### OBS / Discord / Twitch / Chat Overlay

Status:

Diese Module sind teils Infrastruktur-/Bridge-Module.

Entscheidung:

```text
Nicht blind nach demselben Modulstandard umbauen.
Zuerst pro Modul klären, welche Standard-Endpunkte sinnvoll sind.
```

Priorität:

```text
niedrig bis mittel
```

---

## Alias-Regeln für Implementierung

Wenn später Aliase ergänzt werden:

### Muss-Regeln

```text
alte Route bleibt bestehen
neue Alias-Route ruft dieselbe Handler-Funktion auf
keine doppelte Logik kopieren
keine geänderten Response-Strukturen ohne Grund
keine Auth-/Security-Umgehung
keine POST-Aliase ohne Prüfung
```

### Bevorzugt zuerst GET

Sichere Reihenfolge:

```text
1. GET /routes
2. GET /integration-check
3. GET /status Alias
4. GET /config Alias
5. GET /settings Alias
6. POST /reload nur bei Bedarf
7. Schreibende Aliase erst nach Dashboard-/Streamer.bot-Prüfung
```

### Keine riskanten Sofort-Aliase

Diese Routen nicht blind aliasen:

```text
/delete
/reset
/clear
/upload
/import
/sync
/admin/*
```

Nur nach genauer Prüfung.

---

## Route-Dokumentation als Standard

Jedes Modul mit abweichenden Routen soll zuerst `/routes` bekommen.

`/routes` soll enthalten:

```text
ok
module
routes[]
notes[]
legacyPrefixes[]
standardPrefix
recommendedAliases[]
```

---

## Integration-Check als Standard

`/integration-check` soll mindestens prüfen:

```text
DB erreichbar
Config/Fallback vorhanden
Settings-Quelle
Text-Quelle
Dashboard-Datei vorhanden, falls relevant
wichtige externe Helper erreichbar
kritische Pfade vorhanden
Legacy-Prefixe vorhanden
Standard-Alias vorhanden/fehlt
```

---

## Prioritätenliste

### STEP201.2 – /routes-Endpunkte

Reihenfolge:

```text
1. alerts
2. soundalerts
3. tagebuch
4. todo
5. vip
```

### STEP201.3 – /integration-check-Endpunkte

Reihenfolge:

```text
1. soundalerts
2. tagebuch
3. todo
4. vip
5. messages/message_rotator
```

### STEP201.4 – VIP Alias-Plan

Erst planen, dann bauen:

```text
/api/vip als Alias-Schicht
alte Prefixe bleiben
nur Read-only zuerst
```

---

## Nicht Teil dieses STEPs

Dieser STEP ändert bewusst nichts an:

```text
Backend-Code
Dashboard-Code
DB-Schema
JSON-Dateien
Routen
Streamer.bot-Flows
OBS-Overlays
```

---

## Ergebnis

Die API-Prefix-Strategie ist:

```text
Standard-Prefix für neue Module
Legacy-Prefixe bleiben
Aliases nur ergänzen, nie ersetzen
Read-only zuerst
/routes und /integration-check vor komplexen Umbauten
```
