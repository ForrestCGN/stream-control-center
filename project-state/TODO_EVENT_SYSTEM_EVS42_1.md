# TODO_EVENT_SYSTEM_EVS42_1

Stand: 2026-06-17

## Sofort

```text
[ ] Von Forrest vermuteten Fehler konkret prüfen.
[ ] Benötigte Logs/Status/Screenshot abfragen.
[ ] Keine neuen Feature-Umbauten vor Fehleranalyse.
```

## Freitag Live-Test

```text
[ ] Auto-Ablauf Sound: Wartezeit → Countdown → Sound → Antwortfenster → Ergebnis.
[ ] Richtige Antwort testen: Punkte, Ranking, Gewinner-Card, optional Reveal.
[ ] Timeout testen: keine Punkte, requeue_later, Keine-Lösung-Kachel.
[ ] Wartezeit überspringen während waiting testen.
[ ] Auto-Reload „Nächster Schnipsel“ im Dashboard beobachten.
[ ] Node-Neustart während Sound/Antwortfenster testen.
[ ] Stream-Offline-Pause während Sound/Antwortfenster testen.
```

## Event-Finale

```text
[ ] Finale-Overlay mit echtem finished Event testen.
[ ] Finale-Route mit echten Punkten testen.
[ ] Gleichstand-Auslosung mit echten Daten testen.
[ ] Nach Finale Status completed definieren/umsetzen.
[ ] Finale erneut abspielen/replay optional planen.
```

## Commands

```text
[ ] !event Basis ins vorhandene Command-System einhängen.
[ ] !event top / punkte / status mit Cooldowns.
[ ] !event skip / pause / weiter nur Mod/Owner.
[ ] !event fertig nur Mod/Owner.
[ ] !event auslosung nur bei status=finished.
[ ] Chat-Ausgaben über chat_output/helper_texts, nicht hart im Code.
```

## Dashboard später

```text
[ ] Paused-Status sichtbar machen.
[ ] Button „Event fortsetzen“ bei runtimeStatus=paused.
[ ] Recovery-Hinweis deutlicher anzeigen.
[ ] Event manuell auf Finished setzen mit Bestätigungsdialog.
[ ] Gewinner-Finale starten Button sauber anbinden.
[ ] Nicht zu technisch; streamer-/modfreundliche Labels.
```

## Text-/Satz-Teil

```text
[ ] Prüfen, ob Text-/Satz-Erkennung dieselben Event-/Recovery-/Punkte-Regeln erfüllt.
[ ] Gemeinsame Eventwertung Sound+Text final testen.
[ ] Kombi-Event Abschluss: erst finished, wenn Sound und Text abgeschlossen oder manuell finished.
```
