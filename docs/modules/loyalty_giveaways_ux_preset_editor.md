# Loyalty Games / Giveaways – UX-Konzept Preset-Editor

Stand: 2026-06-09T09:33:13Z

## Zielgruppe

Die Bedienung muss für Streamer und Mods logisch sein. Niemand soll technische Begriffe verstehen müssen, um ein Wheel-Giveaway sauber anzulegen.

## Dashboard-Tabs

### Glücksrad

Aufgabe:

- Live-/Testbereich
- manueller Spin
- Overlay-Test
- aktueller Radstatus

Nicht Aufgabe:

- Giveaway erstellen
- Presets umfangreich bearbeiten

### Presets

Aufgabe:

- zentrale Glücksräder/Preset-Vorlagen erstellen
- Presets bearbeiten
- Segmente/Felder pflegen
- Gewichte, Mengen, Gewinnlogik, Labels und Farben bearbeiten

Der Tab-Name `Presets` bleibt vorerst bestehen.

### Giveaways

Aufgabe:

- Gewinnspiel erstellen
- Tickets/Teilnahmen verwalten
- Einträge schließen
- Gewinner ziehen
- bei Wheel-Modus: ein Glücksrad auswählen oder direkt erstellen

## Wheel-Giveaway-Regel

Wenn der Giveaway-Modus `wheel_single` oder `wheel_multi` ist, muss ein gültiges Glücksrad vorhanden sein.

Speichern ist nur erlaubt, wenn:

1. ein bestehendes Preset gewählt wurde
2. oder im eingebetteten Preset-Editor ein neues gültiges Preset/Rad erstellt wurde

Blockierende Fehlermeldung:

`Bitte wähle ein Glücksrad aus oder erstelle ein neues Glücksrad für dieses Giveaway.`

## Wiederverwendbarer Preset-Editor

Es wird nur ein Editor gebaut.

Dieser Editor wird in zwei Kontexten genutzt:

### Kontext `preset`

Verwendung im Tab `Presets`.

Eigenschaften:

- globales Preset
- lifecycleOwner = `preset`
- linkedGiveawayUid leer
- später in Giveaways auswählbar

### Kontext `giveaway`

Verwendung im Tab `Giveaways`.

Eigenschaften:

- User erstellt oder bearbeitet das konkrete Rad für dieses Giveaway
- UI nutzt denselben Editor
- technischer Kontext kann entweder ein giveaway-linked Preset oder eine direkte Bound-Wheel-Kopie sein
- fachlich gehört das Rad zum Giveaway

## Editor-Darstellung

Der Editor öffnet als großes Dashboard-Modal.

Kein Browser-Popup.

Anforderungen:

- übersichtlich
- klarer Titel
- große Arbeitsfläche
- Speichern/Abbrechen immer sichtbar
- keine technischen Begriffe als Haupttexte
- verständliche Fehler
- geeignet für Mods und Streamer

## Empfohlene Editor-Struktur

### Kopfbereich

- Titel: `Preset bearbeiten` oder `Glücksrad bearbeiten`
- Kontextanzeige:
  - `Globales Preset`
  - `Für Giveaway: <Titel>`
- Name
- Beschreibung
- Status

### Bereich Segmente/Felder

Darstellung bevorzugt als Karten oder kompakte Liste, nicht als technische Riesentabelle.

Pro Segment:

- Label
- Untertext
- Gewicht
- Menge
- Typ
- Wert
- aktiv/inaktiv
- Farbe optional

Aktionen:

- bearbeiten
- duplizieren
- deaktivieren
- löschen

### Vorschau

- kleine Rad-/Segmentvorschau
- Anzahl aktiver Felder
- Hinweis, ob das Rad speicherbar ist

## UX-Verhalten im Giveaway-Editor

Wenn `Classic Single` oder `Classic Multi` gewählt ist:

- kein Glücksradbereich sichtbar
- keine Wheel-Preset-Pflicht

Wenn `Wheel Single` oder `Wheel Multi` gewählt ist:

Bereich sichtbar:

`Glücksrad für dieses Giveaway`

Optionen:

1. `Bestehendes Preset auswählen`
2. `Neues Glücksrad erstellen`

Solange keines gültig ist:

- Speichern deaktivieren oder blockieren
- klare Fehlermeldung anzeigen

## Locking

Sobald ein Wheel-Giveaway geöffnet wird:

- Bound-Wheel wird active/locked
- Bearbeitung des konkreten Giveaway-Rads wird gesperrt
- spätere Änderungen am globalen Preset ändern das laufende Giveaway nicht

## Offene technische Detailentscheidung

Für `Neues Glücksrad erstellen` im Giveaway gibt es zwei mögliche technische Wege:

1. giveaway_linked Preset
2. direkte Bound-Wheel-Kopie

UX-seitig bleibt es derselbe Editor.

Die technische Entscheidung wird in einem späteren Backend-Step festgelegt.
