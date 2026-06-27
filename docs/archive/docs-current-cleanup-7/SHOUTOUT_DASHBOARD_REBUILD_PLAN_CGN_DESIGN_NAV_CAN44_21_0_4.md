# CAN-44.21.0.4 – Shoutout Dashboard Rebuild Plan: CGN-Design & feste Hauptnavigation

Stand: 2026-06-04  
Scope: Ergänzung zur Planung aus CAN-44.21.0 bis CAN-44.21.0.3  
Keine Code-, Backend-, DB- oder Runtime-Änderung.

---

## 1. Grundsatz

Das Shoutout-Dashboard soll vollständig im CGN-/ForrestCGN-Design aufgebaut werden.

Verbindliche Regel:

```text
Komplett CGN-Design, aber dezent.
Die Hauptnavigation bleibt oben immer sichtbar.
```

Das Design soll hochwertig, ruhig und verständlich wirken – nicht überladen, nicht grell, nicht verspielt.

---

## 2. CGN-Designrichtung

Basis:

```text
dunkler Hintergrund
Neon-Lila
Cyan/Blau als Akzent
Glass-/Panel-Look
dezenter Glow
runde Ecken
klare Kartenstruktur
ruhige Abstände
```

Wichtig:

```text
Neon nur als Akzent.
Nicht jedes Element darf leuchten.
Aktive Elemente dürfen stärker hervorgehoben werden.
Normale Inhalte bleiben ruhig und gut lesbar.
```

---

## 3. Hauptnavigation

Die Hauptnavigation des Shoutout-Moduls bleibt oben sichtbar.

Ziel:

```text
Tabs bleiben beim Scrollen sichtbar.
Man verliert nie die Orientierung.
Keine Navigation am Seitenende.
Keine springenden Tabs.
Keine DOM-Injection für Haupttabs.
```

Technische Zielidee:

```text
position: sticky;
top: passender Dashboard-Header-Offset;
z-index sauber unter globalem Header, aber über Modulinhalt;
```

Falls das globale Dashboard bereits eine feste Topbar hat, muss der Sticky-Abstand daran angepasst werden.

---

## 4. Navigation optisch

Normale Tabs:

```text
dunkel/dezent
leicht transparenter Hintergrund
feine Border
gut lesbare Schrift
kein starker Glow
```

Aktiver Tab:

```text
Lila/Cyan-Akzent
dezenter Glow
klar erkennbar
nicht grell
```

Hover:

```text
leichte Aufhellung
dezenter Rahmen
kein starkes Springen
```

---

## 5. Layout-Regeln

1. Hauptnavigation oben immer sichtbar.
2. Inhalte darunter scrollen.
3. Keine doppelten Header wie:
   - Shoutout-System
   - Shoutout-Dashboard
   - Shoutout-System
4. Ein klarer Hero-/Statusbereich reicht.
5. Karten sollen gleichmäßig wirken.
6. Große Tabellen begrenzen und bei Bedarf scroll-/einklappbar machen.
7. Aktionen sollen dort sitzen, wo man sie erwartet.
8. Wichtige Statusinformationen oben, Details darunter.
9. Keine unruhigen Refresh-/Render-Effekte.
10. Auto-Refresh darf Scrollposition und Eingaben nicht zerstören.

---

## 6. Dezent statt überladen

Erlaubt:

```text
feiner Neon-Rand
kleiner Runner-/Glow-Akzent
aktive Tab-Hervorhebung
Status-Badges mit klaren Farben
leichte Glass-Panels
```

Vermeiden:

```text
zu viele leuchtende Rahmen gleichzeitig
zu viele Farbverläufe
zu große Glow-Flächen
mehrere konkurrierende Header
technische Rohdaten direkt in Hauptansichten
blinkende oder springende Elemente
```

---

## 7. Einsteigerfreundlichkeit im Design

CGN-Design darf die Bedienbarkeit nicht überdecken.

Wichtig:

```text
Labels bleiben klar lesbar.
Buttons sind eindeutig.
Fehler und Warnungen sind gut erkennbar.
Texte haben ausreichend Kontrast.
Formulare sind nicht zu eng.
```

Der Look soll professionell wirken, aber nicht von der Funktion ablenken.

---

## 8. Auswirkung auf spätere CAN-Steps

Ab CAN-44.21.1 muss jeder UI-Step prüfen:

```text
Ist die Hauptnavigation oben sichtbar?
Ist das Design CGN-konform?
Ist der Glow dezent?
Gibt es doppelte Header?
Bleibt die Seite beim Scrollen stabil?
Ist der aktive Bereich klar erkennbar?
Ist die Bedienung für Mods und unerfahrene Streamer verständlich?
```

Diese Prüfung gilt für alle folgenden Shoutout-Dashboard-Rebuild-Steps.
