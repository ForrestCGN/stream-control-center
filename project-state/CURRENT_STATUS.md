# CURRENT_STATUS

## Stand: CAN-36.3b vorbereitet

CAN-36.3b korrigiert CAN-36.3: Der zusätzliche sichtbare `Read-only`-Tab im Message-Rotator wird entfernt, weil das Modul bereits einen sichtbaren Tab `Diagnose` besitzt.

## Aktueller Arbeitsbereich

```text
CAN-36: Message-Rotator-Modul Status/Doku/Diagnose prüfen und glätten
```

## Änderung CAN-36.3b

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.js
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN36_3b.md
```

Wichtig:

```text
backend/modules/message_rotator.js bleibt unverändert.
htdocs/dashboard/modules/message_rotator.js bleibt unverändert.
```

## Ergebnis

Der sichtbare Tab-Aufbau soll wieder sein:

```text
Übersicht | Settings | Items | Nachrichten | Diagnose
```

Es soll keinen zusätzlichen Tab `Read-only` mehr geben.

## Umsetzung

```text
index.html lädt message_rotator_readonly_diagnostics.css nicht mehr.
index.html lädt message_rotator_readonly_diagnostics.js nicht mehr.
message_rotator_readonly_diagnostics.js wird zusätzlich inert überschrieben, falls ein alter Browser-Cache/alte index.html sie noch lädt.
message_rotator_readonly_diagnostics.css wird zusätzlich leer überschrieben.
```

## Nicht geändert

```text
Keine Backend-Dateien.
Keine Message-Rotator-Hauptdatei.
Keine API-Routen.
Keine Message.
Kein Rotator-Start/Stop.
Kein Tick.
Kein Next/Manual.
Keine Preview.
Kein Reload.
Keine Live-Status-Force-Abfrage.
Keine Settings gespeichert.
Keine Texte/Varianten gespeichert oder gelöscht.
Keine DB-Migration.
Keine Dashboard-Write-Buttons getestet.
Keine Twitch-/Chat-Nachricht gepostet.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Nächster Schritt

```text
CAN-36.3b anwenden und Dashboard-Sichtprüfung machen.
```
