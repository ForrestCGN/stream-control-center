# CURRENT CHAT HANDOFF – EVS-6 Text Multi-Phrase Config Prep

Stand: 2026-06-13

## Ziel dieses Steps

EVS-6 bringt die im Mod-Team abgestimmten Text-Spiel-Regeln in die Vorbereitung von Dashboard und Backend-Validierung.

## Enthaltene Änderungen

- Dashboard-Text-Konfiguration unterstützt mehrere geheime Sätze.
- Pro Satz können Lösungssatz, Antwortvarianten und Punkte für die komplette Lösung gepflegt werden.
- Satz hinzufügen / Satz entfernen im Event-Dialog vorbereitet.
- Teiltreffer-Hinweise sind konfigurierbar: aus, allgemein oder mit Satznummer.
- Optional kann die Anzahl gefundener Wörter angezeigt werden.
- Optional können gefundene Wörter Punkte geben.
- Punkte pro neues Wort und maximales Wortpunkte-Limit pro User/Satz sind im Dashboard vorbereitet.
- Backend-Validierung kennt die neuen Text-Config-Felder und gibt sie im Validation-Detail zurück.

## Weiterhin NICHT enthalten

- Keine Twitch-Chat-Auswertung.
- Keine Runtime-Rotation für Text-Sätze.
- Keine echte Vergabe von Wortpunkten im Chat.
- Kein Event-Overlay.
- Kein Sound-/Media-Playback.
- Keine Text-Config/Multi-Texte-Verwaltung im Dashboard.

## Wichtig für spätere Runtime

Die Runtime muss später pro Event/Satz/User/Wort speichern, welche Wörter bereits gezählt wurden. Ein Wort darf pro User und Satz nur einmal melden/zählen. Nach kompletter Lösung wird nur dieser Satz aus der Rotation entfernt; andere Sätze bleiben offen.

## Testreihenfolge

1. Dateien ins Repo übernehmen.
2. Syntax prüfen:
   - `node -c .\backend\modules\stream_events.js`
   - `node -c .\htdocs\dashboard\modules\stream_events.js`
3. StepDone ausführen:
   - `.\stepdone.cmd "EVS-6 Text Multi Phrase Config Prep"`
4. Danach erst Dashboard/Live testen.
