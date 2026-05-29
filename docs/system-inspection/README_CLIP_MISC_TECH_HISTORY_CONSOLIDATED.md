# README/Clip/Misc Tech History – konsolidiert

Stand: 2026-05-29  
Erstellt in: STEP536D_README_CLIP_MISC_TECH_DOCS_CONSOLIDATION

## Ziel

Diese Datei konsolidiert alte README_STEP-, Clip-, Communication-Helper-, Overlay-Diagnose- und Misc-STEP-Dokumente, die nach STEP536A–C übrig geblieben sind.

Die ursprünglichen Einzeldateien werden nicht vergessen, sondern nach Prüfung per Quarantine-Skript aus dem aktiven Doku-Bereich verschoben.

## Konsolidierter Scope

```text
docs/README_STEP193_1_CLIP_DISABLE_LIVE_GUARD.txt
docs/README_STEP193_1_CLIP_DISABLE_LIVE_GUARD_FULLFILE.txt
docs/README_STEP193_2_CLIP_REPLAY_FILE_SELECTION_FIX.txt
docs/README_STEP193_3_CLIP_REPLAY_PREFIX_FIX.txt
docs/README_STEP194_CLIP_BACKEND_CHAT_HELPER.txt
docs/README_STEP195_CLIP_TWITCH_TITLE_DURATION_FULLFILE.txt
docs/README_STEP196_DOCUMENTATION.txt
docs/README_STEP203_8.md
docs/README_STEP278B_COMMUNICATION_HELPER_CORE.md
docs/STEP203_7_TWITCH_EVENTSUB_LOYALTY_BRIDGE.md
docs/overlays/STEP392_DIRECT_OVERLAY_PRODUCTION_RULE.md
docs/overlays/STEP393A_DIAGNOSTIC_ONLY.md
docs/dashboard/MEDIA_PICKER_UPLOAD_FIELD_ORDER_STEP275B_FIX1.md
```

## Kurzfassung

Dieser Rest-Batch enthält vier Arten von Dokumenten:

1. alte Clip-README-/Installationsnotizen
2. alte allgemeine README_STEP-/Doku-Notizen
3. Twitch EventSub → Loyalty Bridge
4. Overlay-/Dashboard-Einzeldiagnosen

Diese Dateien sind keine aktiven Modulreferenzen mehr, enthalten aber ein paar wichtige fachliche Regeln, die hier gesichert werden.

## Clip README Verlauf

Die STEP193–195-Clip-Dateien beschreiben alte Arbeitsstände rund um:

```text
- Clip Live-Guard deaktivieren
- Replay-Dateiauswahl-Fix
- Replay-Prefix-Fix
- Clip Backend Chat Helper
- Twitch Titel/Dauer Fullfile
```

Konsolidierter Stand:

- Das Clip-System hat Backend-/Chat-Helfer und lokale Replay-/Twitch-Clip-Logik bekommen.
- Alte README-Dateien enthalten primär Ausführungs- und Testbefehle.
- Künftige Clip-Arbeiten sollen sich an aktuellen Modul-/Projekt-Dokus und echten Dateien orientieren, nicht an alten README_STEP-Dateien.
- Vor Clip-Arbeiten immer aktuelle `backend/modules/clips.js`, relevante Configs und aktuelle Clip-Doku prüfen.

Beispiel aus altem Clip Chat Helper:

```text
/api/clip/create?input=...&triggerUser=...&triggerLogin=...
/api/clip/history?limit=3
```

Diese alten Testbefehle sind Verlaufshistorie, nicht automatisch aktuelle Produktivvorgabe.

## Twitch EventSub → Loyalty Bridge

`docs/STEP203_7_TWITCH_EVENTSUB_LOYALTY_BRIDGE.md` enthält echte fachliche Regeln und wurde hier gerettet.

Ziel:

```text
Echte Twitch EventSub Events werden zusätzlich zum Alert-System an das Loyalty-System weitergereicht.
Punkteberechnung bleibt zentral in backend/modules/loyalty.js.
backend/modules/twitch.js normalisiert Twitch EventSub Payloads.
Forward an POST http://127.0.0.1:8080/api/loyalty/events/ingest.
```

Event-Mapping:

```text
channel.follow -> follow
channel.cheer -> cheer, bits werden als bits übergeben
channel.raid -> raid, viewers werden übergeben
channel.subscribe -> subscribe oder gifted_sub_received
channel.subscription.message -> resub
channel.subscription.gift -> gift_sub oder gift_bomb, ab total >= 5 als Giftbomb
```

Duplicate-Schutz:

```text
Als eventUid wird bevorzugt metadata.message_id aus EventSub genutzt.
Dadurch wird dasselbe echte Twitch Event nicht doppelt gebucht.
```

Konfigurationshinweis:

```json
"loyaltyForward": {
  "enabled": true,
  "url": "http://127.0.0.1:8080/api/loyalty/events/ingest",
  "includeRawEvent": true
}
```

Wichtige Leitplanke:

```text
Das System bleibt im Shadow-Modus, solange mode=shadow gesetzt ist.
StreamElements wird dadurch noch nicht ersetzt.
```

## Communication Helper Core

`docs/README_STEP278B_COMMUNICATION_HELPER_CORE.md` gehört zur frühen Communication-/Helper-Core-Doku.

Konsolidierter Stand:

- Communication-/Bus-Helfer sind Teil der späteren EventBus-/Communication-Bus-Architektur.
- Diese alte README_STEP-Datei ist nicht mehr die maßgebliche Referenz.
- Aktuelle Leitplanken liegen in `backend/modules/communication_bus.js`, aktuellen Systemstatus-Dokus und späteren konsolidierten Bus-Dokus.
- Keine produktiven Flows ohne Plan auf Bus-only umstellen.

## Overlay Diagnosen

Konsolidierter Stand aus `docs/overlays/STEP392_DIRECT_OVERLAY_PRODUCTION_RULE.md` und `docs/overlays/STEP393A_DIAGNOSTIC_ONLY.md`:

- Direct Overlay Production Rule wurde bereits in Current-/Alert-Kontext konsolidiert.
- Diagnostic-only Dokus bleiben Verlaufshistorie.
- Produktiv für Alerts bleibt der dokumentierte direkte Alert-Overlay-Pfad, sofern aktuelle Doku nichts anderes sagt.
- Diagnose-/Bridge-/Shadow-Overlays nicht als Produktivpfad behandeln.

## Dashboard Media Picker Upload Field Order

`docs/dashboard/MEDIA_PICKER_UPLOAD_FIELD_ORDER_STEP275B_FIX1.md` gehört fachlich zur MediaPicker-/Dashboard-UX-Historie.

Konsolidierter Stand:

- MediaPicker/Upload-Feldreihenfolge wurde in frühen Dashboard-Schritten korrigiert.
- Diese Einzelnotiz ist Verlaufshistorie.
- Künftige MediaPicker-Arbeiten müssen aktuelle Dashboard-Dateien und die konsolidierten Alert-/Sound-/Media-Historien prüfen.

## Dokumentation / README_STEP196 / STEP203_8

Die allgemeinen README_STEP-Dokumente enthalten alte Installations-/Doku-Hinweise.

Konsolidierter Stand:

- Aktive Projekt-/Modul-Doku liegt nicht in `README_STEP*`.
- Neue Module/Steps müssen weiterhin dokumentiert werden.
- Vor Chatwechsel „dokumentieren und aktualisieren“: aktuelle Doku-/Statusdateien prüfen und aktualisieren.
- Alte README_STEP-Dateien können nach Konsolidierung aus aktiven Doku-Bereichen verschoben werden.

## Nicht aus dieser Konsolidierung ableiten

Diese Sammeldoku erlaubt keine Runtime-Änderung.

Bei späteren Arbeiten immer:

- echte aktuelle Dateien prüfen
- keine Funktionalität entfernen
- keine DB/Secrets überschreiben oder committen
- keine alten README_STEP-Anleitungen blind ausführen
- aktuelle Modul-Dokus und echte Backend-/Dashboard-Dateien als Source of Truth verwenden
