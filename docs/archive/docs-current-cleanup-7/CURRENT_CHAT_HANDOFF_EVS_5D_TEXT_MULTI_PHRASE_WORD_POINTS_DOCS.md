# CURRENT CHAT HANDOFF – EVS-5d Text Multi-Phrase + Word Points Docs

Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center  
Stand: EVS-5d / reine Doku- und TODO-Konsolidierung

## Zweck

EVS-5d dokumentiert die neu festgelegten Regeln für das Text-Spiel im Event-System:

- Text-Spiel besteht aus mehreren konfigurierbaren geheimen Sätzen.
- Jeder Satz ist einzeln lösbar.
- Nach Lösung wird nur dieser Satz aus der Event-Rotation entfernt.
- Teiltreffer-Hinweise können allgemein oder mit Satznummer ausgegeben werden.
- Optional kann angezeigt werden, wie viele Wörter ein User aus einem Satz gefunden hat.
- Optional können gefundene Wörter Punkte geben.
- Wortpunkte müssen pro Event/Satz/User/Wort eindeutig begrenzt werden.
- Config-Dashboard und Text-Config/Multi-Texte müssen später eingeplant werden.

## Keine Codeänderung

Dieser Step enthält keine Änderung an:

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
Datenbank
Runtime
Chat-Auswertung
Overlay
Playback
```

## Fachliche Festlegung Text-Spiel

```text
- Ein Text-Spiel kann mehrere geheime Sätze enthalten.
- Die Anzahl der Sätze ist konfigurierbar.
- Jeder Satz hat eigene Antwortvarianten und Lösungspunkte.
- Der erste komplette Löser eines Satzes bekommt die Lösungspunkte.
- Danach wird genau dieser Satz als gelöst markiert und aus der Rotation entfernt.
- Andere Sätze bleiben offen.
- Teiltreffer können optional gemeldet werden.
- Teiltreffer können allgemein oder mit Satznummer gemeldet werden.
- Die Anzahl gefundener Wörter kann optional angezeigt werden.
- Wortpunkte sind optional.
- Ein Wort zählt pro User und Satz nur einmal.
- Optional gibt es ein Limit für Wortpunkte pro User und Satz.
```

## Backend-TODO später

Die Runtime muss später folgende Themen abbilden:

```text
- Satz-Pool je Event/Text-Spiel
- Satzstatus: offen / gelöst / übersprungen / entfernt
- Teiltreffer-Tracking pro Event/Satz/User/Wort
- optionales Wortpunkte-System
- optionales Wortpunkte-Limit
- Lösungspunkte pro Satz
- Chat-Auswertung über bestehendes twitch.chat.message / Communication Bus
- Chatmeldungen über helper_texts / module_text_variants
```

## Dashboard-TODO später

```text
- Satzverwaltung statt einzelnes Textfeld
- mehrere Sätze hinzufügen/bearbeiten/löschen
- Antwortvarianten pro Satz
- Lösungspunkte pro Satz
- globale Teiltreffer-Konfiguration
- globale Wortpunkte-Konfiguration
- Config-Dashboard
- Text-Config / Multi-Texte im Dashboard
```

## Nächster sinnvoller Schritt

EVS-6 sollte nicht direkt die komplette Runtime bauen. Sinnvoll ist zuerst:

```text
EVS-6 – Event Text/Sound Item Config Model Planning
```

Ziel:

```text
- Datenmodell für mehrere Sound-Schnipsel und mehrere Text-Sätze prüfen/planen
- Dashboard-Bedienlogik dafür vorbereiten
- Backend-Schema nur nach Prüfung der echten Dateien ändern
- keine parallelen Config-/Text-Systeme bauen
```
