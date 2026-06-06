# VIP30 Overlay – nächster Chat / UI-TODO

Stand: 2026-06-06

## Ausgangslage

Der VIP30-Flow funktioniert. Das Overlay erscheint, Sound und Texte funktionieren, Avatar wird im manuellen Test angezeigt.

Jetzt soll das Overlay optisch verbessert werden.

## Aktuelles Design

```txt
CGN Split Lounge / Neon Lounge
dunkler Hintergrund
linker Avatarbereich
rechter Textbereich
Kicker + Headline + Subline + Message + Perks
Brand unten rechts
```

## Zu verbessern

### Lange Namen

Problem:

```txt
Headline kann abgeschnitten werden
```

Ziel:

```txt
dynamische Schriftgröße
sauberer Fit bei langen Namen
kein unschönes Ellipsis mitten im Satz, wenn vermeidbar
optional 2-Zeilen-Fit
```

### Lesbarkeit

```txt
Headline etwas besser skalieren
Subline/Message etwas lesbarer
Perks/Chips größer oder besser gepaddet
```

### Proportionen

```txt
Textbereich eventuell verbreitern
Card eventuell 5–10 % größer
Avatarbereich prüfen
```

### Avatar

```txt
Avatarbereich funktioniert grundsätzlich.
Fallback nur nutzen, wenn Twitch-Lookup fehlschlägt.
```

## Nicht kaputt machen

```txt
Sound-System-Bundle
sound_system_overlay.html VIP30-Flow
Avatar-Auflösung
random SoundPool
random OverlaySets
Media-System
Dashboard-Testbutton
```
