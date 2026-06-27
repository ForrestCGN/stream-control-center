# CURRENT_CHAT_HANDOFF_EVENTSYS_27A

Stand: 2026-06-16

## Aktueller Stand

```text
EVENTSYS-27A – Event-Einstellungen und Sound-Defaults bestätigt
```

Das Event-System ist der aktuelle Arbeitsbereich. Der vorherige Doku-Stand im Repo war noch stark auf Loyalty/Raffle ausgerichtet; dieser Handoff setzt den Eventsystem-Fokus wieder sauber.

## Bestätigt im Dashboard

```text
- Config-Fenster ist gut aufgebaut.
- Sound-Defaults werden gespeichert.
- Event-spezifisches Einstellungsfenster ist vorhanden.
- Sound-Schnipsel-Fenster ist separat.
- Text-Spiel-Fenster ist separat.
- Werte bleiben nach Speichern erhalten.
```

Bestätigte Standardwerte:

```text
Antwortzeit: 60 Sekunden
Abspielmodus: Zufällig automatisch
Intervall: 15 Minuten
Zufallsabweichung: ± 5 Minuten
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

## Wichtige Architekturentscheidungen

```text
Config-Tab = globale Defaults für neue Events.
Event-Einstellungen = Regeln für ein konkretes Event.
Sound-Schnipsel = Sounddateien, Antworten, optionales Video.
Text-Spiel = Textaufgaben/Sätze/Lösungen.
Live-Statusfenster = laufendes Event, Punkte, Ranking, Rundenstatus.
```

Neue Events sollen Defaults aus Config/DB übernehmen. Bestehende Events dürfen nicht blind durch spätere globale Default-Änderungen überschrieben werden.

## Laufende Sicherheitsgrenzen

Noch nicht aktivieren:

```text
- echtes Sound-Playback
- automatische Timer-Rotation
- Auflösungs-Video-Playback
- direkter Chat-Send
- produktive ChatOutputs
```

Weiterhin nutzen:

```text
- vorhandener Communication-Bus
- Twitch-Events für Chatnachrichten
- vorhandenes Sound-/Media-System, sobald Playback angebunden wird
- helper_texts/helper_messages für Chattexte
```

## Nächster Schritt

```text
EVENTSYS-27B – Live-Statusfenster für laufende Events mit Punkten/Rangliste
```

Ziel:

```text
Wenn ein Event läuft, soll man ein eigenes Statusfenster öffnen können.
```

Geplanter Inhalt:

```text
Event-Status
- Eventname
- Status
- Spieltyp
- gestartet seit
- aktive Runde
- verbleibende Antwortzeit, sobald Runtime aktiv ist

Punkte / Rangliste
- Platz
- User
- Punkte
- richtige Antworten
- schnellste Antwort, sobald messbar
- letzte Aktion

Rundenverlauf
- Schnipsel/Text
- gelöst / nicht gelöst / übersprungen
- Gewinner
- Punkte
- Zeit

Sound-Rotation
- offene Schnipsel
- gelöste Schnipsel
- nicht erkannte Schnipsel
- wieder eingereiht
- aus Rotation entfernt
```

## Danach geplant

```text
EVENTSYS-27C – Manuelle Sound-Rundensteuerung
EVENTSYS-27D – Sound-/Media-Playback-Anbindung
EVENTSYS-27E – Automatik: zufällig alle X ± Y Minuten
EVENTSYS-27F – Auflösungs-Video nach Lösung
EVENTSYS-27G – Chat-Ausgaben über helper_texts/helper_messages
EVENTSYS-27H – Statistik-Ausbau
```

## Arbeitsregel für nächsten Chat

Vor Codeänderungen wieder:

```text
Ziel
Dateien
Änderung
Nicht geändert
Tests
auf go warten
```

Bei Status-/API-Abfragen nur die wirklich benötigten Daten anfordern.
