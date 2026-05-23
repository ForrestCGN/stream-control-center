# Next Steps

## STEP274N - SoundAlerts an zentralen Media-Picker anbinden

Ziel:

- SoundAlerts sollen denselben `window.MediaPicker` nutzen.
- Kein eigener Upload-/Auswahl-Sonderweg, wenn der zentrale Picker reicht.
- `moduleKey = soundalerts`
- erlaubte Typen:

```js
['audio', 'video', 'animation']
```

Geplantes Verhalten:

```js
MediaPicker.open({
  moduleKey: 'soundalerts',
  allowedTypes: ['audio', 'video', 'animation'],
  onSelect(asset) {
    // mediaId in SoundAlert-Regel speichern
  }
});
```

Zu prüfen:

- vorhandene SoundAlerts-Dashboard-Dateien
- vorhandene SoundAlerts-Backend-API
- bestehende SoundAlert-Datenstruktur
- ob SoundAlerts bereits Media-ID, Datei-Pfad oder Sound-Key speichern
- wie Ausführung aktuell ans Sound-System geht

## Danach

- STEP274O: Alerts an Media-Picker anbinden
- STEP274P: Birthday an Media-Picker anbinden
- STEP274Q: VIP / Rewards prüfen und anbinden
- Media-Kategorien im Dashboard komfortabler verwaltbar machen
- Alte modul-eigene Uploads schrittweise ersetzen

## Arbeitsregel für die nächsten Schritte

Vor jeder neuen Anbindung:

1. echten aktuellen Dateistand prüfen
2. vorhandene Helper/APIs verwenden
3. keine Parallelstruktur bauen
4. keine Funktionalität entfernen
5. kleine testbare Schritte
