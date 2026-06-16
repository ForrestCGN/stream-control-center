# CHANGELOG – stream-control-center

Stand: 2026-06-16

## 2026-06-16 – EVENTSYS-27D-FIX2 Live-Bedienung in der Übersicht

### Ergebnis

```text
Die Live-Bedienung für laufende Events wurde in die Übersicht verschoben. Bei laufendem Event sind die wichtigsten Bedienaktionen direkt im Live-Bereich sichtbar.
```

### Enthält

```text
- Live-Bedienung in der Übersicht.
- Nächsten Schnipsel vorbereiten.
- Status & Punkte öffnen.
- Event verwalten.
- Event beenden.
```

### Nicht enthalten

```text
Kein echtes Sound-Playback.
Kein Timer-Worker.
Keine Auto-Rotation.
Kein Countdown-PreRoll.
Kein Auflösungs-Video.
Kein Chat-Live-Send.
```

## 2026-06-16 – EVENTSYS-27D-FIX1 Reload nach mutierenden Buttons

```text
Nach mutierenden Aktionen werden Eventliste, ausgewähltes Event, Übersicht, Runtime-Gate und relevante Reports neu geladen.
```

Betroffene Aktionen:

```text
Starten
Beenden
Abbrechen
Prüfen
Speichern
Umbenennen
Kopieren
Löschen
Archivieren
Config speichern
Nächsten Schnipsel vorbereiten
```

## 2026-06-16 – EVENTSYS-27D Manuelle Sound-Rundensteuerung vorbereitet

```text
Bei laufenden Sound-Events wurde ein Bereich Sound-Steuerung ergänzt. Die vorhandene Route /api/stream-events/sound-runtime/next-round kann aus dem Dashboard ausgelöst werden. Dies bereitet nur die Runde vor und spielt noch nichts ab.
```

## 2026-06-16 – EVENTSYS-27C-FIX2 Editor-Regressionsfix

```text
Der alte Inline-Soundbereich wurde nach einer Regression wieder entfernt. Getrennte Editor-Fenster, MediaPicker-State, Umbenennen, Kopieren und Live-Statusfenster wurden zusammengeführt.
```

## 2026-06-16 – EVENTSYS-27C-FIX1 Eventnamen bearbeiten und Kopie benennen

```text
Events können umbenannt werden. Beim Kopieren öffnet sich ein Dialog, in dem der Name der Kopie gesetzt werden kann.
```

## 2026-06-16 – EVENTSYS-27C Events kopieren

```text
Events können als Entwurf dupliziert werden. Konfiguration, Sound-Schnipsel, Textdaten und Media-Referenzen werden kopiert. Punkte, Runden, Ranking und Laufzeitdaten werden nicht kopiert.
```

## 2026-06-16 – EVENTSYS-27B Live-Statusfenster

```text
Für laufende Events wurde ein Statusfenster mit Punkten/Rangliste/Rundenübersicht vorbereitet. Vollständiger Funktionstest folgt erst nach echter Runtime/Playback-Anbindung.
```

## 2026-06-16 – EVENTSYS-DOCS-1 Eventsystem 27A dokumentiert

```text
Doku wurde vom alten Loyalty/Raffle-Stand auf den Eventsystem-Stand bis 27A aktualisiert.
```

## 2026-06-16 – EVENTSYS-27A Event-Einstellungen und Sound-Defaults

```text
Globale Sound-Defaults wurden erweitert. Pro Event gibt es ein eigenes Fenster Einstellungen bearbeiten. Neue Events übernehmen Defaults aus Config/DB; bestehende Events erhalten sichere Fallbacks.
```

Bestätigte Standardwerte:

```text
Antwortzeit 60 Sekunden
Zufällig automatisch
Intervall 15 Minuten
Zufallsabweichung ± 5 Minuten
Wiederholschutz aktiv
Mindestabstand 3
Erkannte Schnipsel aus Rotation entfernen
Nicht erkannte später erneut versuchen
Auflösungs-Video nach Lösung automatisch, wenn vorhanden
```

## 2026-06-16 – EVENTSYS-26B Fix-Serie

```text
Getrennte Editor-Fenster, MediaPicker-State, Live-Summary, konkrete Sound-Schnipsel-Validierung und Refresh nach Speichern wurden eingebaut.
```

## Nächster Changelog-Block

```text
SOUND-SAFE-1 – Sound-System prüfen und sicheren Erweiterungspunkt für Countdown-PreRoll/EventSound festlegen.
```
