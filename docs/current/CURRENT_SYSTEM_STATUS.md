# Current System Status

Stand: STEP274M

## Media / Sound Architektur

Die aktuelle Architektur ist:

```text
Medienverwaltung = Registry / Upload / Kategorien / Metadaten
Sound-System     = offizieller Abspielpunkt
Commands         = Media-ID -> /api/sound/play-media
```

## Zentraler Media-Picker

Dashboard besitzt einen wiederverwendbaren zentralen Media-Picker.

Aktueller erster Nutzer:

```text
Commands
```

Geplante weitere Nutzer:

```text
SoundAlerts
Alerts
Birthday
VIP
Rewards
```

## Media-Kategorien

Neue Uploads werden strukturiert abgelegt:

```text
htdocs/assets/media/<moduleKey>/<categoryKey>/<datei>
```

Regeln:

- `moduleKey` wird vom aufrufenden Modul fest vorgegeben.
- `categoryKey` ist die vom User wählbare/anlegbare Zusatzkategorie.
- „Neueste Uploads“ ist nur eine virtuelle Ansicht über `created_at`, kein Dateiverzeichnis.

## Commands / Media Playback

Commands speichern für Media-Aktionen eine Media-ID.

Offizieller Playback-Weg:

```text
/api/sound/play-media?mediaId=<id>
```

`/api/sound/play-media`:

- löst `media_assets` auf
- prüft Datei
- erzeugt bei Bedarf eine Cache-/Kompatibilitätskopie unter:

```text
htdocs/assets/sounds/_media_registry/
```

- übergibt an das Sound-System

## Standard-Ausgabe für Media-Commands

Nach STEP274L-FIX4 gilt:

```text
target       = both
outputTarget = device
volume       = 85
```

Damit gehen Media-Commands standardmäßig an:

```text
Device + Discord
```

Overlay ist nur per explizitem Override vorgesehen:

```text
/api/sound/play-media?mediaId=<id>&target=stream&outputTarget=overlay
```

## Prüfrouten

```text
/api/commands/media-command-check?trigger=<trigger>
/api/sound/play-media?mediaId=<id>
/api/sound/media-bridge/status
/api/sound/status
```

## Live-Test Referenz

Getesteter Command:

```text
!roxxy2
```

Ergebnis:

- Command korrekt gespeichert
- Media-ID korrekt
- Datei vorhanden
- Cache-Kopie vorhanden
- Volume-Fallback repariert
- Device/Discord-Default gesetzt
- Playback erfolgreich

## Nächster Schritt

STEP274N: SoundAlerts an zentralen Media-Picker anbinden.
