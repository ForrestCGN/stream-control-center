# STEP193.6 - SoundAlerts Dashboard Layout Cleanup
Stand: 2026-05-06

## Zweck
Dieser STEP raeumt das SoundAlerts-Dashboard optisch auf, ohne Backend-Funktionalitaet oder bestehende Ablauflogik zu veraendern.

## Geaendert
- Eintragskarten in der linken SoundAlerts-Liste sind besser lesbar.
- Karten-Metadaten bekommen klarere Zeilenstruktur.
- Button-Zeilen in der linken Liste sind gleichmaessiger ausgerichtet.
- Editor-Kopf und Upload-Zeile sind ruhiger und klarer aufgebaut.
- Status-Chips fuer aktive, fehlende, ignorierte und eingerichtete Eintraege bleiben erhalten und werden optisch etwas klarer hervorgehoben.
- Upload-Hinweise bleiben sichtbar, wirken aber weniger gedrungen.

## Bewusst nicht geaendert
- Keine Backend-Datei geaendert.
- Keine API-Routen geaendert.
- Keine DB-Struktur geaendert.
- Keine SoundAlerts-Logik geaendert.
- Keine bestehende Funktionalitaet entfernt.

## Betroffene Datei
```text
htdocs/dashboard/modules/soundalerts.css
```

## Tests
Minimaltest ausreichend, da nur CSS geaendert wurde:
```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: clean up soundalerts dashboard layout"
```

Nach Deploy im Browser pruefen:
```text
Dashboard > System > SoundAlerts > Eintraege
```

Pruefpunkte:
- Linke Eintragskarten sind lesbar.
- Buttons stehen sauber in einer Zeile bzw. mobil untereinander.
- Status-Chips fuer active/missing_file/ignored/file_matched wirken eindeutig.
- Upload-Zeile ist nicht mehr gequetscht.
- Loeschen/Ignorieren/Bearbeiten funktionieren weiterhin.

## Naechster sinnvoller Schritt
Nach Sichtpruefung optional STEP193.7:
- Filter/Ansichten fuer Active / Offen / Ignored / Datei gefunden.
- Nur falls die Eintragsliste bei vielen Sounds zu lang oder unuebersichtlich wird.
