# Control-Center Benutzeranleitung

Stand: 2026-05-02  
Projekt: `stream-control-center`

## Zweck

Das Control-Center ist die zentrale Web-Oberfläche für Stream-Steuerung, Alerts, OBS, Sound-System und spätere Community-/Admin-Funktionen.

Die Oberfläche ist in Hauptbereiche aufgeteilt:

```txt
Live
Control
System
Community
Admin
```

Nicht jeder Menüpunkt ist schon aktiv. Einige Bereiche sind bewusst vorbereitet, aber noch deaktiviert.

## Grundaufbau

Links befindet sich die Navigation. Oben befindet sich die Kopfzeile mit Reload, Theme-Umschaltung und je nach Modul weiteren Aktionen.

Aktive Module öffnen sich im Hauptbereich.

Deaktivierte Module sind sichtbar, aber nicht anklickbar. Diese sind für spätere Ausbaustufen vorbereitet.

## Navigation

### Live

Für direkte Stream-Bedienung.

Aktuell relevant:

```txt
Stream-Desk
```

Vorbereitet, aber noch nicht aktiv:

```txt
Chat
Userinfo
Clips
```

### Control

Für Stream-Steuerung und große Bedienbereiche.

Aktuell relevant:

```txt
Übersicht
Alerts V2
OBS Details
```

Vorbereitet:

```txt
Overlays
Stream-Steuerung
```

### System

Für technische Stream-Systeme, die im Betrieb laufen.

Aktuell relevant:

```txt
Sound-System
```

Vorbereitet:

```txt
TTS
Bot-Systeme
Message-Rotator
Automationen
Integrationen
Modulstatus
```

### Community

Für Community-Module.

Aktuell vorbereitet:

```txt
Hug-System
Chat-Overlay
Deathcounter
Challenges
Tagebuch
Todo
Commands
```

Diese Bereiche sind im Dashboard sichtbar vorbereitet, aber noch nicht vollständig als Dashboard-Seiten aktiv.

### Admin

Für technische Konfiguration, Rechte, Logs und Systemwerte.

Aktuell relevant:

```txt
Configs
```

Vorbereitet:

```txt
Benutzer
Rollen & Rechte
Logs
Datenbank
Tokens / Secrets
Diagnose
```

## Was bedeutet „vorbereitet“?

Vorbereitet heißt:

```txt
- Die Navigation oder Struktur existiert bereits.
- Das Modul ist für spätere Umsetzung eingeplant.
- Es ist noch nicht vollständig bedienbar.
- Es sollte im normalen Betrieb nicht als fertig betrachtet werden.
```

## Was bedeutet „aktiv“?

Aktiv heißt:

```txt
- Das Modul ist im Dashboard aufrufbar.
- Die Oberfläche ist vorhanden.
- Die wichtigsten Funktionen sind angebunden.
- Es wurde mindestens grundlegend getestet.
```

Aktiv bedeutet nicht automatisch „final“. Viele Bereiche werden weiter ausgebaut.

## Wichtige aktuelle Arbeitsbereiche

### Alerts V2

Hier werden Alerts, Regeln, Texte, Sounds/Grafiken und Tests verwaltet.

Wichtige Unterscheidung:

```txt
Lokale Vorschau:
- nur auf dem eigenen Rechner
- kein OBS
- keine Live-Queue
- kein Sound-System

Live-Test:
- echte Alert-Pipeline
- OBS-Overlay
- Sound-System
- Audiogerät/Voicemeeter je nach Einstellung
```

### OBS Details

Zeigt OBS-Informationen und technische Details.

Auf der normalen OBS-Hauptseite sollen später nur wichtige sichtbare Szenen angezeigt werden. Hilfsszenen mit führendem Unterstrich `_` gehören eher in Detail-/Overlaybereiche.

### Sound-System

Zentrale Seite für Sounds, Queue, Ausgabe und normale Runtime-Einstellungen.

Technische Expertenwerte gehören nicht hierhin, sondern nach:

```txt
Admin → Configs → Sound-System Experten
```

## Wichtige Bedienregel

Normale Bedienseiten sind für Stream-Betrieb gedacht.

Admin-/Systemwerte sind für technische Konfiguration gedacht.

Beispiel:

```txt
Sound-System Seite:
- Sound starten
- Stop/Skip
- Queue ansehen
- Ausgabe wählen
- Lautstärken und normale Regeln einstellen

Admin → Configs:
- Helper-Pfad
- Playback Mode
- Base-Verzeichnisse
- Datei-Erweiterungen
- technische URLs
```

## Was sollte man nicht einfach ändern?

Ohne klaren Grund nicht ändern:

```txt
- Helper-Pfade
- Sounds Base Dir
- Allowed Extensions
- Playback Mode
- Tokens/Secrets
- Datenbankpfade
- technische Backend-Configs
```

Diese Werte können Systemfunktionen brechen.

## Fehlersuche für Nutzer

Wenn etwas nicht reagiert:

```txt
1. Dashboard hart neu laden: Strg + F5
2. Backend-Status prüfen: /api/_status
3. Modulseite neu öffnen
4. Browser-Konsole prüfen
5. Bei Sound/Alerts zusätzlich /api/sound/status oder /api/alerts/status prüfen
```

## Aktueller Stand zusammengefasst

```txt
Aktiv:
- Stream-Desk
- Übersicht
- Alerts V2
- OBS Details
- Sound-System
- Admin Configs teilweise

Vorbereitet:
- Chat
- Userinfo
- Clips
- Overlays
- Stream-Steuerung
- TTS
- Bot-Systeme
- Community-Module
- Benutzer/Rechte/Logs/Tokens
```

## Nächste geplante Themen

```txt
- Admin-Rechte und Audit-Logging
- Sound-Bibliothek / Upload / Dateiverwaltung
- Discord-Ausgabe über Sound-System
- weitere Dashboard-Module aktivieren
```
