# NEXT STEPS - stream-control-center

Stand: 2026-05-05

## Naechster empfohlener Schritt

### STEP182 - Hug/Rehug Dashboard Live-Feinschliff

Ziel:

- Hug/Rehug-Dashboard im Browser pruefen.
- Textpaar-Editor praktisch testen.
- Keine neue Fachlogik, nur UX-/Fehlerkorrekturen falls sichtbar noetig.

Pruefung:

1. Dashboard oeffnen:
   ```text
   Community -> Hug-System -> Texte -> Hug/Rehug-Paare
   ```
2. Pruefen:
   - Werden 30 Textpaare angezeigt?
   - Suche funktioniert?
   - Aktiv/Inaktiv sichtbar?
   - Gewichtung und Sortierung sichtbar?
   - Text und Antwort-Text bleiben als Paar zusammen?
3. Testweise ein Textpaar minimal bearbeiten, speichern, neu laden und wieder zuruecksetzen.

Voraussichtlich betroffene Dateien, falls UX-Korrektur noetig:

- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- ggf. `backend/modules/hug.js`, falls API-Ausgabe nicht passt
- `project-state/*`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Danach moeglich

### Hug/Rehug naechste Text-Kategorien

Nach erfolgreichem Textpaar-Test koennen weitere Kategorien editierbar gemacht werden:

- `hug_all` / Chatweite Hugs
- Systemantworten
- Toplisten-Titel

Wichtig:

- Hug/Rehug-Paare bleiben gekoppelt.
- `hug_all` und Systemantworten duerfen als normale Varianten/Einzeltexte behandelt werden.
- Keine Rueckkehr zur komplizierten Typen-Bedienung.

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
.\stepdone.cmd "fix: improve hug text pair dashboard"
.\stepdone.cmd "docs: sync hug rehug project status"
.\stepdone.cmd "feat: add hug all text editor"
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
