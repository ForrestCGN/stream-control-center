# CHANGELOG

## STEP274B
- Medienverwaltung gegen GitHub/dev geprüft.
- Media-Core von STEP274A1C auf STEP274B aktualisiert.
- Typ-Erkennung für überlappende Dateiendungen repariert: `.webm`/`.gif` können jetzt korrekt als Animation registriert werden, wenn sie im Animation-Kontext gescannt oder hochgeladen werden.
- Upload-Typ-Ermittlung zentralisiert.
- Pfadprüfung bei Scan/Delete gegen den Assets-Ordner gehärtet.
- Projektstatus, Files und Next Steps auf Medienverwaltung aktualisiert.

## STEP_BIRTHDAY_010
- Birthday-Overlay-FX-Reset bei internem Scene-Wechsel entfernt.
- Vordergrund-FX-Layer für dezente Herzen über der Kachel ergänzt.
- Hintergrund-FX leicht beruhigt, damit das Overlay festlich, aber nicht überladen wirkt.

## STEP_BIRTHDAY_009
- Birthday-Overlay optisch verfeinert.
- Name-Zeile gegen abgeschnittene Unterlängen angepasst.
- Dezente Happy-Birthday-Hintergrundtexte und ruhige Herz-FX ergänzt.

## STEP_BIRTHDAY_008
- Birthday-Textauswahl gegen doppelte Mehrzeilen-Posts abgesichert.
- Command-Payload um Rollen-/Badge-Infos erweitert.
- `!birthday party @user` auf Mod/Broadcaster/Allowlist begrenzt.
- Debug-Scene-Label im Birthday-Overlay aus normaler Ansicht entfernt.

## STEP_BIRTHDAY_006E
- Zusätzlichen Birthday-Chat-Fallback entfernt/deaktiviert.
- Command-Ausführung bleibt zentral über commands.js.
- Auto-Gratulation über Chat-Aktivitäts-Hook bleibt erhalten.
