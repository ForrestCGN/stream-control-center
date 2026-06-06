# VIP30 Dashboard – Sounds Tab

Stand: 2026-06-06

## Zweck

Im Tab `Sounds` werden mehrere VIP30-Sounds verwaltet.

## Setting

```txt
alerts.soundPool
```

## Felder

```txt
ID
Label
Gewichtung
Media-ID
Dauer ms
Media-Pfad Fallback
aktiv/deaktiviert
```

## Dauer

```txt
0 = automatisch aus Media-System/ffprobe
```

Empfehlung:

```txt
Dauer ms immer auf 0 lassen, sofern die Datei korrekt erkannt wird.
```

## Zufall

Soundauswahl erfolgt gewichtet:

```txt
weight 3 -> häufiger
weight 1 -> normal
weight 0 oder enabled false -> nicht auswählen
```
