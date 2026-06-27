# CURRENT CHAT HANDOFF – LWG-4M.1

## Ziel
Die weitere Umsetzung des Loyalty-Giveaway-/Glücksrad-Systems wird auf eine feste Architektur gestellt.

## Bestätigte Ausgangslage
- `!ticket` Runtime ist getestet.
- `!wheel` / `!rad` Runtime ist getestet.
- Kostenpflichtige Tickets bleiben ohne Punktebuchung blockiert.
- Wheel-Claim mit pending Permission funktioniert.
- Zentrales `commands`-System ist Source of Truth für Chat-Command-Aktivierung.

## Neue verbindliche Vorgaben

### Giveaway Workflow
Giveaways laufen künftig fachlich so:

1. `draft` / erstellt
2. `open` / aktiv
3. `closed_for_entries` / geschlossen
4. `drawn` oder `waiting_for_wheel`
5. `finished`

Wichtig:
- Ein aktives Giveaway wird zuerst geschlossen.
- Das Schließen beendet neue Teilnahmen.
- Beim Schließen soll eine Chatmeldung gesendet werden.
- Erst danach darf ausgelost werden.
- Draw per Dashboard-Button oder später Mod-Befehl.

### Wheel-Konzept
Es gibt zwei Wheel-Kontexte:

#### Globales Wheel
- Nutzbar ohne Giveaway.
- Nutzbar über Befehle, Kanalpunkte, Dashboard-Spin oder andere Events.
- Nutzt globale Presets.
- Globale Presets werden in der normalen Preset-Verwaltung erstellt/bearbeitet.

#### Giveaway-gebundenes Wheel
- Wird beim Erstellen/Bearbeiten eines Wheel-Giveaways erzeugt.
- Basiert optional auf einem globalen Preset, aber wird als eigene gebundene Kopie gespeichert.
- Gehört exklusiv zu genau einem Giveaway.
- Darf nur über dieses Giveaway bearbeitet werden.
- Darf nicht über normale Wheel-Befehle/Kanalpunkte/globalen Spin direkt genutzt werden.
- Darf nur über pending Wheel-Permission des Giveaway-Gewinners per `!wheel` / `!rad` eingelöst werden.

### UI-Regel
In der Giveaway-Erstellung wird kein Button-Chaos genutzt, sondern ein Dropdown:

- `Neues Rad für dieses Giveaway erstellen`
- `Vorlage kopieren: <globales Preset>`
- ggf. später `Bestehendes Giveaway-Rad bearbeiten`

Nach Auswahl entsteht ein giveaway-gebundenes Wheel.

### Namensregel
Der Name des gebundenen Wheels wird aus dem Giveaway-Namen gebildet:

- `<Giveaway-Name> – Glücksrad`

Während `draft` folgt der Wheel-Name dem Giveaway-Namen automatisch.
Nach `open` bleibt der Name stabil, außer Bearbeitung erfolgt bewusst im Giveaway-Kontext.

## Nächste technische Steps
- LWG-4M.2 Backend: Close-Endpoint/Statuswechsel + Chattext/Event vorbereiten.
- LWG-4M.3 Backend: Draw nur noch aus `closed_for_entries` erlauben.
- LWG-4M.4 Backend: Giveaway-bound Wheel Copy/Scope sauber speichern.
- LWG-4M.5 Dashboard: Giveaway-Erstellung mit Wheel-Dropdown.
- LWG-4M.6 Dashboard: Preset-Editor als Modal mit Kontext `global` oder `giveaway`.
