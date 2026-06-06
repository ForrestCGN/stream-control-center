# VIP30 Dashboard – Sounds Tab

Stand: 2026-06-06  
STEP: 8.18.1

## Sounds verwalten

Im Tab `Sounds` können mehrere VIP30-Sounds verwaltet werden.

## Felder pro Sound

```txt
ID
Label
Gewichtung
Media-ID
Dauer ms
Media-Pfad Fallback
aktiv/deaktiviert
```

## Dauer ms

```txt
0 = automatisch
```

Automatisch bedeutet:

```txt
Das Sound-System liest die echte Sounddauer aus dem Media-System/ffprobe.
```

Manuell:

```txt
12000 = 12 Sekunden
18000 = 18 Sekunden
```

## Empfehlung

Normalerweise immer:

```txt
Dauer ms = 0
```

setzen.

## Test

```txt
Aktionen -> VIP30 Alert testen
```
