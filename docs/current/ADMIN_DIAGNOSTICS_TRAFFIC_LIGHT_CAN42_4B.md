# Admin-Diagnose Ampelübersicht

## Stand

```text
CAN-42.4b
```

## Ziel

Die zentrale Diagnose soll zuerst auf einen Blick zeigen, ob Module OK, auffällig oder defekt sind.

## Änderung

`Admin > Diagnose` erhält:

```text
OK-Zähler
Warnung-Zähler
Fehler-Zähler
Unbekannt-Zähler
kompakte Modulliste mit Ampelstatus
Moduldetails weiterhin per Dropdown
```

## Bewertungslogik

Grundregel:

```text
Status nicht erreichbar = Fehler
Status erreichbar + keine Auffälligkeit = OK
Status erreichbar + Warnsignal = Warnung
```

Todo-spezifisch wird zusätzlich geprüft:

```text
schemaReady
integration-check ok/healthy
fehlende Channels
```

## Entfernt

Der unnötige Satz wurde entfernt:

```text
Routen werden hier nicht als Liste angezeigt. Die Anzahl bleibt oben sichtbar; Details stehen bei Bedarf in den Rohdaten.
```

## Nicht geändert

```text
backend/*
bestehende Modul-Dateien
Todo-Diagnose-Tab
```

## Keine produktiven Aktionen

```text
keine API-POSTs
keine Show
kein Sound
kein Chat
kein Tagebuch
kein Reload
keine DB-Migration
```
