# CAN-44.21.0.5 – Dashboard Navigation: feste Hauptnavigation + Kategorie-Navigation

Stand: 2026-06-04  
Scope: Ergänzung für späteren dashboardweiten Umbau  
Keine Code-, Backend-, DB- oder Runtime-Änderung.

---

## 1. Grundsatz

Das Navigationsprinzip aus dem Shoutout-Rebuild soll später dashboardweit übernommen werden.

Verbindliche Zielregel:

```text
Die globale Dashboard-Navigation bleibt dauerhaft sichtbar.
Darunter bleibt die Navigation der aktuellen Kategorie bzw. des aktuellen Moduls sichtbar.
```

Damit soll der Nutzer nie die Orientierung verlieren, auch wenn ein Modul lange Seiten, Tabellen oder Formulare enthält.

---

## 2. Globale Dashboard-Navigation

Die linke bzw. übergeordnete Dashboard-Navigation bleibt immer sichtbar.

Zuständig für Hauptbereiche wie:

```text
Live
Control
Community
System
Admin
```

Zielverhalten:

```text
dauerhaft sichtbar
kein Mitscrollen aus dem Sichtbereich
klare aktive Kategorie
dezent im CGN-Design
nicht zu breit
nicht überladen
```

---

## 3. Modul-/Kategorie-Navigation

Innerhalb eines Bereichs bleibt die jeweilige Modulnavigation ebenfalls oben sichtbar.

Beispiele:

```text
Community > Shoutout-System
Community > VIP
Community > Hug
Admin > Diagnose
System > Sound
```

Für Shoutout bedeutet das:

```text
Übersicht
Shoutout
AutoShoutout
Queues
Texte
Auswertung
Diagnose
Einstellungen
```

Diese Navigation bleibt beim Scrollen sichtbar, unterhalb des globalen Dashboard-Headers bzw. unterhalb der übergeordneten Navigation.

---

## 4. Ziel-Layer

Empfohlenes Layout-Prinzip:

```text
1. Globaler Dashboard-Header / Topbar
2. Globale Hauptnavigation / Bereichsnavigation
3. Modulnavigation / Tabs
4. Modulinhalt
```

Beim Scrollen:

```text
Globaler Rahmen bleibt sichtbar
Modul-Tabs bleiben sichtbar
Nur der Inhalt scrollt
```

---

## 5. Designregeln

```text
CGN-Design
dunkel
dezent
aktive Navigation klar mit Lila/Cyan-Akzent
normale Navigation ruhig
kein übertriebener Glow
keine springenden Tabs
keine doppelten Header
```

Aktive Elemente dürfen hervorgehoben werden, aber das Dashboard soll nicht unruhig wirken.

---

## 6. UX-Ziel

Ein unerfahrener Streamer oder Mod soll jederzeit wissen:

```text
Wo bin ich im Dashboard?
In welchem Hauptbereich bin ich?
In welchem Modul bin ich?
Welcher Untertab ist aktiv?
Wie komme ich zurück?
```

Dafür müssen Navigation und Breadcrumbs klar, aber nicht überladen sein.

---

## 7. Umsetzungshinweis für spätere Dashboard-Steps

Beim späteren globalen Dashboard-Umbau prüfen:

```text
Ist die globale Navigation dauerhaft sichtbar?
Bleibt die Modulnavigation beim Scrollen sichtbar?
Überdecken sich Sticky-Elemente nicht?
Stimmen z-index und top-offset?
Ist der aktive Bereich eindeutig?
Ist das Layout auch bei 1080p gut nutzbar?
```

Diese Regel gilt später nicht nur für Shoutout, sondern für alle Dashboard-Module.
