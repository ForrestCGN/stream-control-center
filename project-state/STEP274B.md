# STEP274B – Medienverwaltung Test/Fix

## Ziel
Die zentrale Medienverwaltung aus STEP274A1C wurde gegen den aktuellen GitHub/dev-Stand geprüft und mit einem kleinen Sicherheits-/Logikfix stabilisiert, bevor STEP274C die Command-Anbindung bekommt.

## Geändert
- `backend/modules/media.js`
  - STEP-Kennung auf `STEP274B` aktualisiert.
  - Typ-Erkennung für Dateien mit überlappenden Endungen repariert.
  - `.webm` und `.gif` werden bei Upload/Scan in `media/animation` jetzt als `animation` registriert, nicht mehr automatisch als `video`/`image`.
  - Upload-Typ-Ermittlung zentralisiert.
  - Pfadprüfung für Scan/Delete gegen den Assets-Ordner gehärtet.
  - Scan erkennt `media/*` robuster als `media_dir` statt über einen fragilen String-Vergleich.

## Bewusst nicht geändert
- Keine bestehenden Assets werden verschoben.
- Keine vorhandenen Legacy-Ordner werden verändert.
- Keine Command-Anbindung in diesem STEP.
- Keine bestehenden Sound-/Alert-/VIP-/TTS-Funktionen wurden verändert.
- Keine SQLite-Datenbank wird ersetzt oder neu gebaut.

## Minimaltests
- `node --check backend/modules/media.js`

## Empfohlene Live-Tests nach Entpacken
```powershell
cd D:\Git\stream-control-center
node --check backend\modules\media.js
```

Danach Backend starten bzw. neu starten und prüfen:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/media/status
Invoke-RestMethod http://127.0.0.1:8080/api/media/scan
Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=animation&status=all"
Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=video&status=all"
```

Zusätzlich im Dashboard:
- System → Medien öffnen.
- Scan ausführen.
- Prüfen, ob Animationen im Animationen-Tab landen.
- Prüfen, ob Audio/Bilder/Video weiterhin korrekt gelistet werden.

## Nächster sinnvoller Schritt
STEP274C: Commands ↔ Medienverwaltung anbinden, sobald STEP274B live sauber geprüft ist.
