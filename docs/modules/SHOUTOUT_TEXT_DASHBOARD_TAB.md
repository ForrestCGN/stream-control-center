# Shoutout-System – Texte-Tab

Stand: CAN-44.19.2

## Zweck

Der Texte-Tab ist der gemeinsame Editor für Shoutout-Texte im Shoutout-System.

Er ist für folgende Bereiche vorbereitet:

- Chat-Shoutout
- AutoShoutout
- offizieller Twitch-Shoutout
- Systemmeldungen
- Legacy/Fallback-Texte

## Routen

- `GET /api/clip-shoutout/texts`
- `POST /api/clip-shoutout/texts`
- `GET /api/clip-shoutout/texts/migration`

## Zielstandard

Die Texte werden über den bestehenden Helper-Standard verwaltet:

- `helper_texts`
- `module_text_variants`
- Kategorien wie `shoutout.chat`, `shoutout.auto`, `shoutout.official`, `shoutout.system`

## Aktuelles Dashboard-Layout

Seit CAN-44.19.2 nutzt der Texte-Tab ein kompaktes Dropdown-Layout:

1. Kategorie-Auswahl
2. Text-Key-Auswahl
3. Editor mit einzelnen Variantenfeldern
4. Migration / Kompatibilität als eingeklappter Diagnoseblock

Das Layout ist bewusst responsiver als das vorherige Listen-/Spaltenlayout und soll bei unterschiedlichen Auflösungen kontrollierter umbrechen.

## Kompatibilität

- Legacy-Key `auto.greeting` bleibt sichtbar und erhalten.
- Neue Zielkeys liegen unter `shoutout.*`.
- Runtime-Fallbacks bleiben bestehen, bis die Runtime später bewusst auf die neuen Keys umgestellt wird.

## Abgrenzung

CAN-44.19.2 ändert nur die Oberfläche des Text-Tabs. Es gibt keine Backend-, DB- oder Runtime-Änderung.


## CAN-44.19.3 Dropdown Polish

Der Dropdown-Editor wurde optisch leicht nachgebessert: korrekte Schreibweise im Beschreibungstext, stabile Kategorie-Pill im Editor und kein Entfernen-Button mehr bei nur einer vorhandenen Variante.
