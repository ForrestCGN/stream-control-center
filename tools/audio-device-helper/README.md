# AudioDeviceHelper

Lokaler Windows-Helfer für das Sound-System.

## Stand

STEP 3B: Geräteauflistung + Playback auf Windows-Standardgerät.

Aktuell enthalten:

```powershell
AudioDeviceHelper.exe version --json
AudioDeviceHelper.exe devices --json
AudioDeviceHelper.exe play --file "D:\\...\\sound.wav" --device default --volume 80
```

Noch nicht enthalten:

```powershell
AudioDeviceHelper.exe play --file "D:\\...\\sound.wav" --device "echte-device-id" --volume 80
AudioDeviceHelper.exe stop
```

Gezielte Geräteauswahl folgt in STEP 3C.

## Build

Einfachster Weg:

```powershell
cd tools\audio-device-helper
powershell -ExecutionPolicy Bypass -File .\build-helper.ps1
```

Manuell:

```powershell
cd tools\audio-device-helper
dotnet restore
dotnet publish -c Release -r win-x64 --self-contained false -o dist
```

Erwarteter Pfad für das Backend laut `config/sound_system.json`:

```txt
tools/audio-device-helper/dist/AudioDeviceHelper.exe
```

## Test

```powershell
.\dist\AudioDeviceHelper.exe version --json
.\dist\AudioDeviceHelper.exe devices --json
.\dist\AudioDeviceHelper.exe play --file "D:\\Pfad\\sound.wav" --device default --volume 80
```

Die Ausgabe muss JSON liefern, damit Node sie auslesen kann.
