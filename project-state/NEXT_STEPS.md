# NEXT STEPS - stream-control-center

Stand: 2026-05-05

## Naechster empfohlener Schritt

### STEP183 - Hug/Rehug finaler Browser-UX-Check oder naechstes Modul

Der Hug-Texte-Bereich ist technisch komplett:

- Hug/Rehug-Paare editierbar
- Chatweite Hugs editierbar
- Systemantworten editierbar
- Toplisten editierbar

Empfohlene kurze Pruefung:

1. Dashboard oeffnen:
   ```text
   Community -> Hug-System -> Texte
   ```
2. Alle vier Kategorien anklicken:
   - Hug/Rehug-Paare
   - Chatweite Hugs
   - Systemantworten
   - Toplisten
3. Pruefen:
   - Textfelder breit genug?
   - Kleine Felder kompakt genug?
   - Speichern sichtbar?
   - Loeschen sichtbar?
   - Keine Typen-Komplexitaet sichtbar?
   - Text/Antwort bleiben bei Hug/Rehug gekoppelt?

Wenn UX passt, ist Hug/Rehug fuer diesen Block abgeschlossen.

## Danach moeglich

### Hug/Rehug optional

- Audit-Logging fuer Textaenderungen.
- Bessere Hilfe je Text-Key bei Systemantworten.
- Sammel-Speichern statt Einzel-Speichern.
- Rollen/Rechte fuer Textbearbeitung vorbereiten.

### VIP

- Echte 7-/30-Tage-Statistik backendseitig ergaenzen.
- Upload-UX nur behutsam weiter verbessern.
- Sound-Vorschau optional erweitern:
  - Stop-Button
  - aktuelle Vorschau optisch markieren
  - lokale Dashboard-Lautstaerke

### System allgemein

- Provider-/Settings-Ausgaben maskieren, da Settings sensible Werte enthalten koennen.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- Module weiter auf DB-Settings/DB-Texte/Helper-Standard auditieren.

## Aktueller Standardabschluss nach ZIP-Entpacken

Nach jedem neuen ZIP:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "passende commit beschreibung"
```

Beispiele:

```powershell
.\stepdone.cmd "fix: improve hug text editor ux"
.\stepdone.cmd "docs: sync hug text editor status"
.\stepdone.cmd "feat: add vip 30 day stats"
```

## Wichtige Regel fuer Hug/Rehug

Bei Hug/Rehug duerfen Text und Antwort nicht getrennt zufaellig werden.

Richtig:

```text
Text 1 -> Antwort-Text 1
Text 2 -> Antwort-Text 2
```

Falsch:

```text
Text 1 -> zufaellige Antwort 8
```
