# STEP270D - Sound Pegel-Scan Korrektur-Vorschau

Stand: 2026-05-21

## Ziel

Der Pegel-Scan soll vor einer echten Playback-Korrektur anzeigen, welche Anpassung später pro Sound empfohlen wäre.

## Umsetzung

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
```

Ergaenzt im Dashboard-Tab `Pegel-Scan`:

- Korrektur-Vorschau-Karte.
- Kennzahlen:
  - würden leiser
  - würden lauter
  - nahe Ziel
  - Volume-Cap
  - Peak prüfen
- Checkbox `Korrektur-Vorschau anzeigen`.
- Optionale Tabellenspalte `Vorschau`.
- Pro Datei wird auf Basis der bestehenden Scanner-Werte angezeigt:
  - empfohlenes Playback-Volume
  - empfohlener Gain
  - Risiko-Hinweis per Mouseover

## Sicherheit

Weiterhin read-only:

```text
Keine Sound-Datei wird verändert.
Keine normalisierte Kopie wird erzeugt.
Keine Playback-Korrektur wird aktiviert.
Keine Änderung an Sound-System Queue, Discord, Alerts oder TTS.
Keine Änderung an app.sqlite oder config/**.
```

## Tests

Syntax:

```powershell
node --check htdocs\dashboard\modules\sound_levelscan.js
```

Dashboard:

```text
System -> Sound-System -> Pegel-Scan
Korrektur-Vorschau anzeigen
Problematische zuerst
Lauteste zuerst
Leiseste zuerst
Mouseover über Vorschau-Spalte
```

## Naechster Schritt

Nach Sichtprüfung kann ein separater STEP fuer ein technisches Konzept bzw. eine optionale, abschaltbare Playback-Korrektur geplant werden.
