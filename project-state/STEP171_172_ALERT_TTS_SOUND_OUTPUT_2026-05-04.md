# STEP171 / STEP172 - Alert-TTS Blocklogik und Sound-Output-Trennung

Stand: 2026-05-04

## Ergebnis

STEP171 und STEP172 sind getestet und als stabiler Zwischenstand gespeichert.

## STEP171 - Alert-/TTS-Blocklogik

Ziel:

- Ko-fi Alert-Sound und Ko-fi Alert-TTS bleiben als zusammenhaengender Block erhalten.
- Tipeee Alert-Sound und Tipeee Alert-TTS bleiben als zusammenhaengender Block erhalten.
- Normales Chat-TTS darf nicht zwischen mehrere wartende Alert-Bloecke rutschen.
- Normales Chat-TTS-Overlay darf nicht in einen laufenden Alert hineinblenden.

Getesteter Zielablauf:

1. Ko-fi Alert + Ko-fi-TTS
2. Tipeee Alert + Tipeee-TTS
3. Normales Chat-TTS

Bestaetigter Testbefund:

- Ko-fi wurde sichtbar angezeigt und dessen TTS kam danach.
- Tipeee wurde danach sichtbar angezeigt und dessen TTS kam danach.
- Normales Chat-TTS kam erst nach beiden Alert-Bloecken.
- TTS-Overlay blendete nicht mehr in den Alert hinein.
- Abschlussstatus danach: Sound-System leer, Alert-Queue leer, TTS-System leer.

Betroffene Dateien:

- `backend/modules/alert_system.js`
- `backend/modules/tts_system.js`

Wichtige technische Entscheidung:

- Alert-TTS wird technisch hinter den eigenen Alert-Sound einsortiert.
- Chat-TTS prueft Alert-Status und wartet, solange Alerts aktiv oder queued sind.
- Nach Alert-Ende wird ein Sicherheitsabstand genutzt, damit TTS-Overlay nicht in den Alert hineinrendert.

## STEP172 - Sound-System outputTarget-Trennung

Ziel:

- `outputTarget=device` spielt nur ueber das lokale Audiogeraet.
- `outputTarget=overlay` spielt nur ueber die OBS-Browserquelle `sound_system_overlay.html`.
- `outputTarget=both` spielt ueber beide Ausgaben.

Bestaetigter Testbefund:

- Device-only-Test funktioniert nach OBS-Neustart korrekt.
- Ursache fuer die vorher doppelte Ausgabe war sehr wahrscheinlich ein nicht frisch geladenes OBS-Browseroverlay bzw. gecachter alter Overlay-Code.
- Live-Overlay enthaelt jetzt `shouldPlayInOverlay(item)` und ignoriert `outputTarget=device`.
- Backend enthaelt `shouldUseDevice(item)` und `playDeviceOutput(item)` bricht bei nicht passenden outputTargets ab.

Betroffene Dateien:

- `backend/modules/sound_system.js`
- `htdocs/overlays/sound_system_overlay.html`

Wichtige technische Entscheidung:

- Die Trennung muss sowohl im Backend als auch im Browseroverlay durchgesetzt werden.
- Nur Backend-Schutz reicht nicht, weil das Overlay per WebSocket/Polling den Sound-System-State lesen und sonst selbst abspielen kann.
- Nach Overlay-Codeaenderungen muss die OBS-Browserquelle neu geladen werden; bei hartem Cache hilft OBS-Neustart oder eine Cache-Busting-URL.

## Live-/Config-Hinweis

Die Sound-System-Versionsanzeige kann durch `config/sound_system.json` bzw. `sound_settings` ueberlagert werden. Der Code-Stand ist massgeblich, aber die Config-Version sollte bei Bedarf mitgezogen werden.

Gepruefte Live-Hinweise:

- Live-Code enthielt `version: "0.1.10"`.
- Live-Config stand zwischenzeitlich noch auf `0.1.8` und ueberlagerte die Statusanzeige.
- Live-Overlay enthielt `shouldPlayInOverlay(item)`.

## Abschluss

- STEP171: stabil getestet.
- STEP172: stabil getestet.
- GitHub/dev soll als Single Source of Truth gelten.
- Keine Backup-/BAK-Dateien committen.
- Keine SQLite-/Secret-Dateien committen.
