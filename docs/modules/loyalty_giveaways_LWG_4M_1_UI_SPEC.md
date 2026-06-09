# LWG-4M.1 UI-Spezifikation – Giveaway + Wheel Dropdown

## Giveaway-Erstellung

Felder:
- Titel
- Beschreibung
- Modus: Klassisch / Glücksrad-Giveaway
- Ticketkosten
- Max Tickets pro User
- Gewinneranzahl

Wenn Glücksrad aktiv:
- Dropdown `Glücksrad-Basis`
- Anzeige `Gebundenes Rad`
- Aktion `Rad bearbeiten`

## Dropdown-Einträge

```text
Neues Rad für dieses Giveaway erstellen
Vorlage kopieren: <Preset-Name>
Vorlage kopieren: <Preset-Name>
...
```

Nicht erlaubt:
```text
Globales Preset direkt verwenden
```

## Namenslogik

Beim Erstellen:
```text
boundWheelName = "<Giveaway-Name> – Glücksrad"
```

Wenn Giveaway-Titel im Draft geändert wird:
```text
boundWheelName wird automatisch angepasst
```

Nach Open:
```text
boundWheelName bleibt stabil
```

## Preset-/Wheel-Editor Modal

Gleiches Modal für global und giveaway.

### Global geöffnet über Preset-Seite
- Titel: `Glücksrad-Preset erstellen/bearbeiten`
- Name frei editierbar
- Speichert globales Preset
- Sichtbar in globaler Liste

### Geöffnet über Giveaway
- Titel: `Glücksrad für dieses Giveaway bearbeiten`
- Name aus Giveaway abgeleitet
- Name ggf. nur lesbar oder mit festem Prefix/Suffix
- Speichert giveaway-gebundenes Wheel
- Nicht global sichtbar
- Nicht global startbar
