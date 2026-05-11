# STEP181.2 - Hug/Rehug Textpaare Dashboard

Stand: 2026-05-05

## Ziel

Das Hug-Dashboard bekommt im Tab `Texte` eine kategorisierte Bearbeitung fuer gekoppelte Hug/Rehug-Textpaare.

Wichtig:
Ein Hug-Text und seine Rehug-Antwort werden als Paar bearbeitet und gespeichert. Dadurch bleibt garantiert:

```text
Hug-Text 1 -> Rehug-Antwort 1
Hug-Text 2 -> Rehug-Antwort 2
```

Es wird nicht getrennt zufaellig ein Hug- und ein Rehug-Text gezogen.

## Betroffene Dateien

```text
htdocs/dashboard/modules/hug.js
htdocs/dashboard/modules/hug.css
project-state/STEP181_2_HUG_REHUG_TEXT_PAIR_DASHBOARD_2026-05-05.md
```

## Backend-Voraussetzung

Dieser Dashboard-STEP setzt STEP181.1 voraus.

Erwartete Backend-Routen:

```text
GET  /api/dashboard/community/hug/status
GET  /api/dashboard/community/hug/text-pairs
POST /api/dashboard/community/hug/text-pairs
```

## Dashboard-Aenderungen

### Texte-Tab

Neue interne Kategorien:

- Hug/Rehug-Paare
- Chatweite Hugs
- Systemantworten
- Toplisten

In diesem STEP ist nur `Hug/Rehug-Paare` editierbar. Die anderen Kategorien werden bewusst nur sichtbar gemacht und bleiben spaeteren Schritten vorbehalten.

### Hug/Rehug-Paare

Der Editor bietet:

- Typ-Filter
- Suche
- neues Paar anlegen
- vorhandene Paare bearbeiten
- aktiv/inaktiv
- Gewichtung
- Sortierung
- Hug-Text
- passende Rehug-Antwort
- Speichern
- Loeschen

## Bewusst offen

- Bearbeitung von `hug_all`
- Bearbeitung von Systemantworten
- Bearbeitung von Toplisten-Titeln
- Settings-Editor fuer Hug-Konfiguration
- Typen-Verwaltung

## Tests

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center

node -c .\htdocs\dashboard\modules\hug.js
```

Nach Deploy und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/text-pairs" | ConvertTo-Json -Depth 30
```

Dashboard-Test:

1. Community -> Hug-System oeffnen.
2. Tab `Texte` oeffnen.
3. Kategorie `Hug/Rehug-Paare` pruefen.
4. Bestehendes Paar bearbeiten und speichern.
5. Neu laden.
6. Pruefen, ob Hug- und Rehug-Text zusammen erhalten bleiben.

## Keine Funktionalitaet entfernt

Bestehende Tabs bleiben erhalten:

- Uebersicht
- Texte
- Typen
- Config
- Statistiken
- Diagnose

Bestehende Status-/Reload-Funktionen bleiben erhalten.
