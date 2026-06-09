# LWG-4M.1 Architektur – Wheel Scopes und Giveaway Workflow

## 1. Warum diese Trennung nötig ist

Das Glücksrad soll unabhängig von Giveaways nutzbar bleiben:

- per Chat-Befehl
- per Kanalpunkte
- per Dashboard
- per Event/Reward

Gleichzeitig soll ein Giveaway mit Glücksrad ein fest zugehöriges Rad haben, das nicht durch spätere Änderungen an globalen Presets verändert wird.

Deshalb gibt es zwei Scope-Arten:

```text
global
giveaway
```

## 2. Globales Preset

Ein globales Preset ist eine Vorlage und/oder ein normal nutzbares Wheel-Preset.

Eigenschaften:
- global sichtbar
- global editierbar
- global startbar
- als Vorlage für Giveaways auswählbar
- nicht an ein einzelnes Giveaway gebunden

Beispiele:
- Standard-Rad
- Community-Rad
- Event-Rad
- Kanalpunkte-Rad

## 3. Giveaway-gebundenes Wheel

Ein giveaway-gebundenes Wheel entsteht im Kontext eines Giveaways.

Eigenschaften:
- `scope = giveaway`
- `giveawayUid = <Giveaway>`
- `sourcePresetUid = <globales Preset>` optional
- eigener Name aus Giveaway-Name
- nur über dieses Giveaway bearbeitbar
- nicht global startbar
- nicht in normaler Preset-Liste als normales Preset nutzbar
- nur per pending Wheel-Permission nutzbar

## 4. Erstellung in der UI

Im Giveaway-Formular:

```text
Giveaway-Titel:
[ Sommer-Giveaway Juni ]

Giveaway-Typ:
[ Klassisch | Mit Glücksrad ]

Glücksrad-Basis:
[ Dropdown ]
  - Neues Rad für dieses Giveaway erstellen
  - Vorlage kopieren: Standard-Rad
  - Vorlage kopieren: Community-Rad
  - Vorlage kopieren: Event-Rad

Gebundenes Rad:
Sommer-Giveaway Juni – Glücksrad

[ Rad bearbeiten ]
```

Wichtig:
Die Dropdown-Auswahl erzeugt oder ersetzt die giveaway-gebundene Rad-Konfiguration.
Der Button `Rad bearbeiten` öffnet den Preset-/Wheel-Editor im Giveaway-Kontext.

## 5. Editor-Modi

Ein Editor, zwei Modi:

### Global-Modus
```text
context = global
scope = global
name editable = true
visible in global preset list = true
usable by global wheel = true
usable as giveaway template = true
```

### Giveaway-Modus
```text
context = giveaway
scope = giveaway
giveawayUid required
name = <Giveaway-Name> – Glücksrad
name editable = restricted/derived
visible in global preset list = false
usable by global wheel = false
usable only via giveaway permission = true
```

## 6. Draw-Workflow

Giveaway darf nicht direkt aus `open` ausgelost werden.

Richtiger Ablauf:
```text
open
→ close
→ draw
→ waiting_for_wheel oder finished
```

Close:
- setzt Status `closed_for_entries`
- blockiert neue Tickets
- sendet Chatmeldung
- erlaubt später Draw

Draw:
- nur erlaubt, wenn Status `closed_for_entries`
- zieht Gewinner
- bei Wheel-Giveaway erzeugt pending Wheel-Permission
- bei klassischem Giveaway beendet bzw. setzt Winner-Status

## 7. Wichtige Guards

Backend muss verhindern:

- globaler Wheel-Spin mit `scope=giveaway`
- Giveaway-Wheel-Claim mit falschem `giveawayUid`
- Bearbeitung eines giveaway-gebundenen Wheels außerhalb des Giveaway-Kontexts
- Draw aus `open`
- neue Tickets nach `closed_for_entries`
