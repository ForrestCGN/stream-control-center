# NEXT_STEPS – stream-control-center

Stand: 2026-06-12

## Direkt nächster sinnvoller Schritt

Nach STEP235 ist der Dashboard-/Loyalty-Rahmen bereinigt. Der nächste sinnvolle Schritt ist kein großer Umbau, sondern eine gezielte kleine Prüfung/Entscheidung:

```text
STEP235O – Gamble Config Actor-/Rollenfelder prüfen
```

Ziel:

```text
Prüfen, ob actorLogin/actorRole im Gamble-Config-Tab noch sichtbar bleiben sollen oder ob sie aus der normalen UI verschwinden und später aus echter Dashboard-Session/Rechten kommen.
```

Wichtig:

```text
Keine Backend-Änderung ohne neuen Prüfblock.
Keine Rechte-/Session-Logik erfinden.
Keine Gamble-Funktion entfernen.
```

## Danach mögliche Reihenfolge

### 1. STEP235O – Actor-/Rollenfelder

```text
Loyalty → Config → Gamble prüfen.
Actor-/Rollenfelder bewerten.
Entscheiden:
- vorerst sichtbar lassen
- aus normaler UI entfernen und festen safe default nutzen
- später echte Session-/Rechtequelle anbinden
```

### 2. LWG-4Q.12 – Minimaler Einzel-UI-Test / Dashboard Verification

Weiterhin gültig, aber erst nach der Dashboard-Rahmenbereinigung:

```text
Ein Classic-Draft-Giveaway erstellen.
Genau einen UI-Punkt prüfen.
Danach Giveaway hard-delete löschen.
```

Keine großen UI-assisted Scripts.

### 3. Giveaways-UI kleinteilig prüfen

Prüfen:

```text
Gewinneranzahl nicht sichtbar
Gewinn-Menge nicht sichtbar
Rundenmodus nicht sichtbar
Ticket-Übernahme nicht sichtbar
Chat-Claim-Felder nur bei aktivierter Checkbox sichtbar
Wheel-Gewinnpflege ausschließlich über Bound-Wheel/Glücksrad-Editor
```

### 4. Routing prüfen

```text
Loyalty öffnen.
Kachel Giveaways anklicken.
Oberen Tab Giveaways anklicken.
Erwartung: neues Giveaway-Control, keine alte Inline-Giveaway-Seite.
```

## Nicht wiederholen

```text
Keine STEP232-/Standalone-Gamble-Basis mehr verwenden.
Keine großen UI-assisted Scripts mit mehreren parallelen Testfällen.
Keine PowerShell-Scripts mit ungetesteter JS-Syntax wie ||.
Keine Annahmen über Backend-Abläufe treffen, wenn ein API-Test das echte Verhalten zeigen kann.
```
