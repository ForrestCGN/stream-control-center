# NEXT STEPS – after STEP208 Alert Overlay Username Layout

## Direkt prüfen

1. OBS-Browserquelle aktualisieren.
2. Maximalnamen-Test erneut auslösen.
3. Visuell prüfen:
   - vollständiger Username
   - kein `...`
   - kein Umbruch
   - Value-Zeile korrekt

## Danach möglich

### Design-Kleinschliff

- Nachrichtentext unten etwas größer oder kontrastreicher machen.
- Card-Spacing für lange Nachrichten prüfen.
- Anzeigeprofile pro Alert-Typ optisch angleichen.

### TTS-Konfiguration

- Entscheiden, welche Bits-Stufen dauerhaft TTS bekommen.
- TTS-Min-Werte pro Regel setzen.
- Dashboard-UX für TTS-Felder weiter beobachten.

## Nicht vergessen

Nach Entpacken und Prüfung:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "docs: document alert overlay username layout fix"
```

