# STEP202.1 – SoundAlerts Event-Log Limit

## Änderung

SoundAlerts Dashboard lädt im Events-Bereich jetzt bis zu 100 Events statt 25.

## Datei

```text
htdocs/dashboard/modules/soundalerts.js
```

## Grund

Der Nutzer möchte ein längeres Log; derzeit werden zu wenige Einträge angezeigt.

## Bewusst nicht geändert

Backend, Parser, Sound-System, Uploads, DB-Schema und bestehende SoundAlerts-Funktionen wurden nicht verändert.
