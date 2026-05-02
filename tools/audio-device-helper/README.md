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

Im Repo-Ordner:

```powershell
cd tools\audio-device-helper
dotnet restore
dotnet build -c Release
```

Optional publish:

```powershell
dotnet publish -c Release -r win-x64 --self-contained false -o dist
```

Erwarteter Pfad für das Backend laut `config/sound_system.json`:

```txt
tools/audio-device-helper/AudioDeviceHelper.exe
```

Wenn per `dotnet publish` nach `dist` gebaut wird, muss entweder die Config angepasst oder die EXE nach `tools/audio-device-helper/AudioDeviceHelper.exe` kopiert werden.

## Test

```powershell
.\dist\AudioDeviceHelper.exe version --json
.\dist\AudioDeviceHelper.exe devices --json
.\dist\AudioDeviceHelper.exe play --file "D:\\Pfad\\sound.wav" --device default --volume 80
```

Die Ausgabe muss JSON liefern, damit Node sie auslesen kann.
