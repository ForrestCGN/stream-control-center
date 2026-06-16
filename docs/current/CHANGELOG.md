# CHANGELOG – stream-control-center

Stand: 2026-06-16

## 2026-06-16 – EVENTSYS-27A Event-Einstellungen und Sound-Defaults

### Ergebnis

```text
Das Event-System hat jetzt erweiterte globale Sound-Defaults und ein eigenes eventbezogenes Einstellungsfenster. Sound-Schnipsel, Text-Spiel und Event-Einstellungen sind getrennt bearbeitbar.
```

### Details

```text
- Sound-Defaults im Config-Tab erweitert.
- Antwortzeit-Standard auf 60 Sekunden gesetzt.
- Abspielmodus, Intervall, Zufallsabweichung, Reihenfolge und Rotation konfigurierbar.
- Solved/Unresolved-Policies konfigurierbar.
- Auflösungs-Video nach Lösung konfigurierbar.
- Eventdetails/Bearbeiten besitzt Button `Einstellungen bearbeiten`.
- Neue Events übernehmen Defaults aus Config/DB.
- Bestehende Events bekommen sichere Fallbacks.
```

### Nicht enthalten

```text
- kein echtes Sound-Playback
- kein Timer-Worker
- keine automatische Rotation
- kein Auflösungs-Video-Playback
- kein direkter Chat-Send
```

## 2026-06-16 – EVENTSYS-26B-FIX4 Eventdetails nach Speichern neu laden

```text
Nach erfolgreichem Speichern wird das ausgewählte Event frisch vom Backend geladen. Eventliste, Detailpanel, Status-Badge, `Noch nötig`-Box und Starten-Button aktualisieren sich ohne manuellen Reload.
```

## 2026-06-16 – EVENTSYS-26B-FIX3 konkrete Sound-Schnipsel-Validierung mit Live-Refresh

```text
Sound-Schnipsel werden pro Schnipsel geprüft. Fehlende Pflichtfelder werden konkret angezeigt, z. B. Antwort fehlt, Audio fehlt oder Name fehlt. Die Anzeige aktualisiert sich beim Bearbeiten direkt im Editor.
```

## 2026-06-16 – EVENTSYS-26B-FIX2 Sound-Editor Summary nach Änderungen sofort aktualisieren

```text
Schnipsel-Kopfzeile, Antwortanzahl, Audio-/Video-Status und Hauptmodal-Summary werden nach Änderungen direkt aktualisiert.
```

## 2026-06-16 – EVENTSYS-26B-FIX1 Sound-Editor MediaPicker-State erhalten

```text
Gespeicherte Media-IDs werden beim Öffnen/Neu-Rendern wieder sichtbar aufgelöst. Falls die Vorschau nicht geladen werden kann, wird die gespeicherte mediaId angezeigt.
```

## 2026-06-16 – EVENTSYS-26B getrennte Editor-Fenster

```text
Sound-Schnipsel und Text-Spiel wurden aus dem Haupt-Event-Modal in eigene Editor-Fenster ausgelagert. Das Hauptmodal bleibt auf Grunddaten und zentrale Aktionen reduziert.
```

## 2026-06-16 – EVENTSYS-26A Sound-Event Mehrfach-Schnipsel

```text
Sound-Events können im Dashboard mehrere Sound-Schnipsel verwalten. Jeder Schnipsel hat Name, Antworten, Audio und optional ein Auflösungs-Video.
```

## Hinweis

Die bisherigen Loyalty-/Raffle-Dokueinträge bleiben historisch gültig, sind aber nicht mehr der aktuelle aktive Arbeitsblock.
