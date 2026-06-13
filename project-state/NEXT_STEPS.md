# NEXT STEPS

Stand: EVS-5c / Text Game Backend TODO Documentation  
Datum: 2026-06-13

## Sofort nach Übernahme

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-5b Stream Events Text Game Rule Rebalance"
```

Erst danach Dashboard im Live-System testen.

## Manuelle Prüfung

```text
Dashboard → Community → Event-System → Neues Event → Text-/Geheimsatz-Spiel aktivieren
```

Prüfen:

- Text-Spiel-Bereich wirkt wieder ruhiger/kompakter.
- Geheimsatz ist als Pflicht erkennbar.
- Es gibt kein Feld `Hinweiswörter / Suchwörter` mehr.
- Es gibt kein Feld `Zeitfenster für weitere Löser` mehr.
- Punkte für den ersten richtigen Löser sind vorhanden.
- Teiltreffer-Hinweise sind optional konfigurierbar.
- Speichern bleibt möglich.
- Validierung bleibt verständlich.

## Nächster fachlicher Schritt

EVS-6 sollte die Datenpflege robuster machen:

```text
- mehrere Sound-Schnipsel pro Event verwalten
- mehrere Text-/Geheimsätze pro Event verwalten
- Hinzufügen/Bearbeiten/Entfernen je Spieltyp
- Validierung je Eintrag
- weiterhin Media-System für Medien
- weiterhin DB-Snapshot am Event
```

Danach erst:

```text
EVS-7 Sound-Rundensteuerung
EVS-8 Text-/Chat-Auswertung über twitch.chat.message
EVS-9 Overlay/Playback-Anbindung
```


## Nach EVS-5c

Empfohlene Reihenfolge:

1. EVS-6 nicht als Komplett-Runtime bauen.
2. Zuerst Backend-Config-Schema für Text-Spiel prüfen/angleichen.
3. Mehrere Text-Sätze pro Event sauber planen.
4. Danach Chat-Auswertung über bestehendes `twitch.chat.message` / Communication Bus bauen.
5. Danach Sound-Rundensteuerung und Rotation planen.
6. Danach Event-Overlay und Playback-Anbindung.

Wichtige offene Dashboard-Themen:

- Allgemeine Event-Config.
- Text-Config / Multi-Texte.
- Chat-Textvarianten für Teiltreffer, Lösung, Eventstatus.
- Streamer-/modfreundliche Bedienung, keine technische Überladung.
