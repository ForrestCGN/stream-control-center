# STEP190.3 - SoundAlerts Priority Standard UX

Stand: 2026-05-06

## Zweck

UI-Korrektur fuer SoundAlerts-Eintraege: Prioritaet soll nicht mehr als rohe Pflichtzahl bzw. "Prio 70" im Vordergrund stehen.

## Geaendert

Betroffene Dateien:

```text
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

### Prioritaetslogik im Dashboard

Vorher:

```text
Prioritaet: 70
Liste: Prio 70
```

Jetzt:

```text
Kategorie bestimmt den Standard.
Prioritaet ist nur noch ein optionaler Override.
```

Die Liste zeigt jetzt sinngemaess:

```text
Standard / global · Standard 70
Kanalpunkte / SoundAlert · Standard 70
Alert / Support · Standard 80
Kanalpunkte / SoundAlert · Eigene Prioritaet 75 · Standard 70
```

### Editor

Das Feld heisst jetzt:

```text
Prioritaet ueberschreiben
```

Leerer Wert bedeutet:

```text
Kategorie-Standard verwenden
```

Beim Wechsel der Kategorie wird die Prioritaet nicht mehr automatisch als feste Zahl eingetragen. Stattdessen wird nur der Platzhalter/Hinweis aktualisiert.

### Speichern

Wenn das Override-Feld leer bleibt, wird `priority` als `null` gespeichert. Dadurch kann das Backend/die SoundAlerts-Config den Kategorie-Standard nutzen.

Wenn ein eigener Wert eingetragen wird, wird dieser als bewusster Override gespeichert.

## Nicht geaendert

- Keine Backend-Aenderung.
- Keine DB-Aenderung.
- Keine API-Aenderung.
- Bestehende SoundAlert-Eintraege bleiben kompatibel.
- Events und Aktionsbuttons bleiben aus STEP190.1 erhalten.
- Layout-Cleanup aus STEP190.2 bleibt erhalten.

## Test

Syntax:

```text
node -c htdocs/dashboard/modules/soundalerts.js
```

Erwartung:

```text
OK
```

Manueller Test:

1. SoundAlerts -> Eintraege oeffnen.
2. Kategorie wechseln.
3. Prio-Feld bleibt leer, wenn kein Override gesetzt ist.
4. Hinweis zeigt neuen Kategorie-Standard.
5. Liste zeigt `Standard 70` statt `Prio 70`.
6. Eigenen Wert eintragen, speichern, erneut laden.
7. Liste zeigt `Eigene Prioritaet X`.

## Offen

- Sound-System-Kategorien/Prioritaeten koennen spaeter dynamisch aus `/api/sound/status` gelesen werden.
- Server-seitige SoundAlert-Inbox aus STEP189 ist noch nicht umgesetzt.
