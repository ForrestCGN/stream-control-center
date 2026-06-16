# CURRENT_STATUS – stream-control-center

Stand: 2026-06-16

## Aktueller Arbeitsstand

```text
EVENTSYS-27D-FIX2 – Live-Bedienung in der Übersicht
Sound-Event Dashboard/Config/Verwaltung ist bis zur manuellen Rundenvorbereitung aufgebaut.
Nächster Block: Sound-System sicher prüfen, bevor Event-Sound-Playback + Countdown-PreRoll angebunden wird.
```

## Kurzfazit

Das Eventsystem ist wieder der aktuelle Arbeitsblock. Der vorherige Loyalty/Raffle-Stand ist nicht mehr der Startpunkt für diesen Chatbereich.

Bestätigt bzw. eingebaut:

```text
- stream_events ist geladen und gesund: Version 0.5.22, Build STEP_EVS_25A_EMPTY_OVERVIEW_ACTION_CLEANUP.
- Eventsystem ist enabled, schemaReady=true, Bus registriert.
- Sound/Text Events können konfiguriert werden.
- Sound-Schnipsel werden in einem eigenen Editor-Fenster verwaltet.
- Text-Spiel wird in einem eigenen Editor-Fenster verwaltet.
- Event-spezifische Einstellungen werden in einem eigenen Fenster bearbeitet.
- Globale Sound-Defaults werden im Config-Tab gespeichert.
- Eventnamen können bearbeitet werden.
- Events können kopiert werden; der Name der Kopie kann im Dialog gesetzt werden.
- Nach mutierenden Buttons wird der Dashboard-State neu geladen.
- Live-Bedienung sitzt jetzt in der Übersicht.
```

## Wichtige bestätigte Standardwerte Sound-Events

Vom Nutzer bestätigte Default-Richtung:

```text
Antwortzeit: 60 Sekunden
Abspielmodus: zufällig automatisch
Intervall: alle 15 Minuten
Zufallsabweichung: ± 5 Minuten
Wiederholschutz: direkte Wiederholung vermeiden
Mindestabstand: 3 Schnipsel
Wenn erkannt: Schnipsel aus Rotation entfernen
Wenn nicht erkannt: später nochmal versuchen
Auflösungs-Video nach richtiger Antwort automatisch, wenn vorhanden
```

## Aktuelle UI-Struktur

```text
Event-Details
├─ Umbenennen
├─ Kopieren
├─ Einstellungen bearbeiten
├─ Sound-Schnipsel bearbeiten
├─ Text-Spiel bearbeiten
└─ Aktionen: Prüfen / Starten / Beenden / Abbrechen / Archivieren / Löschen

Übersicht
└─ wenn Event läuft:
   ├─ EVENT LÄUFT
   ├─ Runtime-Hinweis
   └─ Live-Bedienung
      ├─ Nächsten Schnipsel vorbereiten
      ├─ Status & Punkte öffnen
      ├─ Event verwalten
      └─ Event beenden
```

## Sound-System-Sicherheitsregel

Der nächste Runtime-Block darf das bestehende Sound-System nicht beschädigen.

Verbindlich:

```text
Bestehendes Sound-System bleibt Standard.
Bestehende Routen und Payloads müssen unverändert funktionieren.
Neue EventSound-/Countdown-Funktion darf nur optional/additiv sein.
Wenn neue Felder fehlen, muss alles exakt wie bisher laufen.
Countdown darf nicht am Sound-System vorbei laufen.
Countdown + Sound müssen ein gemeinsamer Queue-Job sein.
```

## Aktueller Runtime-Stand

```text
- Manuelle Sound-Runde kann vorbereitet werden.
- Es gibt noch kein echtes Sound-Playback aus stream_events heraus.
- Es gibt noch keinen Timer-Worker für Auto-Rotation.
- Es gibt noch keinen Countdown-PreRoll.
- Es gibt noch kein Auflösungs-Video-Playback.
- Chat-Live-Send bleibt weiterhin deaktiviert/prepared-only.
```

## Nächster sinnvoller Schritt

```text
SOUND-SAFE-1 – Sound-System prüfen und Erweiterungspunkt für EventSound + Countdown-PreRoll festlegen
```

Ziel dieses nächsten Schritts ist zuerst Inspektion/Planung, nicht direkt Playback:

```text
- sound_system.js prüfen
- sound_system_overlay.html prüfen
- aktuelle /api/sound/play Payload und Queue-Logik prüfen
- sicher festlegen, wo preRoll/countdown optional ergänzt werden kann
- sicherstellen: ohne preRoll bleibt altes Verhalten unverändert
```
