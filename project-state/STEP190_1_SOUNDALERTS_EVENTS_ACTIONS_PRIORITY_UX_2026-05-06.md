# STEP190.1 - SoundAlerts Events Actions & Priority UX

Stand: 2026-05-06

## Zweck

SoundAlerts-Dashboard nach dem ersten Mapping-UX-Cleanup weiter bereinigen.

## Geändert

Betroffene Dateien:

```text
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

## UI/Fachlogik

### Einträge

- Tab bleibt `Einträge`.
- SoundAlert-Einträge zeigen jetzt zusätzlich Kategorie und daraus erkennbare Standard-Priorität.
- Kategorie-Auswahl im Editor ergänzt:
  - Standard / global
  - Kanalpunkte / SoundAlert (70)
  - Alert / Support (80)
  - Kritischer Alert (90)
  - VIP / Crew (60)
  - Fun / Community (50)
  - TTS (50)
  - Admin (100)
  - System (100)
- Beim Wechsel der Kategorie wird die Priorität auf den passenden Standardwert gesetzt.
- Priorität bleibt bewusst pro Eintrag überschreibbar.

### Events

- Technische Statuswerte werden benutzerfreundlicher angezeigt:
  - `queued` -> `In Warteschlange`
  - `unmatched` / `no_mapping` -> `Nicht eingerichtet` / `Kein Eintrag`
  - `file_missing` / `missing_file` -> `Datei fehlt`
- Erfolgreiche/abspielbare Events bekommen einen Button `Erneut abspielen`.
- Events mit vorhandenem Eintrag bekommen `Eintrag bearbeiten`.
- Unbekannte oder fehlende Events bekommen `Eintrag erstellen`.
- `Eintrag erstellen` erzeugt lokal einen inaktiven SoundAlert-Eintrag aus dem Event und springt in den Editor.

## Nicht geändert

- Keine Backend-Änderung.
- Keine DB-Änderung.
- Keine API-Änderung.
- SoundAlert-Inbox/Import-Workflow aus STEP189 ist noch nicht serverseitig umgesetzt.
- Datei-Upload aus einem Event heraus ist noch offen.

## Test

Syntax:

```text
node -c htdocs/dashboard/modules/soundalerts.js
```

Erwartung:

```text
OK
```

Manuell testen:

1. SoundAlerts öffnen.
2. Einträge prüfen.
3. Kategorie wechseln und prüfen, ob Priorität passend gesetzt wird.
4. Events öffnen.
5. Bei `queued`/erfolgreich: `Erneut abspielen` testen.
6. Bei unbekanntem Sound: `Eintrag erstellen` testen.
7. Neuer Eintrag soll inaktiv im Editor landen.
8. Speichern testen.

## Offene Punkte

- Prioritätswerte später direkt aus `/api/sound/status` bzw. Sound-System-Konfiguration laden statt als Frontend-Konstanten.
- Echte SoundAlert-Inbox serverseitig bauen.
- Datei-Upload/Zuweisung aus unbekannten Events bauen.
