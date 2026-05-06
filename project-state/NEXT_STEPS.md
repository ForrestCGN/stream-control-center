# NEXT STEPS - stream-control-center

Stand: 2026-05-06

## Naechster empfohlener Schritt

### STEP193.8 - SoundAlerts Eintragsfilter / Ansichten

STEP193.7 ist vorbereitet:

```text
SoundAlerts-Uebersicht zeigt kompakte Kennzahlen.
Letzte 5 Events sind auf der Uebersicht sichtbar.
Replay/Bearbeiten/Eintrag erstellen sind direkt aus der Uebersicht moeglich.
Keine Backend-/API-/DB-Aenderung.
```

Naechster sinnvoller Schritt, falls die Eintragsliste weiter waechst:

1. Filter/Ansichten fuer Eintraege ergaenzen:
   - Alle
   - Aktiv
   - Inaktiv
   - Datei fehlt
   - Datei gefunden
   - Ignoriert
2. Suche nach SoundAlert-Name/Label/Datei ergaenzen.
3. Keine neue Backend-Funktionalitaet, wenn vorhandene `config.rules`-Daten reichen.
4. Keine bestehende Funktionalitaet entfernen.

## Danach moeglich

### SoundAlerts

- Upload-/Zuweisungsfluss weiter verbessern.
- Optional Test-/Alt-Eintraege verwalten.
- Optional OBS-Loader-Status als reine Doku-/Checkliste im Dashboard anzeigen, ohne SoundAlerts-URL im Backend zu laden.

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
- `_SoundAlerts_Loader` bleibt als aktive, stumme 1x1-OBS-Browserquelle geladen.
