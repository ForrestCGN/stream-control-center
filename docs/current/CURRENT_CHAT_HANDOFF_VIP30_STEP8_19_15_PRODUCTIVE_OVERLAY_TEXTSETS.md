# VIP30 STEP8.19.15 – Produktives Overlay + Textsets angleichen

## Ziel
Preview-Stand STEP8.19.14 in das echte Sound-System-Overlay übernehmen und die VIP30-Textsets auf das neue einfache Prinzip vorbereiten:

```text
Username
Headline 1
Subline
Message optional
```

oder per `namePosition: "bottom"`:

```text
Headline 1
Username
Subline
Message optional
```

## Enthaltene Dateien
- `htdocs/overlays/sound_system_overlay.html`
- `config/examples/vip30_overlay_sets_simple_name_position.json`
- `docs/sql/VIP30_STEP8_19_15_overlay_sets_update.sql`
- `docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_15_PRODUCTIVE_OVERLAY_TEXTSETS.md`

## Geändert in `sound_system_overlay.html`
- VIP30-Card nutzt weiter das bestehende Sound-System-Design.
- Username ist separat.
- Headline ist separat.
- `namePosition` wird unterstützt:
  - `top`: Username über Headline
  - `bottom`: Username unter Headline
- Alte Headlines mit `{displayName}` / `{login}` werden defensiv bereinigt, damit vorhandene DB-Texte nicht sofort kaputt sind.
- Headline-Fit:
  - Start 34px
  - Minimum 28px
  - bis zu 2 Zeilen
  - danach erst `...`
- Descender-Fix:
  - `line-height: 1.10`
  - `max-height: 76px`
  - `padding-bottom: 3px`
- Subline 20px
- Message 16px
- Abstand Headline → Subline 12px
- Abstand Subline → Message 12px
- Perks/Chips werden im VIP30-Overlay nicht mehr angezeigt.

## Nicht geändert
- Sound-System-Queue
- Sound-System-Bundle
- Audio-Playback
- Clip-/Video-/Shoutout-Logik
- Avatar-Auflösung
- VIP30 Live-Flow
- Redemption Fulfill/Cancel
- Media-System
- Dashboard-Dateien

## Textset-DB-Abgleich
Die Datei `config/examples/vip30_overlay_sets_simple_name_position.json` enthält die neuen Textsets.

Für die bestehende SQLite-DB liegt zusätzlich bereit:

`docs/sql/VIP30_STEP8_19_15_overlay_sets_update.sql`

Wichtig: Vor Ausführung Backup der SQLite-DB machen.

## Test
1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Deploy/Live nach deinem normalen Workflow.
3. Node neu starten, falls die Overlay-Datei aus Live geladen wird.
4. VIP30 Alert-Test im Dashboard ausführen mit:
   - `Aki`
   - `ForrestCGN`
   - `CrazyMeerschweinchen`
   - sehr langem Namen
5. Prüfen:
   - `g/j/p/q/y` werden nicht abgeschnitten
   - Headline wird nicht zu früh gekürzt
   - Name oben/unten funktioniert bei Textsets mit `namePosition`
   - Sound läuft
   - Avatar wird angezeigt
   - Card blendet korrekt aus

## StepDone
```cmd
cd /d D:\Git\stream-control-center
.\stepdone.cmd "VIP30 STEP8.19.15 Produktives Overlay und Textsets abgeglichen"
```

## Hinweis
Dashboard-Editor/Backend-Defaults sind in diesem ZIP bewusst noch nicht als vollständige Ersatzdateien enthalten, weil dafür die echten vollständigen Dateien sauber als Basis benötigt werden. Der produktive Overlay-Teil ist vollständig enthalten; der DB-Textset-Abgleich liegt als JSON/SQL bereit.
