# CURRENT_STATUS

## Stand: CAN-36.4 abgeschlossen

CAN-36.4 dokumentiert den erfolgreichen Sicht- und Positionstest der Message-Rotator-Diagnose-Erweiterung nach CAN-36.3d.

## Aktueller Arbeitsbereich

```text
CAN-36: Message-Rotator-Modul Status/Doku/Diagnose prüfen und glätten
```

## Bestätigter Sichttest

Dashboard:

```text
Dashboard > Message-Rotator
```

Bestätigter Zustand:

```text
Tab-Leiste bleibt direkt unter der Message-Rotator-Kopfkarte.
Tabs bleiben: Übersicht | Settings | Items | Nachrichten | Diagnose.
Kein zusätzlicher Read-only-Tab.
Im Tab Diagnose steht zuerst die normale Diagnose.
Darunter kommt die erweiterte Read-only-Diagnose.
Keine Start-/Stop-/Tick-/Next-/Manual-/Reload-Aktion ausgelöst.
```

## Ergebnis

```text
CAN-36.3d Ziel erfüllt.
Message-Rotator Diagnose-Erweiterung ist korrekt im vorhandenen Tab Diagnose platziert.
Die Navigation wird nicht mehr nach unten gedrückt.
Der extra Read-only-Tab ist entfernt.
Die bestehende Message-Rotator-Diagnose bleibt erhalten.
Die Erweiterung ist read-only und nutzt nur erlaubte GET-Diagnoserouten.
```

## Read-only Routen der Erweiterung

```text
GET /api/message-rotator/status
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
```

## Produktive Routen: nicht genutzt

```text
GET/POST /api/message-rotator/start
GET/POST /api/message-rotator/stop
GET/POST /api/message-rotator/tick
GET/POST /api/message-rotator/next
GET/POST /api/message-rotator/manual
GET/POST /api/message-rotator/reload
GET/POST /api/message-rotator/live-status
POST /api/message-rotator/admin/settings
POST /api/message-rotator/admin/texts
```

## Nicht geändert in CAN-36.4

```text
Keine Codeänderung.
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
CAN-37.0 neuen Arbeitsblock bewusst auswählen.
```
