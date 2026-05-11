# SoundAlerts Media Upload / Replay - Next Steps

Stand: 2026-05-06

## Zweck

Dieser STEP speichert den geplanten Ausbau nach STEP188 bis STEP190, damit der Stand in neuen Chats direkt ueber GitHub/dev nachvollziehbar ist.

Aktueller technischer Stand:

- STEP188: Sound-System kann Video-Dateien ueber das bestehende Sound-Overlay abspielen und korrekt in der Queue halten.
- STEP189: SoundAlerts-Chat-Bridge erkennt SoundAlerts-Chatmeldungen und startet gemappte lokale Medien ueber das Sound-System.
- STEP189.1: Parser-Hotfix erkennt deutsche SoundAlerts-Meldungen robust, auch bei Encoding-Problemen aus PowerShell-Tests.
- STEP190: SoundAlerts-Dashboard wurde vorbereitet.

## Bestaetigte Fachregeln

- SoundAlerts-Name und Bot-Login muessen dashboardfaehig einstellbar sein.
- SoundAlerts-Bot wird aktuell ueber Twitch-Userinfo als `login=soundalerts`, `display_name=SoundAlerts`, `id=216527497` referenziert.
- Unbekannte SoundAlerts sollen erstmal keinen Chat-Spam erzeugen.
- Unbekannte SoundAlerts werden als `unmatched` geloggt und sollen im Dashboard sichtbar sein.
- Ein bekanntes Mapping mit fehlender Datei soll als `file_missing` geloggt werden.
- Bei `file_missing` darf optional eine kurze Chatmeldung kommen, aber ohne lokalen Dateipfad.
- Audio soll standardmaessig ueber Device laufen.
- Video muss ueber Overlay laufen.
- Replay und Upload duerfen keine neue Parallelstruktur bauen, sondern muessen das bestehende Sound-System und dessen Queue nutzen.

## Geplanter STEP191 - SoundAlerts Event Replay

Ziel:

Events im SoundAlerts-Dashboard erneut starten koennen. Das erneute Starten laeuft normal ueber das Sound-System und reiht sich in die Queue ein.

Geplante Route:

```text
POST /api/soundalerts/events/:id/replay
```

Regeln:

- Replay nutzt standardmaessig das aktuelle Mapping, nicht blind die alte Datei aus dem Event.
- Wenn das Mapping inzwischen korrigiert wurde, nutzt Replay automatisch die korrigierte Datei.
- Wenn aktuell kein Mapping existiert, wird nicht abgespielt und sauber als Fehler/Status zurueckgegeben.
- Wenn die Datei fehlt, wird nicht abgespielt und als `file_missing` behandelt.
- Replay erzeugt ein neues Event, z. B. `replay_queued`, mit Referenz auf das Original-Event in `meta_json`.
- Replay startet nicht direkt am Overlay vorbei, sondern immer ueber `/api/sound/play`.

Dashboard-Verhalten:

- Bei `queued`-Events: Button `Erneut abspielen` aktiv.
- Bei `unmatched`: Button deaktiviert oder Hinweis `erst Mapping erstellen`.
- Bei `file_missing`: Button deaktiviert oder Hinweis `erst Datei hochladen`.
- Buttons sollen spaeter sein:
  - `Erneut abspielen`
  - `Mapping bearbeiten`
  - `Datei hochladen`

Betroffene Dateien fuer STEP191 voraussichtlich:

- `backend/modules/soundalerts_bridge.js`
- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `project-state/STEP191_SOUNDALERTS_EVENT_REPLAY_2026-05-06.md`

## Geplanter STEP192 - Allgemeines Sound-Media Upload Backend

Ziel:

Ein allgemeines Upload-System fuer Sound- und Video-Dateien bauen. Nicht nur SoundAlerts-spezifisch, damit spaeter VIP, Alerts, Sound-System und andere Module dieselbe Medienverwaltung nutzen koennen.

Wichtige Regel:

Uploads gehen ins Live-System, nicht ins Repo.

Live-Zielbereiche:

```text
D:\Streaming\stramAssets\htdocsssets\sounds\soundalertsudioD:\Streaming\stramAssets\htdocsssets\sounds\soundalertsideo```

Repo-Regel:

- Im Repo bleiben nur Ordnerstruktur und `.gitkeep`.
- Echte MP3/MP4/Testdateien werden nicht committed.

Geplante allgemeine Routen:

```text
POST /api/sound/media/upload
GET  /api/sound/media/list
POST /api/sound/media/probe
```

Alternativ oder zusaetzlich fuer SoundAlerts:

```text
POST /api/soundalerts/upload
GET  /api/soundalerts/media
```

Sicherheitsregeln:

- Erlaubte Endungen: `.mp3`, `.wav`, `.ogg`, `.webm`, `.m4a`, `.mp4`.
- Keine ausfuehrbaren/Code-Dateien: `.exe`, `.bat`, `.cmd`, `.ps1`, `.js`, `.html`, `.php` usw.
- Dateigroessen-Limits fuer Audio und Video.
- Sichere Dateinamen.
- Kein Ueberschreiben ohne ausdrueckliche Option.
- ffprobe-Pruefung nach Upload.
- Rueckgabe von Dauer, Format, Aufloesung, hasAudio/hasVideo.

Dateinamen-Regel:

```text
Ä -> ae
Ö -> oe
Ü -> ue
ä -> ae
ö -> oe
ü -> ue
ß -> ss
Leerzeichen -> _
Sonderzeichen entfernen
alles klein
```

Beispiel:

```text
SoundAlert-Name: Fahrstuhl Sound
Upload-Datei: mein-video-final.mp4
Ziel-Datei: soundalerts/video/fahrstuhl_sound.mp4
```

## Geplanter STEP193 - SoundAlerts Upload-/Mapping-UX

Ziel:

Bei `unmatched` oder `file_missing` direkt im SoundAlerts-Dashboard eine Datei hochladen und mit dem SoundAlert verknuepfen koennen.

UX bei `unmatched`:

```text
Unbekannter SoundAlert: "Unbekannter Testsound"
[Datei hochladen & Mapping erstellen]
[bestehende Datei auswaehlen]
[ignorieren]
```

UX bei `file_missing`:

```text
SoundAlert: "Fahrstuhl Sound"
Erwartete Datei: soundalerts/video/fahrstuhl_sound.mp4
Status: Datei fehlt
[Datei hochladen]
[Mapping aendern]
```

Ablauf beim Upload:

1. Event oder SoundAlert-Name auswaehlen.
2. Datei hochladen.
3. System erkennt Audio/Video.
4. System schlaegt sicheren Dateinamen vor.
5. Datei wird in audio/video-Zielordner gespeichert.
6. Mapping wird erstellt oder aktualisiert.
7. Datei wird per ffprobe geprueft.
8. Danach kann der SoundAlert direkt erneut gestartet werden.

## Geplanter STEP194 - Allgemeine Sound-Medienverwaltung

Ziel:

Eine allgemeine Medienbibliothek im Sound-Dashboard, nicht nur fuer SoundAlerts.

Funktionen:

- Dateien anzeigen.
- Nach Kategorie filtern.
- Audio/Video unterscheiden.
- Dauer, Format, Groesse, Aufloesung anzeigen.
- Vorschau/Test abspielen.
- Kategorie setzen.
- Datei umbenennen/deaktivieren.
- Loeschen spaeter nur mit Sicherheitsabfrage.

Moegliche Kategorien:

```text
soundalerts
vip
alert
tts
fun
admin
system
```

## Bewusst offen

- Userinfo-Pruefbutton fuer SoundAlerts-Bot im Dashboard.
- Upload-Rechte/Audit-Logging.
- Datei-Auswahl aus bestehender Medienbibliothek.
- Loesch-/Deaktivieren-Konzept fuer Medien.
- Medienverwaltung nicht in htdocs-Doku schreiben, sondern in Backend/Dashboard/API-Doku halten.

## Naechster empfohlener Schritt

Als naechstes zuerst STEP191 bauen, weil Event-Replay klein, nuetzlich und risikoarm ist.

Danach STEP192/193 fuer Upload und direkte Mapping-Erstellung.
