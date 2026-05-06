# NEXT STEPS - stream-control-center

Stand: 2026-05-06

## Naechster empfohlener Schritt

### STEP193.6 - SoundAlerts Dashboard Layout Cleanup

STEP193.5 ist live dokumentiert:

```text
soundalerts_bridge version = 0.1.9
Upload-Limit Video = 1073741824 Bytes / 1 GB
Loeschen/Ignorieren sind direkte Backend-Aktionen
Loeschen braucht kein Config speichern mehr
Ignored-Eintraege werden nicht erneut als offene Auto-Eintraege angelegt
```

Naechster sinnvoller Schritt:

1. Eintragskarten links lesbar machen.
2. Button-Zeilen sauberer ausrichten.
3. Status-Chips fuer `active`, `missing_file`, `ignored`, `file_matched` besser anzeigen.
4. Upload-Hinweise schlanker darstellen.
5. Keine neue Backend-Funktionalitaet.
6. Keine bestehende Funktionalitaet entfernen.

## Danach moeglich

### SoundAlerts

- Filter fuer Eintraege: `active`, `missing_file`, `ignored`, `file_matched`.
- Upload-/Zuweisungsfluss weiter verbessern.
- Optional Test-/Alt-Eintraege verwalten.

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
