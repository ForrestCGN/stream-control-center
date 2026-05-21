# Sound Queue Full Order Trace Test V5 – Real Mod/VIP Flow

## Zweck

V5 testet nicht mehr nur einen VIP-Ersatzsound via `/api/sound/play`, sondern den echten VIP-/Mod-Flow ueber:

```text
/api/vip-sound/admin/test
```

Dadurch werden getestet:

- echtes VIP-/Mod-Modul
- VIP-/Mod-Overlay
- VIP-/Mod-Sound-Aufloesung
- Sound-System-Queue
- Prioritaeten gegen Alerts, SoundAlerts und normales TTS

## Standard-Sequenz

```text
1. Alert 1
2. SoundAlert
3. Mod-Sound Araglor
4. normales TTS
5. Alert 2
6. Mod-Sound Drudchen_CGN
7. normales TTS
8. SoundAlert
9. Alert 3
```

## Verwendete Zieluser

```text
Araglor
Drudchen_CGN
```

Das Script nutzt `consumeDaily = false`, damit es als Admin-/Override-Test nicht am Tagesverbrauch scheitert.

## Wichtig

Damit die echten Mod-Sounds funktionieren, muessen im VIP-/Mod-System fuer diese User passende Sounddateien vorhanden sein.

Je nach deiner Einstellung `fileNameMode`/`fileExtension` erwartet das System z. B.:

```text
D:\Streaming\stramAssets\htdocs\assets\sounds\vip\Araglor.mp3
D:\Streaming\stramAssets\htdocs\assets\sounds\vip\Drudchen_CGN.mp3
```

Wenn Namen/Dateien anders sind, meldet die EventLog-Datei den Fehler.

## Installation

ZIP nach Repo entpacken:

```text
D:\Git\stream-control-center\
```

## Ausfuehren

```powershell
cd "D:\Git\stream-control-center\tools\easy"
.\05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd
```

## Andere Mod-User setzen

```powershell
.\05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd -Mod1Login "araglor" -Mod1DisplayName "Araglor" -Mod2Login "drudchen_cgn" -Mod2DisplayName "Drudchen_CGN"
```

## Tracezeit anpassen

```powershell
.\05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd -TraceSeconds 120
.\05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd -TraceSeconds 150
```

## Ergebnisdateien

```text
D:\Git\stream-control-center\_trace\live_sound_trace_*.final.json
D:\Git\stream-control-center\_trace\sound_queue_full_order_v5_real_mod_*.events.json
```

Bei Problemen bitte beide Dateien hochladen.

## Erwartung

Das Sound-System darf Alert-Sound und Alert-TTS nicht durch SoundAlert, Mod-Sound oder normales TTS trennen.

Die echte Playback-Reihenfolge kann wegen Prioritaeten von der Ausloese-Reihenfolge abweichen.

Aktuelle Prioritaeten:

```text
Alert-Bundles > SoundAlert/Kanalpunkte > Mod/VIP > normales TTS
```
