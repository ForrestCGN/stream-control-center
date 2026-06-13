# CURRENT STATUS

Stand: EVS-5d / Text Multi-Phrase + Word Points Documentation  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Zweck dieses Stands

EVS-5d ist ein reiner Doku-/TODO-Step. Er speichert die neu festgelegten Text-Spiel-Regeln für das Event-System.

## Aktueller bestätigter Stand

- EVS-2 Backend Foundation wurde erfolgreich getestet.
- EVS-3 Dashboard Skeleton wurde übernommen.
- EVS-4 MediaPicker Prep wurde im Dashboard sichtbar getestet.
- EVS-4b Sound-/Video-Layout wurde sichtbar getestet.
- EVS-5b Text Game Rule Rebalance wurde als ZIP geliefert.
- EVS-5c hat Backend-TODOs für Text-Spiel-Regeln dokumentiert.
- EVS-5d ergänzt mehrere Sätze, Teiltreffer-Modi und optionale Wortpunkte.

## Wichtige Festlegung Text-Spiel

```text
- Ein Text-Spiel kann mehrere geheime Sätze enthalten.
- Die Anzahl der Sätze muss konfigurierbar sein.
- Jeder Satz ist einzeln lösbar.
- Nach Lösung wird nur dieser Satz aus der Rotation entfernt.
- Andere Sätze bleiben offen.
- Teiltreffer können allgemein oder mit Satznummer gemeldet werden.
- Optional kann die Anzahl gefundener Wörter angezeigt werden.
- Optional können gefundene Wörter Punkte geben.
- Ein Wort zählt pro User und Satz nur einmal.
- Optional kann es ein Wortpunkte-Limit pro User und Satz geben.
```

## Noch nicht umgesetzt

```text
Backend-Runtime für mehrere Sätze
Teiltreffer-Tracking in DB/Runtime
Wortpunkte-System
Chat-Auswertung über twitch.chat.message
Config-Dashboard
Text-Config / Multi-Texte im Dashboard
Overlay
Playback
Statistiken
```

## Keine Änderung in EVS-5d

```text
Keine Codeänderung
Keine DB-Änderung
Keine Runtime-Änderung
Keine Dashboard-JS/CSS-Änderung
```

## Nächster sinnvoller Schritt

EVS-6 sollte zuerst das Item-/Config-Modell für mehrere Sound-Schnipsel und mehrere Text-Sätze sauber planen bzw. vorbereiten, bevor Runtime/Chat-Auswertung gebaut wird.
