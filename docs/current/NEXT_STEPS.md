# NEXT_STEPS – stream-control-center

Stand: 2026-06-11

## Direkt nächster sinnvoller Schritt

Kein weiterer Code-Step, bevor die UI wieder ruhig und einzeln geprüft wurde.

Empfohlener nächster Arbeitsschritt:

```text
LWG-4Q.12 – Minimaler Einzel-UI-Test / Dashboard Verification
```

Ziel: Nicht automatisiert alles auf einmal prüfen, sondern jeweils nur einen einzigen UI-Punkt.

## Empfohlene Reihenfolge

### 1. Einzeltest Classic-Formular

```text
Ein Classic-Draft-Giveaway erstellen.
Bearbeiten öffnen.
Prüfen:
- Gewinneranzahl nicht sichtbar
- Gewinn-Menge nicht sichtbar
- Rundenmodus nicht sichtbar
- Ticket-Übernahme nicht sichtbar
- Chat-Claim Checkbox sichtbar
- Timeout/Claim-Modus nur bei aktivierter Checkbox sichtbar
Danach Giveaway hard-delete löschen.
```

### 2. Einzeltest Wheel ohne Bound-Wheel

```text
Ein Wheel-Draft ohne gültiges Bound-Wheel erstellen.
Prüfen:
- Button „Glücksrad erstellen“ sichtbar
- Kein „Glücksrad bearbeiten“, solange kein Bound-Wheel existiert
Danach Giveaway hard-delete löschen.
```

### 3. Einzeltest Wheel mit Bound-Wheel

```text
Ein Wheel-Draft mit Bound-Wheel und mindestens einem Feld erstellen.
Prüfen:
- Button „Glücksrad bearbeiten“ sichtbar
- Editor öffnet im neuen Giveaway-Control als Modal/Fenster, nicht in der alten Inline-Seite
Danach Giveaway hard-delete löschen.
```

### 4. Einzeltest Routing

```text
Links Loyalty öffnen.
Kachel Giveaways anklicken.
Erwartung: neues Giveaway-Control.
Oben Tab Giveaways anklicken.
Erwartung: ebenfalls neues Giveaway-Control.
Keine alte Inline-Giveaway-Seite.
```

## Danach

Wenn die UI-Prüfung sauber ist:

```text
LWG-4Q.12 Dokumentation bestätigen
GitHub/dev und Live-Ziel bewusst synchronisieren
```
