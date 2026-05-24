# STEP278A V9 — Master Overlay Parallel Test with Alert Mirror / Preview Mode

Status: Architecture / documentation only  
Live status: NOT DEPLOYED  
Repo status: NOT COMMITTED  
Code status: NO PRODUCTION CODE CHANGED

## Neue Präzisierung

Alerts dürfen bereits parallel an das Master-Testsystem gesendet werden, solange das produktive Legacy-System weiter unverändert läuft.

Das ist möglich, weil Forrest das Master-Overlay testweise im Browser oder in einer nicht-live sichtbaren OBS-Testszene öffnen kann.

## Verbindliche Regel

```text
Produktiv:
  Legacy-Alert-Overlay bleibt aktiv und zeigt Live-Alerts.

Test/Preview:
  Master-Overlay darf dieselben Alerts zusätzlich als Preview/Mirror empfangen,
  solange es nicht live sichtbar ist oder eindeutig als Testziel markiert ist.
```

## Warum das sinnvoll ist

So können wir das Master-System realitätsnah testen:

- echte Alert-Payloads
- echte Display-Daten
- echte Timing-Daten
- echtes Zusammenspiel mit SoundSystem-Items
- Browser-Test außerhalb OBS
- Testszene in OBS
- Debug-Ansicht im Dashboard

Ohne das produktive System zu gefährden.

## Betriebsart: alertMirrorToMaster

Geplante Config-Erweiterung:

```json
{
  "enabled": false,
  "testOnly": true,
  "autoActivateWhenLive": false,
  "replaceExistingOverlays": false,
  "mirror": {
    "alerts": {
      "enabled": true,
      "target": "master_test",
      "onlyWhenMasterConnected": true,
      "markAsPreview": true,
      "allowLiveEvents": true,
      "visibleInProduction": false
    }
  }
}
```

## Wichtiger Unterschied

Mirror bedeutet:

```text
Legacy bekommt den normalen Live-Alert.
Master bekommt eine Kopie / Preview-Version.
```

Nicht:

```text
Master ersetzt Legacy.
Legacy wird abgeschaltet.
SoundSystem wird umgangen.
```

## Payload-Markierung

Alle gespiegelten Events an das Master-Testsystem müssen markiert werden.

Beispiel:

```json
{
  "event": "visual.alert.play",
  "target": "overlay_master_test",
  "payload": {
    "alert": {},
    "mirror": true,
    "preview": true,
    "sourceEventId": "evt_live_123",
    "productionTarget": false
  }
}
```

## Keine Doppelanzeige im Stream

Doppelanzeige ist nur ein Problem, wenn Master live sichtbar ist.

Deshalb:

```text
Master im Browser:
  sicher

Master in OBS-Testszene:
  sicher

Master als versteckte OBS-Quelle:
  meistens sicher, aber Audio/Performance prüfen

Master in Live-Szene sichtbar:
  erst nach manuellem GO
```

## Empfohlene Testwege

### Browser-Test

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1&mirror=1
```

### OBS-Testszene

```text
Szene: _TEST_MasterOverlay
Quelle: _overlay-master-test
URL: http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1&mirror=1
```

Diese Szene ist nicht produktiv.

## Bus-Routing

Der Bus kann Alerts an zwei Ziele senden:

```text
visual.alert.play -> alerts_v2          production=true
visual.alert.play -> overlay_master_test mirror=true preview=true
```

## Ack getrennt behandeln

Acks vom Master-Testsystem dürfen den produktiven Alert nicht beenden.

Regel:

```text
alerts_v2 finished ack:
  darf produktiven Alert abschließen

overlay_master_test finished ack:
  nur Test-/Mirror-Status aktualisieren
  darf Legacy/Produktivstatus nicht beenden
```

## SoundSystem bleibt Queue Authority

Auch beim Mirror-Modus bleibt:

```text
SoundSystem entscheidet, wann ein Alert startet.
Legacy-Overlay zeigt produktiv.
Master-Testsystem bekommt zusätzliche Visual-Kopie.
```

## Monitoring

Master-Mirror-Monitoring ist nur aktiv, wenn:

- Master-Overlay verbunden ist
- Mirror-Modus aktiv ist
- Browser/Testszene geöffnet ist
- oder Dashboard-Test aktiv ist

Wenn Master nicht verbunden ist, ist das kein Live-Fehler.

## Fehlerlogik

```text
Master Mirror Ziel nicht verbunden:
  Info oder Debug, kein Produktionsfehler

Legacy Alert Overlay nicht verbunden im Livebetrieb:
  Warnung/Fehler je nach Monitoring

Master Ack fehlt:
  Test-Warnung, kein Produktionsfehler

Legacy Ack fehlt:
  produktiv relevant
```

## Migration

Diese Funktion ist ein Zwischenschritt:

```text
legacy produktiv
+ master mirror preview
+ stabile Tests
+ später gezielte Modul-Umschaltung
+ legacy bleibt Fallback
```

## Arbeitsregel

Diese Doku ist nicht live.

Für Code-Schritte gilt:

```text
1. echten Repo-/Live-Stand prüfen
2. reale Dateien als Basis nehmen
3. keine Funktionalität entfernen
4. keine SQLite ersetzen
5. Zielpfade korrekt im ZIP
6. legacy bleibt produktiv
7. master mirror nur zusätzlich/testweise
8. produktive Umstellung erst nach manuellem GO
```
