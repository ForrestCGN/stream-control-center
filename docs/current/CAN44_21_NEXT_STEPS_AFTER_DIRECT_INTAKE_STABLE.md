# CAN-44.21 – Next Steps nach stabilem Direct-Intake

Stand: 2026-06-05

## Abgeschlossen

Der Direct-Intake-/Command-Bereich des Clip-Shoutout-Systems ist stabil abgeschlossen.

Aktueller stabiler Stand:

```text
CAN-44.21.34
clip_shoutout v0.2.38
!so = Hauptbefehl
!vso = Alias
command_definitions = Source of Truth
```

## Nächste sinnvolle Prüfpunkte

### 1. Dashboard-/Settings-Abgleich

Noch separat prüfen:

```text
- Wird im Dashboard nur noch ein Command für clip_shoutout angezeigt?
- Sind Trigger und Aliase dort sauber editierbar?
- Werden Änderungen korrekt in command_definitions gespeichert?
- Wird keine alte Modul-Config command=vso mehr angezeigt oder erneut gespeichert?
```

### 2. OfficialQueue-Verhalten im Offline-/Testbetrieb

Prüfen:

```text
- Manuelle SO-Anlässe dürfen eine kurze OfficialQueue-Wartemeldung erzeugen.
- Automatische Worker-Retrys dürfen nicht chatten/spammen.
- OfficialQueue-Eintrag bleibt erhalten, wenn Twitch noch blockt.
- Bei erneutem SO für denselben Streamer wird vorhandener OfficialQueue-Eintrag erneut versucht.
```

### 3. Doku/Repo-Abgleich

Beim nächsten Doku-Schritt prüfen/aktualisieren:

```text
- docs/current/CURRENT_STATUS.md
- docs/current/NEXT_STEPS.md
- docs/current/FILES.md
- docs/current/CHANGELOG.md
- docs/modules/clip_shoutout.md
```

### 4. Kein akuter Codebedarf

Aktuell ist kein weiterer Code-Fix im Direct-Intake-Bereich nötig, solange die Tests stabil bleiben.

Nicht anfassen ohne neuen Grund:

```text
- Clip-Player
- sound_system_overlay.html
- DisplayQueue-Ablauf
- OfficialQueue-Ablauf
- Chattexte
- produktive SQLite-Datenbankstruktur
```
