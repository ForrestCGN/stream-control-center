# STEP199.4 - TTS Dashboard Statistik-Feinschliff

Stand: 2026-05-08

## Ziel

Der TTS User-Statistik-Tab bekommt einen ersten UX-/Layout-Feinschliff, ohne Backend-Logik oder Datenmodell zu veraendern.

## Geaenderte Datei

- `htdocs/dashboard/modules/tts.css`

## Aenderungen

- Statistik-Kopfbereich besser ausgerichtet.
- Zeitraum-/Sortierfilter responsiver angeordnet.
- Tabellenkopf sticky gemacht.
- Tabellenzeilen bekommen Hover-Markierung.
- User-Subline in Tabellen besser lesbar.
- Zahlen-Spalten mit tabular-numeric/fetter Darstellung.
- User-Statistik-Tabelle bekommt eine sinnvolle maximale Hoehe.
- Kleine Dark-/Light-Theme-Anpassungen fuer Tabellenkopf.
- Mobile Darstellung fuer Statistik-Filter verbessert.

## Bewusst nicht geaendert

- keine Backend-Aenderung
- keine neue Route
- keine neue Datei ausser dieser Doku
- keine Aenderung an TTS-Playback, Queue oder Sound-System
- keine Aenderung an DB-Strukturen

## Tests nach Deploy

Browser:

```text
/dashboard -> System -> TTS -> User-Statistik
```

Pruefen:

1. Filter stehen sauber oben rechts bzw. mobil untereinander.
2. KPI-Kacheln bleiben lesbar.
3. Tabelle scrollt sauber.
4. Tabellenkopf bleibt beim Scrollen sichtbar.
5. Hover-Zeile ist sichtbar, aber nicht zu stark.
6. Dark-/Light-Mode bleibt lesbar.

## Naechster sinnvoller Schritt

Optional spaeter:

- CSV-Export fuer User-Statistik.
- Klickbare Sortierung direkt ueber Tabellenkoepfe.
- Fachliche Settings-Formulare statt Raw-JSON im Settings-Tab.
- TTS-Texte ins globale DB-basierte Textvarianten-System migrieren.
