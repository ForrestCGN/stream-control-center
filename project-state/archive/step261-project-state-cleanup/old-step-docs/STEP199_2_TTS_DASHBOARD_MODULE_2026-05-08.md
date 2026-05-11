# STEP199.2 - TTS Dashboard-Modul

Stand: 2026-05-08

## Ziel

Das TTS-System bekommt ein erstes Dashboard-Modul im bestehenden Control-Center.

## Geaenderte Dateien

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/modules/tts.js`
- `htdocs/dashboard/modules/tts.css`

## Architekturentscheidung

`htdocs/dashboard/app.js` wurde bewusst nicht geaendert.

Stattdessen registriert sich `tts.js` beim Laden selbst in:

```text
window.CGN.modules.tts
window.CGN.moduleCatalog.tts
```

Dadurch wird der bereits vorhandene TTS-Eintrag im Bereich `System` aktiviert, ohne die zentrale Dashboard-Datei anzufassen.

## Neue Dashboard-Funktionen

Das TTS-Dashboard nutzt ausschliesslich Backend-APIs und liest weder Dateien noch SQLite direkt.

Genutzte APIs:

```text
GET  /api/tts/status
GET  /api/tts/config
GET  /api/tts/voices
GET  /api/tts/routes
GET  /api/tts/admin/settings
GET  /api/tts/stats
GET  /api/tts/events
POST /api/tts/say
POST /api/tts/reload
POST /api/tts/on
POST /api/tts/off
POST /api/tts/stop
POST /api/tts/clear
POST /api/tts/admin/settings
```

## Dashboard-Bereiche

- Uebersicht
- Stimmen
- Rollen
- Sound-System
- Settings
- Test
- Events
- Routen

## Wichtige Regeln

- Keine TTS-Funktionalitaet entfernt.
- Keine Backend-Logik geaendert.
- Keine direkte DB-/Datei-Lesezugriffe aus dem Dashboard.
- DB gewinnt gegen JSON-Fallback.
- JSON bleibt Seed/Fallback/technische Boot-Konfig.
- Sensible technische Werte bleiben aus den bereinigten Config-/Voice-Routen raus.

## Hinweise

Der Settings-Tab zeigt DB-Settings allgemein an und erlaubt Speichern einzelner Settings. JSON-Felder muessen weiterhin vorsichtig bearbeitet werden.

TTS-Texte sind noch nicht in das globale DB-basierte Textvarianten-System migriert. Das bleibt ein Folgepunkt.

## Tests nach Deploy

Nach Pull/Deploy im Browser pruefen:

```text
/dashboard
System > TTS
```

Dann pruefen:

1. TTS-Kachel ist aktiv.
2. TTS-Modul laedt ohne JavaScript-Fehler.
3. Uebersicht zeigt Status, Queue, Nutzung und Sources.
4. Stimmen-Tab zeigt Google/Piper ohne Google-Keyfile-Pfad.
5. Rollen-Tab zeigt Rollenrechte.
6. Sound-System-Tab zeigt ChatTTS/AlertTTS-Ausgabe.
7. Settings-Tab zeigt `tts_settings`.
8. Test-Tab kann Test-TTS an `/api/tts/say` senden.
9. Routen-Tab zeigt STEP199.1-Routen.

## Naechster sinnvoller Schritt

`STEP199.3`:

- Browser-Test durchfuehren.
- Falls Layout/UX passt: gezieltes Polishing.
- TTS-Texte spaeter in globales DB-Textvarianten-System migrieren.
- Settings-Editor spaeter von Raw-JSON auf fachliche Formulare aufteilen.
