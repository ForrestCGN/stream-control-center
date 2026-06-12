# NEXT_STEPS – stream-control-center

Stand: 2026-06-12

## Direkt nächster sinnvoller Schritt

Nach STEP235S ist der Gamble-Config-Cleanup im Loyalty-Dashboard abgeschlossen.

Empfohlen:

```text
LWG-4Q.12 – Giveaways-UI nach LWG-4Q.11 klein und manuell prüfen
```

## Empfohlene Reihenfolge

### 1. Einzeltest Classic-Formular

```text
Ein Classic-Draft-Giveaway erstellen.
Bearbeiten öffnen.
Genau prüfen:
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
- Editor öffnet im neuen Giveaway-Control als Modal/Fenster
Danach Giveaway hard-delete löschen.
```

### 4. Routing prüfen

```text
Links Loyalty öffnen.
Kachel Giveaways anklicken.
Oberen Tab Giveaways anklicken.
Erwartung: neues Giveaway-Control.
Keine alte Inline-Giveaway-Seite.
```

## Später, nicht jetzt

```text
Echtes Dashboard-Rechtesystem anbinden.
getDashboardActor() auf echte Sessiondaten umstellen.
Config-Dropdown für weitere Loyalty-Bereiche ausbauen.
```

## Nicht wiederholen

```text
Keine STEP232-/Standalone-Gamble-Basis mehr verwenden.
Keine großen UI-assisted Scripts mit mehreren parallelen Testfällen.
Keine PowerShell-Scripts mit ungetesteter JS-Syntax wie ||.
Keine Annahmen über Backend-Abläufe treffen, wenn ein API-Test das echte Verhalten zeigen kann.
```
