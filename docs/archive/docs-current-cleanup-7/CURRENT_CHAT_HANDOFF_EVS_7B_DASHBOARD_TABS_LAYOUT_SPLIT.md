# CURRENT CHAT HANDOFF – EVS-7b Dashboard Tabs Layout Split

Datum: 2026-06-13
Projekt: ForrestCGN / stream-control-center
Modul: stream_events

## Ziel

Das Event-System-Dashboard wurde nach Forrests Feedback auf Tabs umgebaut, weil die Eventliste, Event-Details, Text-Config/Multi-Texte, Statistik- und Overlay-Vorbereitung nicht alles untereinander auf einer Seite stehen sollen.

## Umsetzung

Neue Tabs im Dashboard-Modul:

- Übersicht
- Event
- Sound-Spiel
- Text-Spiel
- Texte
- Statistik
- Overlay

## Inhalt der Tabs

### Übersicht

- Eventliste
- Eventdetails
- Validierung
- Starten / Beenden / Abbrechen
- Ranking-Kurzansicht

### Event

- Grunddaten des gewählten Events
- Status
- Spieltypen
- Verweis auf Event-Bearbeitung

### Sound-Spiel

- Antwortzeit
- Verhalten bei nicht erkannt
- Schnipselübersicht
- Verweis auf Sound-Konfiguration

### Text-Spiel

- Anzahl geheimer Sätze
- Teiltreffer-Modus
- Wortpunkte
- Punkte-Limit
- Satzübersicht

### Texte

- Text-Config / Multi-Texte aus EVS-7
- Kategorien, Textkeys, Varianten
- aktiv/inaktiv, Gewichtung, hinzufügen, löschen

### Statistik

- Ranking-Anzeige vorbereitet
- spätere Statistikbereiche als Hinweis vorbereitet

### Overlay

- Platzhalter für spätere Overlay-Vorschau und Anzeigeoptionen

## Nicht geändert

- Keine Backend-Logik
- Keine DB-Änderung
- Keine Chat-Runtime
- Keine Worterkennung
- Keine Sound-Runtime
- Kein Overlay
- Keine Statistik-Runtime

## Test

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-7b Dashboard Tabs Layout Split"
```

Erst danach Dashboard testen.
