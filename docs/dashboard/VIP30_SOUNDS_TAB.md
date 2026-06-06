# VIP30 Dashboard – Sounds Tab

Stand: 2026-06-06  
STEP: 8.17

## Zweck

Der Tab `Sounds` verwaltet mehrere mögliche VIP30-Alert-Sounds.

## Felder pro Sound

```txt
ID
Label
Gewichtung
Media-ID
Media-Pfad Fallback
aktiv/deaktiviert
```

## Media-System

Jeder Sound-Eintrag hat eine eigene Media-Auswahl:

```txt
Sound auswählen / hochladen
Sound entfernen
```

Verwendet wird:

```txt
moduleKey=vip30
categoryKey=alerts
allowedTypes=audio
```

## Zufallsauswahl

Beim VIP30-Alert wählt das Backend einen aktiven Sound nach Gewichtung.

Beispiel:

```txt
Sound A weight 3
Sound B weight 1
```

Sound A wird ungefähr dreimal so häufig gewählt wie Sound B.

## Fallback

Wenn kein SoundPool gepflegt ist, bleibt der alte einzelne Sound aktiv:

```txt
alerts.mediaId
alerts.mediaPath
```

Damit bleibt bestehende Funktionalität erhalten.
