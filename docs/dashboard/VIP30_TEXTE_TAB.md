# VIP30 Dashboard – Texte Tab

Stand: 2026-06-06

## Zweck

Im Tab `Texte` werden die VIP30-Overlay-Zufallstexte verwaltet.

## Setting

```txt
alerts.overlaySets
```

## Felder

```txt
ID
aktiv/deaktiviert
Gewichtung
Kicker
Headline
Subline
Message
Perks/Chips
Brand
```

## Platzhalter

```txt
{displayName}
{userDisplayName}
{login}
{userLogin}
```

## Zufall

Textauswahl erfolgt gewichtet:

```txt
weight 3 -> häufiger
weight 1 -> normal
weight 0 oder enabled false -> nicht auswählen
```
