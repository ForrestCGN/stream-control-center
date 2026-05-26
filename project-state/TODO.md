# TODO / Offene Punkte

Diese Datei ist die zentrale ToDo-/Offene-Punkte-Liste für das Projekt `stream-control-center`.

Regel:

- Offene Ideen, Bugs, spätere Umbauten und bewusst verschobene Aufgaben hier festhalten.
- Erledigte Punkte im passenden STEP aus dieser Datei entfernen oder als erledigt markieren, wenn die Historie wichtig ist.
- Unmittelbare Einbau-/Testschritte gehören zusätzlich nach `project-state/NEXT_STEPS.md`.
- Modulbezogene Zusatzlisten sind erlaubt, wenn ein Thema groß genug wird.

## Aktuell offen

### Shoutout-System

- Shoutout-Dashboard in Tabs/Unterbereiche aufteilen, damit nicht alles auf einer Seite steht.
- Gewünschte Tabs/Unterbereiche:
  - Übersicht
  - Queues
  - Statistik
  - Timeline
  - Settings/Test
- Eingehende Twitch-Shoutouts loggen und im Dashboard/statistisch anzeigen.
- Prüfen, welche Twitch EventSub-Events und Scopes dafür im bestehenden Twitch-/EventSub-System bereits verfügbar sind.
- Inbound-Statistik getrennt von Outbound-Statistik darstellen.

### Stream-Status

- `stream_status` bei echtem Streamstart/Streamende live testen.
- Prüfen, ob Twitch-Live-Verzögerung mit Restart-Grace/Sessionlogik sauber abgefangen wird.
- Weitere Module schrittweise auf zentralen Stream-Status umstellen, statt eigene Datei-/Livechecks zu verwenden.

### Dashboard allgemein

- Große Module konsequent in Tabs/Unterbereiche aufteilen.
- Dashboard-Ausgaben schlank halten und nicht mit Technikboxen überladen.
- Bei neuen Modulen immer prüfen, ob sie in `htdocs/dashboard/app.js`, `index.html`, CSS und Modul-Katalog sichtbar und auffindbar sind.

### Projekt-/Arbeitsregeln

- Bei jedem STEP prüfen, ob `project-state/TODO.md` und `project-state/NEXT_STEPS.md` aktualisiert werden müssen.
- Shell-/PowerShell-Ausgaben kurz halten und bevorzugt gezielte Feldauswahl statt großer JSON-Dumps nutzen.
