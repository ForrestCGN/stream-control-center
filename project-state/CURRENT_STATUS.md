# CURRENT_STATUS

## Stand: CAN-29.1 vorbereitet

CAN-29.1 behebt die Discord.js DeprecationWarning zum alten `ready`-Event.

## Aktueller Arbeitsbereich

```text
CAN-29: Runtime-Warnings gezielt bereinigen
```

## Ausgangsbefund

Im Node-Log erschien nach Discord-Login:

```text
DeprecationWarning: The ready event has been renamed to clientReady to distinguish it from the gateway READY event and will only emit under that name in v15. Please use clientReady instead.
```

Die Ursache lag in:

```text
backend/modules/discord.js
```

## Änderung CAN-29.1

```text
const MODULE_VERSION = '0.1.0';
```

wurde zu:

```text
const MODULE_VERSION = '0.1.1';
```

und:

```text
client.once('ready', () => {
```

wurde zu:

```text
client.once('clientReady', () => {
```

## Nicht geändert

```text
Keine Login-Logik.
Kein Token-/Config-Verhalten.
Keine Voice-/Sound-Funktionen.
Keine Discord-Routen.
Keine Bridge-Funktionen.
Keine Queue-Funktionen.
Keine DB.
Keine OBS-Aktion.
Keine Dashboard-Dateien.
Keine produktiven Flows.
Keine Funktionalität entfernt.
```

## Erwartete Tests

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\discord.js
.\stepdone.cmd "CAN-29.1 Discord clientReady Deprecation Fix"
```

Danach Node neu starten und prüfen:

```text
[discord] ready as ...
```

soll weiterhin erscheinen.

Diese Warnung soll nicht mehr erscheinen:

```text
DeprecationWarning: The ready event has been renamed to clientReady
```

## Naechster Schritt

```text
CAN-29.1 anwenden und Live-Log prüfen.
```
