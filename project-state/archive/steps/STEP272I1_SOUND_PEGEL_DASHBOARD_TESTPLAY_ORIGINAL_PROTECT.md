# STEP272I1 – Sound-Pegel Dashboard Testplay + Original-Schutz

Stand: 2026-05-21

## Ziel

Der Boost-Kopien-Workflow im Dashboard soll ohne PowerShell nutzbar sein:

- Originaldatei direkt aus der Boost-Zeile testweise abspielen.
- erzeugte Boost-Testkopie direkt aus der Boost-Zeile abspielen.
- Ausgabeweg für diese Tests auswählen: OBS/Overlay, Audiogerät oder OBS + Audiogerät.
- übernommene Boost-Kopien klar als neues Original markieren.
- übernommene Originale gegen versehentliches erneutes Überschreiben schützen.

## Geänderte Dateien

- `backend/modules/sound_loudness_scanner.js`
- `htdocs/dashboard/modules/sound_levelscan.js`
- `htdocs/dashboard/modules/sound_levelscan.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Backend

- Boost-Preview markiert aktive Promotions jetzt pro Datei:
  - `promotedOriginal`
  - `activePromotionId`
  - `promotedAt`
  - `backupFile`
  - `protectedReason`
- Dateien, die bereits als neues Original übernommen wurden, werden in der Preview als geschützt markiert.
- `boost/create-one` bricht für bereits übernommene Originale standardmäßig mit `promoted_original_is_protected_rollback_first` ab.
- Originaldateien werden weiterhin nur über Promote mit Backup ersetzt.

## Dashboard

Im Tab `Boost-Kopien` gibt es jetzt pro Datei:

- `Original abspielen`
- `Test-Kopie abspielen`, wenn eine Boost-Kopie existiert
- `Boost-Kopie erzeugen`
- `Als Original übernehmen`, solange die Datei noch nicht als neues Original aktiv ist

Zusätzlich gibt es eine Auswahl `Test-Ausgabe`:

- OBS/Overlay
- Audiogerät
- OBS + Audiogerät

Der Wert wird im Browser gespeichert.

## Nicht geändert

- keine Sounddateien im ZIP
- kein `config/**`
- keine Queue-/Discord-/TTS-Logik
- keine automatische Massen-Normalisierung
- keine automatische Änderung bestehender Alert-/SoundAlert-/VIP-Regeln

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
```

Danach Backend neu starten und im Dashboard prüfen:

1. `System -> Sound-Pegel -> Boost-Kopien` öffnen.
2. Test-Ausgabe wählen.
3. Original abspielen.
4. Boost-Kopie erzeugen.
5. Test-Kopie abspielen.
6. Wenn passend: als Original übernehmen.
7. Preview neu laden: Datei muss als `als neues Original aktiv` markiert sein.
8. Rollback über Historie prüfen, falls nötig.
