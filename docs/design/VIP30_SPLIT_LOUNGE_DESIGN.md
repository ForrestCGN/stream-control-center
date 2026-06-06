# VIP30 / CGN Split Lounge Design

Stand: 2026-06-06  
Referenzname: **VIP30 Split Lounge / Design 05**  
Übergeordnete Stilbasis: **CGN Split Lounge Designsystem**

## Wichtig

Dieses Dokument beschreibt die konkrete VIP30-Ausprägung.

Die allgemeine, wiederverwendbare Designbasis liegt hier:

```txt
docs/design/CGN_SPLIT_LOUNGE_DESIGN.md
```

VIP30 ist die Ursprungsversion dieses Designsystems, aber spätere Module sollen es an die jeweilige Situation anpassen.

## VIP30-Ausprägung

```txt
links: Avatar + "30 Tage VIP"
rechts: Kicker, Headline, Subline, Message, Perks, Brand
```

## VIP30-Textfelder

```txt
kicker
headline
subline
message
perks[]
brand
displayName
login
avatarUrl
```

## VIP30-Tonalität

VIP30 soll wie eine freundliche Heimleitungsdurchsage wirken:

```txt
kleines Upgrade
Ehrenbewohner
Keks extra
Klecks Soße mehr
gemütlicherer Sessel
etwas weniger Zugluft
```

Wichtig: VIP ist humorvoll gemeint und wertschätzend, aber nicht so formuliert, als würden andere Zuschauer schlechter behandelt.

## Beispiel

```json
{
  "kicker": "Upgrade im CGN-Altersheim",
  "headline": "{displayName} wird Ehrenbewohner.",
  "subline": "Die Rentner begrüßen freundlich, die Heimleitung nickt anerkennend.",
  "message": "Ein kleines VIP-Upgrade wurde genehmigt.",
  "perks": ["Keks extra", "Klecks Soße mehr", "gemütlicherer Sessel"],
  "brand": "CGN VIP-Lounge"
}
```

## Wiederverwendung

Für andere Module bitte nicht blind VIP30 kopieren, sondern die allgemeine Referenz nutzen:

```txt
CGN Split Lounge
```

Dann pro Situation anpassen:

```txt
Avatar/Icon links
Label passend zum Modul
Headline passend zum Ereignis
Chips/Perks passend zur Aktion
Brand passend zum Modul
```
