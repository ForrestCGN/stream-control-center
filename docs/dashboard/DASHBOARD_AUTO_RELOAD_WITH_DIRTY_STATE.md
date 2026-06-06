# Dashboard Auto-Reload ohne Eingabeverlust

Stand: 2026-06-06  
Umgesetzt im VIP30 Dashboard ab STEP8.15.

## Grundregel

Auto-Reload darf niemals aktive Benutzereingaben überschreiben.

## VIP30 Umsetzung

```txt
Auto-Refresh alle ca. 10 Sekunden
read-only Statusdaten werden aktualisiert
Config-Eingaben bekommen Dirty-State
fokussierte Eingaben im Config-Tab werden geschützt
```

## Geschützte Felder

```txt
normale Settings
alerts.mediaId
alerts.overlaySets
OverlaySet-Kartenfelder
MediaField
```

## Verhalten

Wenn keine Eingabe aktiv ist:

```txt
Dashboard aktualisiert sichtbar
```

Wenn eine Eingabe aktiv oder dirty ist:

```txt
Serverdaten werden im Hintergrund geholt
Eingaben bleiben sichtbar erhalten
Hinweis: Auto-Reload schützt deine Eingaben
```

## User-Aktionen

```txt
Speichern
Änderungen verwerfen & neu laden
```

## Ziel für weitere Module

Dieses Muster soll bei weiteren Dashboard-Seiten mit Formularen wiederverwendet werden.
