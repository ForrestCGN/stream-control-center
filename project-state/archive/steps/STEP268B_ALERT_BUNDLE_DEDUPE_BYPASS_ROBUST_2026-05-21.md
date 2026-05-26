# STEP268B - Alert Bundle Dedupe Bypass Robust

Stand: 2026-05-21
Status: funktional getestet und als aktueller stabiler Zwischenstand bestaetigt.

## Zweck

Der Trace nach STEP268A zeigte:

- Alert 1: Hauptsound + TTS korrekt.
- Alert 2: Bundle wurde sofort gebaut und ans Sound-System geschickt.
- Alert 2: Hauptsound wurde im Sound-System mit `cooldown_same_sound` gedroppt.
- Alert 2: TTS blieb in der Queue und spielte allein.

Damit war nachgewiesen: Die Immediate-Prequeue arbeitet, aber die globale Sound-System-Dedupe entfernte gleiche Alert-Hauptsounds.

## Fix

`backend/modules/sound_system.js` erkennt Alert-Bundle-Items jetzt robuster anhand von:

- `item.bundle.bundleType === "alert"`
- `item.meta.bundleType === "alert"`
- `item.meta.bundleManagedBy === "alert_system"`
- `item.visual.module === "alert_system"`
- `meta/visual.alertEventUid`
- `source === "alert_system"` / `source === "alert_tts"`

Für diese Items gilt:

- `checkCooldown(item)` liefert direkt `null`.
- `rememberCooldown(item)` schreibt sie nicht in die globale Same-Sound-Historie.

Damit werden gleiche Alert-Sounds nicht mehr durch `cooldown_same_sound` oder `dedupe_same_user_sound` verworfen.

## Zusätzlich

`backend/modules/alert_system.js` bleibt funktional unverändert, speichert aber mehr Diagnose in `alertBundlePrequeue`:

- `bundleId`
- `bundleQueuedAt`
- `mainDropped`
- `mainDropReason`

## Nicht geändert

- `app.sqlite`
- `config`
- Streamer.bot-Flows
- Overlay-HTML
- VIP-Logik

## Live-/Repo-Workflow

Wichtige Arbeitsregel erneut bestaetigt:

```text
Repo ist nicht Live.
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
```

Aenderungen muessen ueber die Easy-Scripts bzw. bewusstes Deploy/Verify in Live gebracht werden.

Relevante Scripts:

```text
D:\Git\stream-control-center\tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd
D:\Git\stream-control-center\tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd
D:\Git\stream-control-center\tools\easy\03_NUR_STATUS_PRUEFEN.cmd
D:\Git\stream-control-center\tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd
```

## Live-Verifikation

STEP268B wurde im Live-System verifiziert mit:

```powershell
Select-String -Path "D:\Streaming\stramAssets\backend\modules\sound_system.js" -Pattern "STEP268B","isAlertBundleItem","cooldown_same_sound" -SimpleMatch
```

Erwartete Treffer:

```text
STEP268B_ALERT_BUNDLE_DEDUPE_BYPASS_ROBUST
function isAlertBundleItem(item)
checkCooldown bypass ueber isAlertBundleItem(item)
rememberCooldown bypass ueber isAlertBundleItem(item)
cooldown_same_sound bleibt fuer normale Sounds erhalten
```

## Bestaetigte Tests nach Live-Deploy

Manuell getestet und als gut bestaetigt:

```text
Alert 1 mit Sound + TTS
Alert 2 mit Sound + TTS
```

Ergebnis:

```text
Alert 1 Sound
Alert 1 TTS
Alert 2 Sound
Alert 2 TTS
kein cooldown_same_sound Drop fuer Alert-Bundle-Items
```

Weiterer Test:

```text
Alert 1
Alert 2
VIP
```

Ergebnis:

```text
Alert 1
Alert 2
VIP
```

Weiterer Mischtest:

```text
Alert 1
Alert 2
SoundAlert
VIP
```

Ergebnis nach aktueller Prioritaetslogik korrekt:

```text
Alert 1
Alert 2
SoundAlert
VIP
```

Hinweis zur Prioritaet:

```text
Alert-Bundles: hoeher als SoundAlert/VIP
SoundAlert/Kanalpunkte: aktuell vor VIP
VIP/Crew: aktuell hinter SoundAlert/Kanalpunkte
```

Ein spaeter ausgeloster Alert darf vor bereits wartenden SoundAlerts/VIP laufen, weil Alerts hoeher priorisiert sind.

## Aktueller Stand

STEP268B ist der aktuelle stabile Zwischenstand fuer Alert-/Sound-System-Queue-Verhalten.

Der Kernfehler war:

```text
Alert-Hauptsounds wurden vom Sound-System als gleicher Sound gedroppt.
Dadurch blieb nur TTS uebrig und andere Sounds konnten dazwischenrutschen.
```

Dieser Fehler ist im aktuellen Live-Test nicht mehr aufgetreten.

## Naechste Beobachtung

Weiterhin im echten Betrieb beobachten:

```text
Alert-Sound und zugehoerige TTS bleiben zusammen.
Kein Alert-Hauptsound wird mit cooldown_same_sound gedroppt.
SoundAlert/VIP schiebt sich nicht zwischen Alert-Sound und Alert-TTS.
Alerts haben Vorrang vor normalen SoundAlerts/VIP gemaess Prioritaet.
```

Wenn erneut ein Problem auftritt:

1. Erst Trace aufnehmen.
2. Keine Codeaenderung ohne Trace.
3. Pruefen, ob `cooldown_same_sound`, `dedupe_same_user_sound`, Bundle-ID oder Prioritaet Ursache ist.
