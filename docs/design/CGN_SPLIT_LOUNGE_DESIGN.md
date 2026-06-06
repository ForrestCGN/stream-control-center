# CGN Split Lounge Designsystem

Stand: 2026-06-06  
Referenzname: **CGN Split Lounge**  
Ursprung: **VIP30 Design 05 – Split Lounge**  
Status: verbindliche Stilreferenz für passende zukünftige CGN-/Altersheim-/Community-Overlays.

## Wichtig

Dieses Design ist **kein starres 1:1-Template**.

Es ist eine flexible Designbasis. Die Grundstruktur, der Neon-Lounge-Look und die visuelle Wertigkeit bleiben erhalten, aber Inhalte, Icons, Farbenintensität, Chips und Texte werden je nach Situation angepasst.

## Grundprinzip

```txt
Dunkle Neon-Lounge-Card
+ linker Identitäts-/Icon-/Avatarbereich
+ rechter Informationsbereich
+ Kicker
+ Headline
+ Subline
+ optionale Message
+ Chips/Perks/Status-Zeile
+ kleines CGN-Branding
```

## Ursprungsversion

Die erste konkrete Umsetzung ist:

```txt
VIP30 Design 05 – Split Lounge
```

Dabei nutzt VIP30:

```txt
links: Avatar + "30 Tage VIP"
rechts: Kicker, Headline, Subline, Message, Perks, Brand
```

## Basislayout

Empfohlene Standardgröße für Alerts/Overlays:

```txt
Breite: 840px
Höhe:   310px
Radius: 34px
Position: Bildschirmmitte
```

Der linke Bereich ist ein fester Identitätsbereich:

```txt
Breite: ca. 245px
Inhalt: Avatar, Icon, Badge oder Modul-Symbol
Label: kurzer Kontext wie "30 Tage VIP", "Geburtstag", "Hug-Alarm"
```

Der rechte Bereich ist der Informationsbereich:

```txt
Kicker: kurzer Oberbegriff
Headline: wichtigste Nachricht
Subline: erklärender Satz
Message: optionaler Zusatzsatz
Chips: Status, Perks, Tags, kleine Details
Brand: dezentes Modul-/CGN-Branding
```

## Farbsystem

Grundfarben:

```txt
Hintergrund dunkel: sehr dunkles Blau/Schwarz
Sekundär: dunkles Violett
Glasflächen: leicht transparente dunkle Ebenen
```

Neon-Akzente:

```txt
Cyan:    #22d3ee
Violett: #a855f7
Pink:    #e879f9
```

Typische Effekte:

```txt
weicher Glow
Neon-Verlaufsrahmen
Conic-Gradient bei Avatar/Icon
Radial-Glow im linken Bereich
dünne horizontale Trennlinie
abgerundete Chips
```

## Typografie

Empfohlen:

```txt
Font: Segoe UI / System UI
Kicker: klein, uppercase, letter-spacing
Headline: groß, fett, leicht negativ gespaced
Subline: mittelgroß, gut lesbar
Message: kleiner und ruhiger
Chips: klein, fett, kompakt
```

## Wiederverwendung nach Situation

### VIP30

```txt
links: Avatar
Label: 30 Tage VIP
Kicker: Upgrade im CGN-Altersheim
Headline: {displayName} wird Ehrenbewohner.
Chips: Keks extra, Klecks Soße mehr, gemütlicherer Sessel
Ton: freundliche Heimleitungsdurchsage
```

### Geburtstag

```txt
links: Avatar, Geschenk, Kuchen oder Kerze
Label: Geburtstag
Kicker: Geburtstagsdurchsage
Headline: Alles Gute, {displayName}!
Chips: Kuchen, Kerze, Heimchor, Partyhut
Ton: herzlich, feierlich, CGN-Altersheim-humorvoll
```

### Hug-System

```txt
links: Avatar, Herz oder Knuddel-Icon
Label: Hug-Alarm
Kicker: Knuddelrunde im CGN-Heim
Headline: {sender} knuddelt {target}.
Chips: Wärmelevel, Rehug, Gruppenknuddel
Ton: warm, freundlich, nicht zu laut
```

### Shoutout

```txt
links: Avatar des Streamers
Label: Shoutout
Kicker: Besuch aus dem Nachbarheim
Headline: Schaut bei {displayName} vorbei!
Chips: Spiel, Kanal, Follow-Hinweis
Ton: wertschätzend, werbend, nicht überladen
```

### Tagebuch / Todo / Heimleitungsnotiz

```txt
links: Icon statt Avatar
Label: Notiz / Todo / Tagebuch
Kicker: Heimleitungsnotiz
Headline: Neuer Eintrag gespeichert.
Chips: Modul, Quelle, Status
Ton: ruhig, informativ, funktional
```

### Kanalpunkte / Rewards

```txt
links: Reward-Icon oder Avatar
Label: Kanalpunkte
Kicker: Belohnung eingelöst
Headline: {displayName} hat {rewardTitle} eingelöst.
Chips: Kosten, Kategorie, Status
Ton: belohnend, aber nicht übertrieben
```

## Anpassungsregeln

Beim Übertragen auf neue Module gilt:

```txt
1. Linken Bereich an Kontext anpassen: Avatar, Icon, Badge oder Symbol.
2. Label kurz halten.
3. Headline klar und groß.
4. Subline darf den CGN-/Altersheim-Humor tragen.
5. Chips nur für kurze Begriffe nutzen.
6. Brand klein und dezent halten.
7. Nicht zu viele Farben auf einmal.
8. Kein aggressives Blinken oder hektische Animationen.
```

## Text-Tonalität

Das Design passt zu freundlichen, leicht humorvollen Einblendungen.

Bevorzugt:

```txt
Heimleitung
Rentner
CGN-Heim
Ehrenbewohner
kleines Upgrade
freundliches Nicken
Keks extra
Klecks Soße mehr
weniger Zugluft
```

Vermeiden:

```txt
übertriebener Luxus
harte Premium-Sprache
andere Zuschauer abwerten
zu viel Kirmes/Alarm
zu viele Emojis
zu grelles Dauerleuchten
```

## Technische Visual-Felder

Empfohlenes generisches Visual-Objekt:

```json
{
  "module": "vip30",
  "layout": "split_lounge",
  "type": "success",
  "displayName": "Test-VIP",
  "login": "testuser",
  "avatarUrl": "",
  "icon": "",
  "label": "30 Tage VIP",
  "kicker": "Upgrade im CGN-Altersheim",
  "headline": "Test-VIP wird Ehrenbewohner.",
  "subline": "Die Rentner begrüßen freundlich, die Heimleitung nickt anerkennend.",
  "message": "Ein kleines VIP-Upgrade wurde genehmigt.",
  "chips": ["Keks extra", "Klecks Soße mehr", "gemütlicherer Sessel"],
  "brand": "CGN VIP-Lounge",
  "durationMs": 9000
}
```

VIP30 nutzt aktuell statt `chips` das Feld:

```txt
perks[]
```

Für spätere allgemeine Module kann `chips[]` bevorzugt werden. VIP30 darf `perks[]` behalten.

## Beziehung zu VIP30

Die VIP30-spezifische Dokumentation bleibt erhalten:

```txt
docs/design/VIP30_SPLIT_LOUNGE_DESIGN.md
```

Diese allgemeine Referenz ist die übergeordnete Designbasis:

```txt
docs/design/CGN_SPLIT_LOUNGE_DESIGN.md
```

## Status

Dieses Designsystem ist als künftige Stilbasis zu verwenden, wenn ein Overlay eine hochwertige, ruhige, CGN-/Altersheim-kompatible Card benötigt.
