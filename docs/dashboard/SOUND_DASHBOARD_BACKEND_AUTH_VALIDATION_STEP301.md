# STEP301 – Sound Dashboard Monitoring Backend/Auth Validation

Stand: 2026-05-24

## Ziel

Den in STEP299 ergänzten Dashboard-Tab `SoundBus Monitoring` gegen die vorhandene Dashboard-, Auth- und Control-Center-Struktur prüfen.

Prüfpunkte:

- Passt das Modul in die vorhandene Dashboard-Struktur?
- Werden bestehende Dashboard-Konventionen genutzt?
- Sind neue Backend-Routen nötig oder hinzugekommen?
- Bleibt der Monitor grundsätzlich lesend?
- Gibt es Auth-/Controlcenter-Auffälligkeiten?

## Geprüfte Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
backend/modules/dashboard_auth.js
backend/modules/dashboard_controlcenter.js
backend/modules/sound_system.js
backend/modules/communication_bus.js
```

## Ergebnis

STEP301 ist als Validierung abgeschlossen.

Bestätigt:

- Das Dashboard bindet `htdocs/dashboard/modules/sound.css` und `htdocs/dashboard/modules/sound.js` bereits regulär ein.
- Der Sound-System-Panel-Container `#soundModule` ist im Dashboard vorhanden.
- `app.js` kennt `sound_system` als vorhandenes Modul.
- `sound.js` nutzt die bestehende Dashboard-API-Hilfe `window.CGN.api`.
- Der Bus-Monitor nutzt vorhandene Sound-Endpunkte, vor allem `/api/sound/status`.
- Es wurden keine neuen Backend-Routen für den Bus-Monitor benötigt.
- `dashboard_auth.js` musste nicht geändert werden.
- `dashboard_controlcenter.js` musste nicht geändert werden.
- `sound_system.js` musste nicht geändert werden.
- `communication_bus.js` musste nicht geändert werden.

## Auffälligkeit

Im Bus-Monitor gibt es den Button `Status neu laden`.

Aktuell ist dieser Button über die bestehende Sound-Modul-Action `reload` verdrahtet. Diese bestehende Action ruft nicht nur eine reine Statusabfrage auf, sondern zuerst:

```text
POST /api/sound/reload
```

und lädt danach den Status neu.

Das ist im bestehenden Sound-System-Modul historisch vorhanden und nicht neu durch Backend/Auth entstanden. Für den Anspruch `rein lesender Bus-Monitor` ist es aber semantisch nicht ideal.

## Bewertung der Auffälligkeit

Kein akuter Backend-/Auth-Fehler:

- Es wurde keine neue ungeschützte Admin-Route eingeführt.
- Der Button nutzt eine bereits vorhandene Sound-System-Route.
- Es gibt keinen Hinweis auf Queue-/Bundle-/SoundBus-Probleme.

Aber für einen wirklich rein lesenden Bus-Monitor sollte der Button künftig nicht `POST /api/sound/reload` auslösen, sondern nur den Status aus dem Frontend neu laden.

## Empfohlener Folgefix

STEP302 – Sound Dashboard Bus-Monitor Readonly Refresh Fix

Ziel:

- Neue Frontend-Action z. B. `reload-status-only` oder `refresh-status`.
- Im Bus-Monitor den Button `Status neu laden` auf diese reine Frontend-Action umstellen.
- Diese Action ruft nur `loadAll(true)` oder minimal `/api/sound/status` auf.
- Kein `POST /api/sound/reload` aus dem Bus-Monitor.
- Bestehende globale Sound-System-Buttons `Neu laden`, `Stop`, `Skip`, `Queue leeren` bleiben unverändert.

## Nicht geändert in STEP301

- keine Codeänderung
- keine Backend-Logik
- keine Auth-/Role-Logik
- keine Sound-Queue
- keine Bundle-/`activeBundleLock`-Logik
- keine SoundBus-Event-Logik
- keine Alert-/Discord-/TTS-/VIP-Module
- keine DB-Migration

## Ergebnisstatus

STEP301 bestanden mit Hinweis.

Der Bus-Monitor ist strukturell korrekt integriert. Für die strikte Readonly-Semantik ist STEP302 als kleiner Frontend-Fix empfohlen.
