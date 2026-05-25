# CURRENT SYSTEM STATUS – STEP406 VIP PRODUCTIVE BUS EVENT AUDIT

Stand: 2026-05-25

## Aktueller Fokus

VIP-/Mod-Sound-System wurde im Hinblick auf produktive Bus-Events auditiert. Ergebnis: Der produktive VIP-/Mod-Sound-Pfad bleibt weiterhin Sound-System-geführt. Der bestehende Communication-Bus-Pfad bleibt vorerst Preview-/Diagnosepfad.

## Aktueller stabiler VIP-/Mod-Stand

- VIP-/Mod-System läuft produktiv weiterhin über das Sound-System.
- Canonical API-Prefix bleibt `/api/vip-sound`.
- Alias `/api/vip-sound-overlay` bleibt vorhanden.
- `/api/vip` ist absichtlich nicht registriert.
- VIP-Overlay-Datei bleibt `htdocs/overlays/vip_sound_overlay_v2.html`.
- VIP-Backend-Modul bleibt `backend/modules/vip_sound_overlay.js`.
- VIP-Modul-Version laut letztem Handoff: `1.8.7`.
- VIP-Schema-Version laut letztem Handoff: `5`.

## Produktiver Flow

```text
Streamer.bot / Dashboard / API
→ /api/vip-sound/command oder /api/vip-sound/enqueue
→ backend/modules/vip_sound_overlay.js
→ /api/sound/play
→ Sound-System steuert Queue, Ausgabe und Playback
→ VIP-Overlay reagiert auf sound_system WebSocket + /api/sound/status
→ Overlay zeigt passende Karte
```

## Communication-Bus Preview Flow

```text
Communication Bus
→ vip.overlay.show / vip.overlay.hide / vip.overlay.update
→ vip_sound_overlay_v2 zeigt Preview-Testkarte
→ Overlay sendet Ack
→ Sound-System bleibt unberührt
```

## Bestätigter Stand aus STEP404C/STEP405

- VIP-Overlay ist als Communication-Bus-Client registriert.
- Client: `vip_sound_overlay_v2`.
- Modul: `vip_sound_overlay`.
- Typ: `overlay`.
- Modus: `shadow`.
- Capabilities:
  - `vip.overlay.test`
  - `vip.overlay.show`
  - `vip.overlay.hide`
  - `vip.overlay.update`
  - `ack`
- STEP404C bestätigte:
  - Overlay erreichbar.
  - VIP-Bus-Client online.
  - `vip.overlay.show` zugestellt.
  - Show-Ack erkannt.
  - Preview sichtbar.
  - `vip.overlay.hide` zugestellt.
  - Hide-Ack erkannt.
  - Sound-System blieb leer.
  - Communication-Watchdog grün.

## Ergebnis STEP406

Es wird noch kein produktiver VIP-Bus-Overlay-Ausgabeweg gebaut.

Begründung:

- Sound-System ist bereits der richtige Produktivführer für Audio, Queue und Playback.
- Das Overlay erhält über Sound-System-Events und `/api/sound/status` bereits die nötigen visuellen Daten.
- Ein zusätzlicher produktiver `vip.overlay.show` ohne Dedup-/Timing-Konzept könnte doppelte Anzeigen erzeugen.
- Der Bus-Preview-Pfad ist stabil, aber bewusst noch kein Produktivpfad.

## Wichtige Architekturentscheidung

Für VIP gilt ab STEP406:

```text
Sound-System bleibt führend.
Communication Bus darf später ergänzende Mirror-/Diagnose-Events bekommen.
Overlay-Anzeige wird nicht stillschweigend auf Bus-Produktion umgestellt.
```

## Nächster sinnvoller Schritt

Empfohlen: `STEP407 – VIP Productive Bus Mirror Design`

Ziel:

- Event-Vertrag für produktive VIP-Bus-Mirror-Events entwerfen.
- Eventtypen wie `vip.sound.requested`, `vip.sound.accepted`, `vip.sound.queued`, `vip.sound.rejected`, `vip.sound.started`, `vip.sound.finished`, `vip.sound.failed` prüfen.
- Klären, ob `vip.overlay.*` langfristig nur Preview/Overlay-Control bleibt oder ob produktive Anzeige darüber laufen soll.
- Keine Codeänderung ohne fertigen Vertrag.

## Nicht ändern ohne eigenen STEP

- Keine Sound-System-Queue-Logik.
- Keine Bundle-/Prioritätslogik.
- Keine Daily-Usage-Regeln.
- Keine Eventlog-Struktur.
- Keine Entfernung von `/api/vip-sound-overlay`.
- Keine Registrierung von `/api/vip`.
- Keine Bus-only-Migration.
