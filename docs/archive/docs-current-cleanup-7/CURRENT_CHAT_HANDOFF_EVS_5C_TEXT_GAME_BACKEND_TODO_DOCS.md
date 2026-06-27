# CURRENT CHAT HANDOFF – EVS-5c Text Game Backend TODO Docs

Stand: EVS-5c / Text Game Backend TODO Documentation  
Datum: 2026-06-13

## Zweck

Dieser Schritt speichert die fachliche Festlegung aus dem Chat nach EVS-5b in Doku und TODOs. Es ist ein reiner Dokumentations-/Planungsstand.

Keine Codeänderung, keine Datenbankänderung, keine Runtime-Änderung.

## Festgelegte Text-Spiel-Regel

- Der erste komplette Löser eines Geheimsatzes bekommt die Punkte.
- Danach ist dieser Satz im aktuellen Event erledigt und kommt aus der Rotation.
- Es gibt in V1 keine weiteren Löser.
- Es gibt kein Zeitfenster für weitere Löser.
- Teiltreffer geben keine Punkte.
- Teiltreffer-Hinweise können optional aktiv sein.
- Teiltreffer-Wörter werden aus dem Geheimsatz berechnet.
- Es gibt in V1 kein separates Hinweiswörter-/Suchwörter-Feld.
- Pro Event, Satz, User und Wort wird später gespeichert, ob dieses Wort bereits erkannt wurde.
- Ein Wort wird für denselben User und Satz nur einmal gemeldet/gezählt.
- Optional kann zusätzlich ein Cooldown eingestellt werden.

## Backend-Hinweis

Diese Regeln müssen später im Backend/Runtime-Code umgesetzt werden. Das Dashboard zeigt sie bereits als Konfiguration, aber die echte Chat-Auswertung wird erst in späteren EVS-Schritten gebaut.

Geplante Runtime-Anbindung:

- Chatquelle: bestehendes `twitch.chat.message` über Twitch Events / Communication Bus.
- Keine direkte Streamer.bot-Abhängigkeit.
- Keine parallele Chatquelle.
- Textmeldungen über `helper_texts` / `module_text_variants`.
- Status/Diagnose/Heartbeat über vorhandenen Communication Bus.

## Spätere DB-/Backend-Planung

Noch nicht umgesetzt, aber als TODO gespeichert:

- Text-/Phrase-Items pro Event speichern.
- Status pro Satz: offen, gelöst, entfernt/übersprungen.
- Gelösten User und Zeitpunkt speichern.
- Teiltreffer pro Event/Satz/User/Wort speichern.
- Unique-Regel: ein Wort pro User/Satz nur einmal zählen/melden.
- Punktebuchung ins vorhandene Punkte-Ledger.
- Satz nach Lösung aus Rotation entfernen.

## Dashboard-/Config-Hinweis

Später fehlen noch:

- allgemeine Event-Config im Dashboard
- Text-Config / Multi-Texte im Dashboard
- Textvarianten für Chatmeldungen
- Konfig für Teiltreffer-Hinweise / Cooldown / Meldeverhalten

## Nächster sinnvoller Schritt

EVS-6 sollte nicht sofort die komplette Runtime bauen. Sinnvoller wäre zuerst:

1. Backend-Config-Schema für Text-Spiel prüfen/angleichen.
2. Mehrere Text-Sätze pro Event planen.
3. Danach erst Chat-Auswertung über `twitch.chat.message` bauen.

## Test/StepDone

Da dieser Schritt nur Doku/TODOs enthält:

```powershell
.\stepdone.cmd "EVS-5c Text Game Backend TODO Docs"
```

Erst nach späteren Runtime-/Dashboard-Dateischritten wieder Live-/Dashboard-Test durchführen.
