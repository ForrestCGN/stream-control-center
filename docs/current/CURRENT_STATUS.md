# CURRENT_STATUS – stream-control-center

Stand: 2026-06-16

## Aktueller bestätigter Arbeitsstand

```text
EVENTSYS-27A – Event-Einstellungen und Sound-Defaults bestätigt
```

## Kurzfazit

Das Event-System ist wieder der aktive Arbeitsbereich. Der zuletzt bestätigte Loyalty-/Raffle-Stand bleibt erhalten, ist aber nicht mehr der aktuelle Bearbeitungsschwerpunkt.

`stream_events` ist geladen, gesund und läuft mit Backend-Version `0.5.22`. Der bestätigte Dashboard-/Modulstand wurde bis EVS-27A erweitert: getrennte Editor-Fenster, konkrete Sound-Schnipsel-Validierung, Live-Refresh nach Speichern sowie globale Sound-Defaults und eventbezogene Event-Einstellungen.

## Bestätigt

```text
- stream_events Backend ok
- moduleVersion/version 0.5.22
- moduleBuild Basis: STEP_EVS_25A_EMPTY_OVERVIEW_ACTION_CLEANUP
- enabled=true
- schemaReady=true
- health=ok
- routeCount=38
- Communication-Bus registriert
- Heartbeat aktiv
- consumes:twitch.chat.message vorhanden
- Runtime-Gate korrekt inaktiv bei offline/no_active_event
- ChatOutput bleibt prepared-only / Live-Send aus
```

## Bestätigter Dashboard-Stand EVS-26B bis EVS-27A

```text
EVS-26A
- Sound-Event Dashboard kann mehrere Sound-Schnipsel verwalten.

EVS-26B
- Sound-Schnipsel und Text-Spiel haben getrennte Editor-Fenster.
- Haupt-Event-Fenster ist entschlackt.

EVS-26B-FIX1
- gespeicherte Media-IDs werden beim erneuten Öffnen wieder sichtbar aufgelöst.

EVS-26B-FIX2
- Sound-Schnipsel-Zusammenfassungen aktualisieren sich direkt beim Bearbeiten.

EVS-26B-FIX3
- Sound-Schnipsel werden pro Schnipsel validiert.
- Fehlende Pflichtfelder werden konkret angezeigt.

EVS-26B-FIX4
- Eventdetails, Eventliste und Startbereit-Status werden nach Speichern frisch geladen.

EVS-27A
- Sound-Defaults wurden erweitert.
- Event-spezifische Einstellungen haben ein eigenes Fenster.
- Defaults aus Config/DB werden für neue Events genutzt.
```

## Sound-Event Stand

### Sound-Schnipsel

Ein Sound-Event kann mehrere Schnipsel enthalten. Pro Schnipsel sind Pflicht:

```text
- Schnipsel-Name
- mindestens eine erlaubte Antwort
- Audio-Medium
```

Optional:

```text
- Auflösungs-Video
```

Die Validierung meldet konkret, welcher Schnipsel was nicht hat, z. B.:

```text
Sound-Schnipsel 3: Antwort fehlt.
Sound-Schnipsel 2: Audio fehlt.
Sound-Schnipsel 1: Name fehlt.
```

### Globale Sound-Defaults

Bestätigte Standardwerte/Optionen im Config-Tab:

```text
Antwortzeit: 60 Sekunden
Punkte pro Soundlösung: 10
Abspielmodus: Zufällig automatisch
Intervall: alle 15 Minuten
Zufallsabweichung: ± 5 Minuten
Reihenfolge: Zufällig
Wenn erkannt: aus aktueller Rotation entfernen
Wenn nicht erkannt: später nochmal versuchen
Pause nach Runde: 60 Sekunden
Mindestabstand Wiederholung: 3
Erste Runde automatisch beim Eventstart: aus
Nach einer Runde automatisch weitermachen: an
Direkte Wiederholung vermeiden: an
Auflösungs-Video nach Lösung erlauben: an
Video-Modus: nach richtiger Antwort automatisch
```

### Event-spezifische Einstellungen

In Eventdetails und Eventbearbeitung gibt es ein eigenes Fenster:

```text
Einstellungen bearbeiten
```

Dort werden pro Event geregelt:

```text
Sound · Ablauf & Timing
Sound · Rotation
Sound · Auflösung
```

Neue Events übernehmen ihre Vorgaben aus Config/DB. Bestehende Events bekommen sichere Fallbacks, werden aber nicht blind überschrieben.

## Aktueller Runtime-Stand

Noch nicht produktiv angebunden:

```text
- echtes Sound-Playback
- Timer-Worker / Auto-Rotation
- manuelle Sound-Rundensteuerung als Live-Aktion
- Auflösungs-Video-Playback
- produktive Chat-Ausgaben
```

Weiterhin gilt:

```text
- keine direkte Twitch-Ausgabe
- kein direkter Chat-Send
- kein echtes Sound-/Video-Playback ohne separaten STEP
- Chat-Auswertung über Twitch-Events / Communication-Bus
```

## Nächster sinnvoller Arbeitsblock

```text
EVENTSYS-27B – Live-Statusfenster für laufende Events mit Punkten/Rangliste
```

Danach:

```text
EVENTSYS-27C – Manuelle Sound-Rundensteuerung
EVENTSYS-27D – Sound-/Media-Playback-Anbindung
EVENTSYS-27E – Automatik: zufällig alle X ± Y Minuten
EVENTSYS-27F – Auflösungs-Video nach Lösung
EVENTSYS-27G – Chat-Ausgaben über helper_texts/helper_messages
EVENTSYS-27H – Statistik-Ausbau
```
