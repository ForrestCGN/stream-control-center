# CURRENT CHAT HANDOFF – VIP30 STEP8.17.1 Settings Seed Fix

Stand: 2026-06-06

## Problem

Im Dashboard-Tab `Sounds` stand:

```txt
SETTING FEHLT
Das Setting alerts.soundPool wurde im Backend noch nicht gefunden.
```

Obwohl das Backend bereits `moduleBuild: step8.17-sound-pool` angezeigt hat.

## Ursache

Die bestehende DB-Tabelle `vip30_settings` wurde bereits in früheren Steps angelegt. Neue Setting-Definitionen wie `alerts.soundPool` wurden dadurch nicht automatisch nachgesät, wenn keine neue DB-Migration lief.

## Fix

`buildSettingsStatus()` sät fehlende Settings jetzt automatisch nach, wenn weniger DB-Zeilen als `SETTING_DEFINITIONS` existieren.

## Neue Version

```txt
moduleVersion: 0.8.11
moduleBuild: step8.17.1-settings-seed-fix
```

## Erwartung nach Einspielen und Node-Neustart

```txt
Settings 29 / 29
Tab Sounds zeigt Sound-Pool-Editor
Button „Neuen Sound hinzufügen“ ist sichtbar
```

## Wo hochladen?

Nach dem Fix im Tab `Sounds`:

```txt
Sounds -> Neuen Sound hinzufügen -> Sound auswählen / hochladen
```
