# Current Chat Handoff - CAN36.4

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-36.4 abgeschlossen: Message-Rotator-Diagnose-Erweiterung wurde sichtbar geprüft und die Position ist korrigiert.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene Schritte

```text
CAN-33.4 Commands Diagnosekarte dokumentiert.
CAN-34.4 Todo-Modul dokumentiert und Dashboard Read-only Diagnosekarte nach Stabilitätsfix dokumentiert.
CAN-35.4 Tagebuch-Modul dokumentiert und Dashboard Read-only Diagnosekarte dokumentiert.
CAN-36.0 neuen Arbeitsblock ausgewählt.
CAN-36.1 Message-Rotator-Modul analysiert.
CAN-36.2 Message-Rotator-Modul-Doku und Read-only-/Write-Regeln ergänzt.
CAN-36.3b extra Read-only-Tab entfernt.
CAN-36.3c erweiterte Diagnose in vorhandenen Diagnose-Tab integriert.
CAN-36.3d Position der erweiterten Diagnose korrigiert.
CAN-36.4 Testergebnis dokumentiert.
```

## Bestätigtes CAN-36.3d Sicht-Ergebnis

```text
Dashboard > Message-Rotator
Tab-Leiste bleibt direkt unter der Message-Rotator-Kopfkarte.
Tabs bleiben: Übersicht | Settings | Items | Nachrichten | Diagnose.
Kein zusätzlicher Read-only-Tab.
Im Tab Diagnose steht zuerst die normale Diagnose.
Darunter kommt die erweiterte Read-only-Diagnose.
Keine Start-/Stop-/Tick-/Next-/Manual-/Reload-Aktion ausgelöst.
```

## Bestätigte Read-only Nutzung

Die Erweiterung nutzt nur:

```text
GET /api/message-rotator/status
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
```

Nicht genutzt:

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

## Ergebnis

```text
CAN-36.3d Ziel erfüllt.
Message-Rotator Diagnose-Erweiterung ist korrekt im vorhandenen Tab Diagnose platziert.
Die Navigation wird nicht mehr nach unten gedrückt.
Der extra Read-only-Tab ist entfernt.
Die bestehende Message-Rotator-Diagnose bleibt erhalten.
Die Erweiterung ist read-only.
Keine produktive Aktion ausgelöst.
Keine Funktionalität entfernt.
```

## Empfohlener Start im neuen Chat

```text
Wir machen mit dem stream-control-center weiter. Bitte lies zuerst docs/current/CURRENT_CHAT_HANDOFF_CAN36_4.md und halte dich an den Master-Prompt. Aktueller Stand ist CAN-36.4 abgeschlossen. Nächster Schritt: CAN-37.0 neuen Arbeitsblock bewusst auswählen.
```

## Mögliche nächste Kandidaten

```text
1. Nächstes Modul an Status-/Doku-Regeln anpassen.
2. EventBus read-only Diagnose weiter ausbauen.
3. Overlay-Monitor Dashboard-Details optisch weiter vereinfachen.
4. Bus-Diagnose Unterseiten weiter glätten, z. B. Recovery/Issues/Raw klarer strukturieren.
5. Langfristigen DB-Core-Treiberwechsel separat planen, aber nicht direkt umsetzen.
```
