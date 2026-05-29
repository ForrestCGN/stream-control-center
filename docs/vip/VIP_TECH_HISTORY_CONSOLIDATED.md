# VIP Tech History – konsolidiert

Stand: 2026-05-29  
Erstellt in: STEP536C_VIP_TECH_DOCS_CONSOLIDATION

## Ziel

Diese Datei konsolidiert alte VIP-STEP-Dokumente aus `docs/vip/`.

Die ursprünglichen Einzeldateien werden nicht vergessen, sondern nach Prüfung per Quarantine-Skript aus dem aktiven Doku-Bereich verschoben.

## Konsolidierter Scope

```text
docs/vip/STEP398_VIP_CURRENT_FLOW_AND_EVENT_BUS_TARGET.md
docs/vip/STEP399_VIP_OVERLAY_BUS_SHADOW_REGISTRATION.md
docs/vip/STEP400_VIP_BUS_SHADOW_STABLE.md
docs/vip/STEP401_VIP_OVERLAY_EVENT_SHADOW_TEST.md
docs/vip/STEP402_VIP_EVENT_SHADOW_STABLE.md
docs/vip/STEP403_VIP_OVERLAY_PREVIEW_SHOW_HIDE.md
docs/vip/STEP403A_VIP_OVERLAY_PREVIEW_VISIBLE_WAIT_TEST.md
docs/vip/STEP404_VIP_PREVIEW_SHOW_HIDE_STABLE.md
docs/vip/STEP404A_VIP_PREVIEW_STABLE_CHECK_PS51_FIX.md
docs/vip/STEP404B_VIP_PREVIEW_STABLE_CHECK_NO_EVENT_ROUTE.md
docs/vip/STEP404C_VIP_PREVIEW_STABLE_CHECK_RESULT_WRAPPER_FIX.md
```

## Kurzfassung

Die VIP-STEP-Dokus beschreiben diese Entwicklungslinie:

1. VIP-System-Iststand vor Event-Bus-Anbindung.
2. VIP-Overlay registriert sich als Bus-/Communication-Client.
3. Bus-Shadow-Modus wird stabil bestätigt.
4. VIP-Overlay-Events werden im Shadow-/Preview-Kontext getestet.
5. Preview Show/Hide wird stabilisiert.
6. Prüfscripte wurden für Windows PowerShell 5.1 und echte API-Antwortstruktur repariert.
7. Sound-System bleibt produktiver Lifecycle-Master.

## VIP-System Schichten

Das VIP-System besteht aus:

```text
Backend-Modul: backend/modules/vip_sound_overlay.js
Sound-System-Integration: /api/sound/play
OBS Overlay: vip_sound_overlay_v2.html
Dashboard: vip.js + vip.css
```

Bestehender produktiver Ablauf:

```text
Trigger
→ VIP Backend
→ Sound-System Play Request
→ Sound-System Lifecycle
→ VIP Overlay reagiert auf Sound-System Event/Status
```

Entscheidender Mechanismus:

```text
visual.module === "vip_sound_overlay"
```

Nur solche Sound-System-Items lösen die VIP-Anzeige aus.

## Produktive Leitplanke

Produktiv bleibt der Sound-System-Lifecycle führend.

Warum:

```text
Der echte Sound-Start ist der korrekte Zeitpunkt für die VIP-Anzeige.
Ein Bus-Event vor echtem Sound-Start könnte die Anzeige zu früh auslösen.
```

Risiken bei falscher Bus-Nutzung:

```text
- doppelte Anzeige, wenn Sound-System und Bus unabhängig show auslösen
- verfrühte Anzeige, wenn Bus-Event vor echtem Sound-Start kommt
- doppelte Hide-Events, wenn Sound-System und Bus beide beenden
```

## Event-Bus / Communication-Bus Ziel

Die Bus-Anbindung ersetzt den Sound-System-Pfad nicht.

Sie liefert zusätzliche Sichtbarkeit, ACK und Diagnose:

```text
- Overlay meldet sich als vip_sound_overlay Bus-Client.
- Backend kann vip.overlay Events shadow-senden.
- Overlay bestätigt Empfang.
- Watchdog/Status kann prüfen, ob VIP-Overlay online ist.
- Sound-System bleibt führend für Playback-Lifecycle.
```

## Shadow-/Preview-Stand

Die STEP399–402-Dokus dokumentieren:

```text
- VIP Overlay Bus Shadow Registration
- VIP Bus Shadow Stable
- VIP Overlay Event Shadow Test
- VIP Event Shadow Stable
```

Konsolidierter Stand:

```text
Shadow/Diagnose ist erlaubt.
Kein produktiver VIP-Bus-Flow ohne separaten Freigabe-Step.
Keine Sound-System-Queue umgehen.
Keine automatische Soundausgabe direkt über Bus.
```

## Preview Show/Hide

Die STEP403–404C-Dokus dokumentieren die Stabilisierung von Preview Show/Hide.

Erwarteter Zielzustand:

```text
- VIP-Bus-Client online
- Show-Event an vip_sound_overlay_v2 geliefert
- Show-Ack über lastAckAt beobachtet
- Preview sichtbar während Wartezeit
- Hide-Event an vip_sound_overlay_v2 geliefert
- Hide-Ack über lastAckAt beobachtet
- Sound-System bleibt unberührt
- Watchdog bleibt grün
```

Wichtiger Script-Fix aus STEP404C:

```text
/api/communication/test-vip-overlay-preview liefert Nutzdaten unter result.*
Prüfscripte müssen result.* oder Root robust auslesen.
```

## Was durch Cleanup nicht verloren gehen darf

- Produktiver VIP-Sound läuft weiter über Sound-System.
- Overlay reagiert produktiv auf Sound-System-Lifecycle/Visual-Daten.
- Bus bleibt Shadow-/Diagnose-/Preview-Schicht, solange kein separater Produktiv-Step beschlossen ist.
- Preview-Tests müssen prüfen, dass Sound-System current/queue leer bleiben.
- Watchdog/Communication-Status sind relevant für Diagnose.
- Keine direkte Bus-Show als Ersatz für echten Sound-Start verwenden.

## Nicht aus dieser Konsolidierung ableiten

Diese Sammeldoku erlaubt keine Runtime-Änderung.

Bei späteren VIP-Arbeiten immer:

- echte aktuelle Dateien prüfen
- keine Funktionalität entfernen
- Sound-System-Lifecycle nicht umgehen
- keine Queue-/Playback-Logik aushebeln
- keine DB/Secrets überschreiben oder committen
- Dashboard/Overlay nur über abgesicherte Backend-/Communication-Pfade
- Preview/Shadow klar von produktivem Flow trennen
