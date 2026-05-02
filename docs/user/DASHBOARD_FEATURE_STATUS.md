# Dashboard Feature Status

Stand: 2026-05-02  
Projekt: `stream-control-center`

## Zweck

Diese Datei zeigt, welche Dashboard-Bereiche bereits nutzbar sind, welche nur vorbereitet sind und welche Admin-/Technikbereiche sind.

## Status-Legende

```txt
Aktiv        = im Dashboard nutzbar und angebunden
Teilaktiv    = sichtbar/nutzbar, aber noch nicht final oder nur teilweise angebunden
Vorbereitet  = Navigation/Struktur existiert, aber noch nicht bedienbar
Admin-only   = nur für technische Konfiguration gedacht
```

## Übersicht

| Bereich | Modul | Status | Für normale Bedienung? | Hinweis |
|---|---|---|---|---|
| Live | Stream-Desk | Aktiv | Ja | Hauptseite für schnelle Stream-Steuerung |
| Live | Chat | Vorbereitet | Später | Navigation vorbereitet, noch deaktiviert |
| Live | Userinfo | Vorbereitet | Später | Noch deaktiviert |
| Live | Clips | Vorbereitet | Später | Clip-System existiert backendseitig, Dashboard noch vorbereitet |
| Control | Übersicht | Aktiv | Ja | Control-Home / Übersicht |
| Control | Alerts V2 | Aktiv | Ja | Alert-Regeln, Vorschau, Live-Test, Assets |
| Control | OBS Details | Aktiv | Ja/Technisch | OBS-Status und Details |
| Control | Overlays | Vorbereitet | Später | Noch deaktiviert |
| Control | Stream-Steuerung | Vorbereitet | Später | Noch deaktiviert |
| System | Sound-System | Aktiv | Ja | Sound, Queue, Ausgabe, Runtime-Settings |
| System | TTS | Vorbereitet | Später | Backend teilweise vorhanden, Dashboard noch deaktiviert |
| System | Bot-Systeme | Vorbereitet | Später | Noch deaktiviert |
| System | Message-Rotator | Vorbereitet | Später | Backend vorhanden, Dashboard noch deaktiviert |
| System | Automationen | Vorbereitet | Später | Noch deaktiviert |
| System | Integrationen | Vorbereitet | Später | Noch deaktiviert |
| System | Modulstatus | Vorbereitet | Später | Noch deaktiviert |
| Community | Hug-System | Vorbereitet | Später | Backend vorhanden, Dashboard noch deaktiviert |
| Community | Chat-Overlay | Vorbereitet | Später | Backend/Overlay vorhanden, Dashboard noch deaktiviert |
| Community | Deathcounter | Vorbereitet | Später | System vorhanden, Dashboard noch deaktiviert |
| Community | Challenges | Vorbereitet | Später | Backend vorhanden, Dashboard noch deaktiviert |
| Community | Tagebuch | Vorbereitet | Später | Backend vorhanden, Dashboard noch deaktiviert |
| Community | Todo | Vorbereitet | Später | Backend vorhanden, Dashboard noch deaktiviert |
| Community | Commands | Vorbereitet | Später | Noch deaktiviert |
| Admin | Configs | Teilaktiv / Admin-only | Nein | Config-Übersicht und Sound-Expertenwerte |
| Admin | Benutzer | Vorbereitet | Nein | Noch deaktiviert |
| Admin | Rollen & Rechte | Vorbereitet | Nein | Noch deaktiviert |
| Admin | Logs | Vorbereitet | Nein | Noch deaktiviert |
| Admin | Datenbank | Vorbereitet | Nein | Noch deaktiviert |
| Admin | Tokens / Secrets | Vorbereitet | Nein | Noch deaktiviert |
| Admin | Diagnose | Vorbereitet | Nein | Noch deaktiviert |

## Aktive Kernsysteme

### Alerts V2

Funktioniert aktuell für:

```txt
- Regeln
- Textvarianten
- Chat-Blöcke
- Assets
- lokale Vorschau
- Live-Test
- Alert-Handoff an Sound-System
```

Wichtig:

```txt
Lokale Vorschau = nur Browser/Rechner
Live-Test = OBS + Sound-System
```

### Sound-System

Funktioniert aktuell für:

```txt
- Sound starten
- Stop/Skip/Clear
- Queue
- Prioritäten
- Runtime Settings via SQLite
- Ausgabe über Audiogerät
- Alert-Sync
- Admin-Expertenwerte
```

Technische Expertenwerte liegen unter:

```txt
Admin → Configs → Sound-System Experten
```

### OBS Details

Funktioniert als OBS-Detailseite.

Noch zu beachten:

```txt
- normale OBS-Hauptseite soll später nur sichtbare Hauptszenen zeigen
- Detail-/Overlayseiten dürfen Hilfsszenen mit _ anzeigen
```

## Admin-only Bereiche

Admin-only sind Werte, die normale Bediener nicht im Streambetrieb ändern sollten:

```txt
- Pfade
- Helper-Pfad
- Playback Mode
- Allowed Extensions
- Base-Verzeichnisse
- technische URLs
- Tokens/Secrets
- Datenbankpfade
```

Diese gehören nach:

```txt
Admin → Configs
```

## Nächste Ausbaustufen

```txt
1. Admin-Rechte/Rollen aktivieren
2. Audit-Logging aktivieren
3. Sound-Bibliothek / Upload / Dateiverwaltung
4. Discord-Ausgabe über Sound-System
5. Weitere Community-Module als Dashboard-Seiten aktivieren
```
