# AudioDeviceHelper

Lokaler Windows-Helfer für das Sound-System.

## Stand

STEP 3C: Geräteauflistung + Playback auf Windows-Standardgerät + Playback auf ausgewählter MMDevice-ID.

Aktuell enthalten:

```powershell
AudioDeviceHelper.exe version --json
AudioDeviceHelper.exe devices --json
AudioDeviceHelper.exe play --file "D:\\...\\sound.wav" --device default --volume 80
AudioDeviceHelper.exe play --file "D:\\...\\sound.wav" --device "MMDEVICE-ID" --volume 80
```

Noch nicht enthalten:

```powershell
AudioDeviceHelper.exe stop
```

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

Geräte anzeigen:

```powershell
.\dist\AudioDeviceHelper.exe devices --json
```

Auf Windows-Standardgerät abspielen:

```powershell
.\dist\AudioDeviceHelper.exe play --file "D:\\Pfad\\sound.mp3" --device default --volume 80
```

Auf ausgewähltem Gerät abspielen:

```powershell
.\dist\AudioDeviceHelper.exe play --file "D:\\Pfad\\sound.mp3" --device "{0.0.0.00000000}.{...}" --volume 80
```

Die Ausgabe muss JSON liefern, damit Node sie auslesen kann.
