# CAN-44.21.0.3 – Shoutout Dashboard Rebuild Plan: Einsteigerfreundlichkeit

Stand: 2026-06-04  
Scope: Ergänzung zur Planung aus CAN-44.21.0, CAN-44.21.0.1 und CAN-44.21.0.2  
Keine Code-, Backend-, DB- oder Runtime-Änderung.

---

## 1. Grundsatz

Das Shoutout-System soll später nicht nur für Forrest verständlich sein.

Auch ein unerfahrener Streamer soll das Dashboard bedienen können, ohne die interne Technik, Streamer.bot, EventSub, Queues oder Twitch-Scopes im Detail zu kennen.

Verbindliche Regel:

```text
Das Dashboard erklärt Bedienung und Zustand in normaler Streamer-Sprache.
Technische Details werden nur dort gezeigt, wo sie wirklich nötig sind.
```

---

## 2. Sprache und Labels

Technische Begriffe werden vermieden oder erklärt.

Beispiele:

```text
"Official Queue"        → "Offizielle Twitch-Shoutouts"
"Display Queue"         → "Overlay-Shoutouts"
"Live Gate"             → "Nur ausführen, wenn der Stream live ist"
"Cooldown"              → "Wartezeit"
"Force"                 → "Trotz Sperre auslösen" oder "Erzwingen"
"EventSub"              → "Twitch-Ereignisse"
"Scopes"                → "Twitch-Berechtigungen"
"Retry"                 → "Erneut versuchen"
"Remove"                → "Entfernen"
```

Wenn ein technischer Begriff bleiben muss, bekommt er einen kurzen Hilfetext.

---

## 3. UI-Regeln für unerfahrene Streamer

1. Pro Bereich zuerst sagen, wofür er da ist.
2. Nur die wichtigsten Aktionen direkt sichtbar machen.
3. Erweiterte/technische Details einklappen oder in Diagnose/Einstellungen verschieben.
4. Fehler müssen sagen, was zu tun ist, nicht nur was kaputt ist.
5. Warnungen sollen konkrete Handlungsempfehlungen enthalten.
6. Keine langen Rohdatenlisten in normalen Bedienbereichen.
7. Keine doppelten Einstellungen an mehreren Stellen.
8. Buttons müssen eindeutig beschriftet sein.
9. Gefährliche Aktionen brauchen klare Hinweise.
10. Standardwerte sollen verständlich erklärt werden.

---

## 4. Beispiele für gute Hinweise

### Live-Gate

Nicht gut:

```text
liveGate blocked
```

Besser:

```text
Der Stream ist aktuell nicht live. Offizielle Twitch-Shoutouts werden erst ausgeführt, wenn du live bist.
```

---

### Cooldown

Nicht gut:

```text
global cooldown active
```

Besser:

```text
Twitch erlaubt den nächsten offiziellen Shoutout erst in 2 Minuten.
```

---

### EventSub

Nicht gut:

```text
channel.shoutout.receive missing
```

Besser:

```text
Twitch meldet eingehende Shoutouts aktuell nicht an das System. Prüfe die Twitch-Ereignisse in der Diagnose.
```

---

### Queue

Nicht gut:

```text
queued
```

Besser:

```text
Wartet in der Liste und wird automatisch ausgeführt.
```

---

## 5. Ziel je Tab

### Übersicht

Für Einsteiger soll sofort klar sein:

```text
Läuft das System?
Ist der Stream live?
Wartet gerade etwas?
Gibt es ein Problem?
Was ist zuletzt passiert?
```

Keine Fachbegriffe ohne Erklärung.

---

### Shoutout

Für Einsteiger soll klar sein:

```text
Hier kann ich einen Shoutout manuell starten.
```

Nur notwendige Optionen direkt anzeigen.

Erweiterte Option `Erzwingen` nur mit kurzem Hinweis:

```text
Ignoriert bestimmte Sperren. Nur nutzen, wenn du sicher bist.
```

---

### AutoShoutout

Für Einsteiger soll klar sein:

```text
Hier verwalte ich Streamer, die automatisch einen Shoutout bekommen können.
```

Nicht hier erklären:
- globale Cooldowns
- technische Start-Szenen-Logik
- Twitch-EventSub

Das gehört in Einstellungen bzw. Diagnose.

---

### Queues

Für Einsteiger soll klar sein:

```text
Hier siehst du, was noch ausgeführt wird.
```

Aktionen klar benennen:

```text
Erneut versuchen
Entfernen
```

Nicht nur:

```text
Retry
Remove
```

---

### Texte

Für Einsteiger soll klar sein:

```text
Hier änderst du die Chattexte, die das System schreibt.
```

Platzhalter müssen erklärt werden.

Beispiel:

```text
%user% = Name des Streamers
%game% = zuletzt gespieltes Spiel
%link% = Twitch-Link
```

---

### Auswertung

Für Einsteiger soll klar sein:

```text
Hier siehst du, wer Shoutouts bekommen hat und was zuletzt passiert ist.
```

Keine Queue-Aktionen, keine Config.

---

### Diagnose

Für Einsteiger soll klar sein:

```text
Hier prüfst du, warum Shoutouts eventuell nicht funktionieren.
```

Technische Begriffe dürfen vorkommen, müssen aber erklärt werden.

Admin-Diagnose bleibt getrennt.

---

### Einstellungen

Für Einsteiger soll klar sein:

```text
Hier stellst du ein, wie sich das Shoutout-System grundsätzlich verhalten soll.
```

Einstellungen brauchen:
- verständliche Namen
- kurze Erklärung
- sinnvolle Gruppierung
- Standardwert-Hinweis, wenn möglich

---

## 6. Hilfetexte und Expertenmodus

Empfohlenes Prinzip:

```text
Standardansicht = einfach und verständlich
Details = einklappbar
Experten-/Diagnoseinformationen = nur bei Bedarf sichtbar
```

Beispiele:

```text
[Details anzeigen]
[Technische Diagnose anzeigen]
[Erweiterte Einstellungen]
```

So bleibt das Dashboard für unerfahrene Streamer verständlich, ohne wichtige Informationen zu verstecken.

---

## 7. Auswirkung auf spätere Umsetzung

Ab CAN-44.21.1 muss jeder neu gebaute Bereich diese Fragen beantworten:

```text
Versteht ein unerfahrener Streamer, was dieser Bereich macht?
Sind technische Begriffe erklärt?
Sind gefährliche Aktionen klar markiert?
Gibt es doppelte Informationen?
Gehört diese Information wirklich in diesen Tab?
Kann ein Mod diesen Bereich gefahrlos nutzen?
```

Wenn eine Antwort unklar ist, muss der Bereich vereinfacht oder verschoben werden.
