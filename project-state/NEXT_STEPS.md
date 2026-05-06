# NEXT STEPS - stream-control-center

Stand: 2026-05-06

## Aktueller SoundAlerts-Zwischenstand

STEP193.6.1 dokumentiert den vorlaeufigen SoundAlerts-OBS-Loader-Standard:

```text
_SoundAlerts_Loader bleibt als 1x1 px Browserquelle aktiv geladen.
Audio ist im OBS-Mixer stumm.
Quelle nicht per Auge deaktivieren.
Bild/Ton-Ausgabe laeuft ueber das eigene Sound-System.
Kein Node-/Headless-Browser-Loader, solange der OBS-Loader stabil funktioniert.
```

## Aktuell erledigt

### STEP193.6 - SoundAlerts Dashboard Layout Cleanup

- Eintragskarten links lesbarer gemacht.
- Button-Zeilen sauberer ausgerichtet.
- Status-Chips fuer `active`, `missing_file`, `ignored`, `file_matched` optisch verbessert.
- Upload-Hinweise und Upload-Zeile schlanker/ruhiger gestaltet.
- Keine Backend-Funktionalitaet geaendert.

## Naechster empfohlener Schritt

### STEP193.7 - SoundAlerts Eintragsfilter / Listenansichten

Nur bauen, wenn die Eintragsliste nach dem Layout-Cleanup bei vielen SoundAlerts weiterhin zu unuebersichtlich ist.

Moegliche Filter:

1. Alle
2. Aktiv
3. Offen / Datei fehlt
4. Ignoriert
5. Datei gefunden

## Danach moeglich

### SoundAlerts

- Filter fuer Eintraege: `active`, `missing_file`, `ignored`, `file_matched`.
- Upload-/Zuweisungsfluss weiter verbessern.
- Optional Test-/Alt-Eintraege verwalten.
- Optional spaeter pruefen, ob ein Headless-Browser-Loader ueber Node wirklich noetig ist. Aktuell bewusst nicht bauen.

### Clip-System

- Clip-System bei naechstem Live-Stream testen.
- Danach Streamer.bot-Action auf Backend-Call reduzieren.
- Danach Clip-Dashboard bauen.

## Wichtige Regeln

- SoundAlerts Bridge Version aktuell: `0.1.9`.
- Loeschen/Ignorieren sind direkte Backend-Aktionen.
- Loeschen braucht kein Config-Speichern.
- Ignored-Eintraege werden nicht neu als offene Auto-Eintraege erzeugt.
- Aktuelles Video-Upload-Limit live: `1073741824` Bytes / 1 GB.
- SoundAlerts-Browserquelle bleibt als stummer 1x1-OBS-Loader aktiv, wenn SoundAlerts die Quelle sonst als offline erkennt.
