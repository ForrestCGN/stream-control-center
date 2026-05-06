# STEP190.4 - SoundAlerts offene Eintraege in Uebersicht sichtbar machen

Stand: 2026-05-06

## Zweck

Neue/automatisch angelegte SoundAlert-Eintraege sollen direkt in der Uebersicht erkennbar sein und schnell bearbeitet werden koennen.

## Geaendert

Betroffene Dateien:

```text
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

## Neue UX

### Uebersicht

Wenn offene Eintraege oder unbekannte Events existieren, zeigt die Uebersicht jetzt einen auffaelligen Hinweis:

```text
Neue / offene SoundAlerts
x Eintraege zur Einrichtung
y unbekannte Events
```

Aktionen:

```text
Offenen Eintrag bearbeiten
Events pruefen
```

### Eintraege

Im Tab `Eintraege` erscheint bei offenen Eintraegen ein separater Hinweisblock.

Offene Eintraege sind:

```text
- Inaktiv / neu
- Datei fehlt
- SoundAlerts-Name fehlt
```

Die Karten zeigen zusaetzlich einen Status-Chip, z. B.:

```text
Inaktiv / neu
Datei fehlt
Name fehlt
```

Dadurch ist direkt sichtbar, welche automatisch oder neu angelegten SoundAlerts noch bearbeitet werden muessen.

## Nicht geaendert

- Keine Backend-Aenderung.
- Keine DB-Aenderung.
- Keine API-Aenderung.
- Bestehende Event-Aktionen bleiben erhalten.
- Bestehende SoundAlert-Eintraege bleiben kompatibel.

## Test

Syntax:

```text
node -c htdocs/dashboard/modules/soundalerts.js
```

Erwartung:

```text
OK
```

Dashboard-Test:

1. SoundAlerts -> Uebersicht oeffnen.
2. Pruefen, ob offene/automatische Eintraege sichtbar werden.
3. Button `Offenen Eintrag bearbeiten` pruefen.
4. Button `Events pruefen` pruefen.
5. SoundAlerts -> Eintraege oeffnen.
6. Pruefen, ob offene Eintraege mit Status-Chip sichtbar sind.
