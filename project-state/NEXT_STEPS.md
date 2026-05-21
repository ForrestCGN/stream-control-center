# NEXT STEPS - stream-control-center

## Nach STEP272D1 - Vollständige Defaults prüfen

Nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/config/apply-defaults/preview" | ConvertTo-Json -Depth 80
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/config/apply-defaults" -Body "{}" -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/reload" -Body "{}" -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 100
```

Erwartung in `/api/sound/status`:

```text
config.output.targets.overlay.defaultVolume = 80
config.output.targets.device.defaultVolume = 80
config.output.targets.both.defaultVolume = 80
config.targets.stream.defaultVolume = 80
config.targets.discord.defaultVolume = 80
config.targets.both.defaultVolume = 80
config.defaults.volume = 80
```

Danach weiterhin: bestehende Sounds nicht blind überschreiben, sondern zuerst eine Massenaktion-Preview pro Bereich bauen.

# NEXT STEPS - stream-control-center

## Nach STEP272D - Upload-/Playback-Defaults testen

API-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/config/apply-defaults/preview" | ConvertTo-Json -Depth 80
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/config/apply-defaults" -Body "{}" -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/settings" | ConvertTo-Json -Depth 80
```

Dashboard-Test:

```text
System -> Sound-Pegel -> Config
Preview laden
Defaults anwenden
Backend neu starten oder Module neu laden
Referenzsound/Testton und neue Upload-Fallbacks prüfen
```

Naechster Schritt: bestehende Sounds nicht blind überschreiben, sondern zuerst eine Massenaktion-Preview pro Bereich bauen.


Stand: 2026-05-21

## Nach STEP272B3 - Referenz-Ausgabeweg testen

Dashboard-Test:

```text
System -> Sound-Pegel -> Referenz
Ausgabeweg: OBS/Overlay -> Referenzsound und Test-Ton pruefen
Ausgabeweg: Audiogeraet -> Referenzsound und Test-Ton pruefen
Ausgabeweg: OBS + Audiogeraet -> Referenzsound und Test-Ton pruefen
```

Erwartung:

```text
Referenzsound und Test-Ton nutzen denselben gewaehlten Ausgabeweg.
Test-Ton kann jetzt auch ueber Device laufen.
```

Naechster sinnvoller Schritt:

```text
Sound-Pegel Config-Seite fuer wichtigste Einstellungen bauen.
Danach Ergebnisse relativ zur Auto-Referenz bewerten.
```

# NEXT STEPS - stream-control-center

Stand: 2026-05-21


## Nach STEP272B2 - Testton ueber OBS pruefen

Backend neu starten und pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/reference/test-file" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=generated/reference_test.wav&outputTarget=overlay&target=stream&volume=80&override=true" | ConvertTo-Json -Depth 80
```

Dashboard-Test:

```text
System -> Sound-Pegel -> Referenz
Referenzsound abspielen
Test-Ton ueber OBS abspielen
OBS-/Voicemeeter-Pegel am Laptop pruefen
```

Naechster sinnvoller Schritt:

```text
Sound-Pegel Config-Seite fuer die wichtigsten Einstellungen bauen.
```

## Nach STEP272B1 - Test-Ton ueber OBS pruefen

Dashboard-Test:

```text
System -> Sound-Pegel -> Referenz
Referenzsound abspielen
Test-Ton ueber OBS abspielen
OBS/Voicemeeter-Pegel beobachten
Test-WAV oeffnen nur zum Gegenhoeren verwenden
```

Erwartung:

```text
Test-Ton startet ueber Sound-System/OBS-Overlay.
Referenzsound bleibt die wichtigere Praxis-Referenz.
Keine Sound-Dateien werden veraendert.
```

Naechster sinnvoller Schritt:

```text
STEP272C/STEP273 - Sound-Pegel Config-Seite fuer wichtige Einstellungen:
- Korrektur aktiv/aus
- Ziel/Referenzmodus
- Toleranz
- Scan-Limit/Result-Limit
- TTS ausschliessen
- Max Boost/Max Cut/Korrektur-Staerke
- Normalisierte Kopien vorbereiten
```

# NEXT STEPS - stream-control-center

Stand: 2026-05-21

## Nach STEP272B - Auto-Referenz testen

Backend-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/reference" | ConvertTo-Json -Depth 80
```

Dashboard-Test:

```text
System -> Sound-Pegel -> Referenz
Auto-Referenz prüfen
Referenzsound abspielen
OBS/Voicemeeter auf Referenzsound einstellen
Technischen Test-Sound optional gegenprüfen
```

Erwartung:

```text
Referenzwert wird aus Nicht-TTS-Sounds berechnet.
Ein echter Referenzsound wird vorgeschlagen.
Test-WAV ist abrufbar.
Keine Sound-Dateien werden verändert.
```

Danach möglich:

```text
STEP272C: Ergebnis-Tabelle um Abweichung zur Referenz und Bewertung erweitern.
STEP272D: Playback-Korrektur optional auf Auto-Referenz statt globalem Zielwert umstellen.
STEP273: per Datei/Kategorie Override vorbereiten.
```

# NEXT STEPS - stream-control-center

Stand: 2026-05-21

## Nach STEP272A - Sound-Pegel Tabs testen

Dashboard-Test:

```text
System -> Sound-Pegel
Tabs pruefen: Übersicht, Scan, Ergebnisse, Korrektur, Kopien
Scan-Tab: Scan starten und Fortschritt beobachten
Ergebnisse-Tab: Suche, Filter und Sortierung pruefen
Korrektur-Tab: Settings anzeigen/speichern pruefen
Kopien-Tab: vorbereitete Export-Einstellungen pruefen
```

Erwartung:

```text
Sound-Pegel ist uebersichtlicher getrennt.
Keine Backend-/Playback-/Queue-/Discord-Aenderung.
```

Naechster sinnvoller Schritt:

```text
STEP272B/STEP273: Auto-Referenz + empfohlener Referenzsound + optionaler Test-Sound.
```

## Nach STEP271 - Sound-Pegel eigenes Dashboard-Modul testen

Dashboard-Test:

```text
Dashboard oeffnen
System -> Sound-Pegel
Pegel-Status laden
Scan starten
Fortschritt beobachten
Korrektur-Vorschau pruefen
System -> Sound-System oeffnen und pruefen, dass der normale Sound-System-Bereich weiterhin uebersichtlich laedt
```

Erwartung:

```text
Sound-Pegel ist als eigenes Modul sichtbar.
Sound-System enthaelt Pegel-Scan nicht mehr als Untertab.
Backend-Routen bleiben /api/sound/loudness/*.
Keine Sound-Dateien werden veraendert.
```

Danach moeglich:

```text
STEP272: Auto-Referenz + empfohlener Referenzsound + optionaler Test-Sound.
```


## Nach STEP270G1 - Safe-Tuning testen

Testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/correction/settings" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=airhorn.mp3&outputTarget=device&target=stream&volume=80" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 100
```

Erwartung:

```text
Airhorn wird nicht mehr extrem heruntergezogen.
current.levelCorrection zeigt originalVolume, correctedVolume, rawGainDb, gainDb, strengthPercent und notes.
Bei Bedarf im Dashboard Korrektur-Staerke / Mindest-Volume anpassen.
```

Wenn einzelne Sounds weiterhin nicht passen, naechster Schritt: per-Datei Overrides statt globale Korrektur weiter verschaerfen.


## Nach STEP270G - optionale Pegel-Korrektur vorsichtig testen

Zuerst ausgeschaltet pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 80
```

Dann im Dashboard:

```text
System -> Sound-System -> Pegel-Scan
Playback-Korrektur aktivieren
Pegel-Einstellungen speichern
```

Danach mit einzelnen Test-Sounds pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=airhorn.mp3&outputTarget=device&target=stream&volume=80" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 80
```

Erwartung:

```text
config.levelCorrection.active=true
item.levelCorrection.applied=true bei gescannten Nicht-TTS-Audiodateien
stats.levelCorrected steigt
Originaldateien bleiben unveraendert
```

Wenn etwas komisch klingt:

```text
Playback-Korrektur im Dashboard wieder deaktivieren.
Keine Dateien muessen zurueckgespielt werden, weil nichts normalisiert/ueberschrieben wurde.
```

Normalisierte Kopien bleiben ein separater spaeterer Schritt und duerfen Originaldateien nicht ueberschreiben.

## Nach STEP270D1 - Pegel-Scan ohne TTS testen

Backend-/API-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" -Body (@{ limit = 500 } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=250&order=relative_path&dir=asc" | ConvertTo-Json -Depth 80
```

Erwartung:

```text
Status zeigt excludeTts=true.
Neue Scans erfassen keine TTS-/Speech-Dateien.
Results zeigen standardmaessig keine TTS-/Speech-Dateien.
Dashboard zeigt Pegel-Scan mit Hinweis TTS raus.
```

Danach erst entscheiden:

```text
STEP270E: Technisches Konzept fuer optionale Playback-Korrektur im Sound-System
oder problematische Dateien manuell ersetzen/normalisieren
```


## Nach STEP270D - Korrektur-Vorschau prüfen

Dashboard-Test:

```text
Dashboard öffnen
System -> Sound-System
Tab: Pegel-Scan
Korrektur-Vorschau anzeigen aktiv lassen
Problematische zuerst prüfen
Mouseover über Vorschau-Spalte prüfen
Lauteste zuerst prüfen
Leiseste zuerst prüfen
Filter Warnungen + Suche nach alerts/ prüfen
```

Erwartung:

```text
Vorschau zeigt, welche Sounds später leiser/lauter würden.
Es wird weiterhin nichts angewendet.
Keine Sound-Datei wird verändert.
Keine Playback-Korrektur ist aktiv.
```

Danach erst entscheiden:

```text
STEP270E: Technisches Konzept für optionale Playback-Korrektur im Sound-System
oder problematische Dateien manuell ersetzen/normalisieren
```

Wichtig:

```text
Playback-Korrektur darf später nur zentral im Sound-System greifen, damit stream/device/discord/both konsistent bleiben.
Originaldateien nicht automatisch überschreiben.
```


## Nach STEP270C - Pegel-Scan UI prüfen

Dashboard-Test:

```text
Dashboard öffnen
System -> Sound-System
Tab: Pegel-Scan
Mouseover über LUFS, True Peak, Gain, Volume, Warnungen prüfen
Problematische zuerst prüfen
Lauteste zuerst prüfen
Leiseste zuerst prüfen
Filter Warnungen + Suche nach alerts/ prüfen
```

Erwartung:

```text
Werte sind verständlicher erklärt.
Tabelle bleibt read-only.
Keine Sound-Datei wird verändert.
Keine Playback-Korrektur ist aktiv.
```

Danach erst entscheiden:

```text
STEP270D: Playback-Korrektur nur als Vorschau/Plan anzeigen
oder problematische Dateien manuell ersetzen/normalisieren
```

## Nach STEP270B - Pegel-Scan Dashboard testen

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc" | ConvertTo-Json -Depth 80
```

Dashboard-Test:

```text
Dashboard öffnen
System -> Sound-System
Tab: Pegel-Scan
Neu laden klicken
Scan-Limit 500 setzen
Scan starten
Filter Warnungen prüfen
Button Problematische zuerst prüfen
Suche nach alerts/ prüfen
```

Erwartung:

```text
Tab Pegel-Scan ist sichtbar.
Scan startet über Backend-API.
Tabelle zeigt LUFS, True Peak, Gain, Volume, Dauer und Warnungen.
Keine Sound-Datei wird verändert.
Sound-System Queue/Discord/Alerts/TTS bleiben unverändert.
```

## Danach moeglich - STEP270C Playback-Korrektur planen

Erst nach Sichtpruefung der Messwerte entscheiden:

```text
Nur Playback-Gain pro Datei anwenden
oder normalisierte Kopien erzeugen
oder zunächst nur manuell problematische Dateien austauschen
```

Empfehlung:

```text
Keine Originaldateien automatisch überschreiben.
Zuerst Playback-Korrektur optional und abschaltbar planen.
Korrektur muss zentral im Sound-System greifen, damit stream/device/discord/both konsistent bleiben.
```


## Nach STEP270E - Pegel-Scan mit Fortschritt testen

Nach Deploy:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" -Body (@{ limit = 500; async = $true } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 80
```

Dashboard-Test:

```text
System -> Sound-System -> Pegel-Scan
Scan starten
Fortschrittsbalken, aktuelle Datei und Zaehler beobachten
Nach Abschluss Ergebnisse pruefen
```

Naechster optionaler Schritt erst nach Sichttest: Playback-Korrektur technisch planen, aber weiterhin nicht automatisch aktivieren.

## Nach STEP269A-C - Sound-/Discord-Integration beobachten und spaeter dashboardfaehig machen

STEP269A bis STEP269C sind funktional bestaetigt:

```text
Sound-System kann Discord als Ausgabeziel nutzen.
Sound-System kann passende Kategorien/Quellen automatisch nach Discord routen.
VIP-/Mod-Sounds laufen nicht mehr hart nur nach stream, sondern koennen ueber soundSystemTarget nach both laufen.
```

Naechste Beobachtung im echten Betrieb:

```text
SoundAlerts/Kanalpunkte kommen im Discord an.
Alert-Hauptsounds kommen im Discord an, falls gewuenscht.
Alert + Alert-TTS bleiben als Bundle sauber zusammen.
Normales Chat-TTS nur nach Discord routen, wenn es wirklich gewuenscht ist.
```

Spaeterer Dashboard-/Control-Center-Punkt:

```text
Sound-/Discord-Routing soll im Dashboard konfigurierbar werden.
```

Wichtig: Discord bleibt Ausgabeziel des Sound-Systems. Keine zweite fachliche Discord-Queue bauen.


## Nach STEP270F - Pegel-Korrektur erst weiter pruefen

Naechster Schritt nur nach Dashboard-Test:

```text
STEP270G: optionale Playback-Korrektur im Sound-System vorbereiten, standardmaessig AUS.
```

Vorher pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/correction/settings" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/correction/preview?limit=50" | ConvertTo-Json -Depth 80
```

Normalisierte Kopien bleiben ein separater spaeterer Schritt und duerfen Originaldateien nicht ueberschreiben.


## Nach STEP272C - Sound-Pegel Config testen

Backend-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/config" | ConvertTo-Json -Depth 80
```

Dashboard-Test:

```text
System -> Sound-Pegel -> Config
Default Playback Volume = 80 pruefen
Upload Default Volume = 80 pruefen
Config speichern
Seite neu laden
Werte muessen aus SQLite wieder geladen werden
```

Wichtig:

```text
Dieser Step speichert nur zentrale Defaults.
Upload-Module lesen diese Werte noch nicht automatisch.
Bestehende Sounds werden noch nicht massenhaft geaendert.
```

Naechste sinnvolle Schritte:

```text
STEP272D: Upload-Defaults in Alert-/SoundAlert-/VIP-Uploadstrecken anbinden.
STEP272E: Massenaktion Preview fuer vorhandene Sound-Volumes bauen.
STEP272F: Boost-Kopien fuer zu leise Sounds vorbereiten.
```


## STEP272E - Sound-Pegel bestehende Volume-Preview
- Neue Read-only API `GET /api/sound/loudness/config/mass-volume-preview`.
- Dashboard `System -> Sound-Pegel -> Config` zeigt eine Volume-Preview fuer bestehende Alert-/SoundAlert-/VIP-Daten.
- Pegel-Scan-Bewertung markiert Kandidaten fuer Boost-Kopie oder Runtime-Absenkung.
- Keine Massenänderung, keine Sounddatei-Änderung, keine config/**-Änderung.


## Nach STEP272G

1. Einzeltest mit `alerts/follow.mp3`: Boost-Kopie erzeugen und Original vs. Kopie über OBS/Device vergleichen.
2. Wenn die Kopie passt: gezielte Nutzung/Mapping vorbereiten, noch keine Massenumleitung.
3. Video-SoundAlerts separat behandeln, da Video-Dateien andere FFmpeg-Strategie benötigen.

## Nach STEP272G1
1. Backend neu starten.
2. `POST /api/sound/loudness/config/adopt-reference-target` testen oder im Dashboard „Referenz als Boost-Ziel übernehmen“ klicken.
3. Boost-Kopie fuer `alerts/follow.mp3` neu erzeugen und Original/Kopie vergleichen.
4. Wenn Ziel passt: Mapping/Umleitung einzelner Regeln auf Boost-Kopien vorbereiten.
5. Video-Dateien wie `soundalerts/video/putzen.webm` separat behandeln.


## Nach STEP272H

1. Für `alerts/follow.mp3` bei Bedarf Sicherheitsabstand auf 0 oder 1 dB stellen und Boost-Kopie mit Overwrite neu erzeugen.
2. Original und Boost-Kopie erneut bei Volume 80 vergleichen.
3. Wenn die Kopie passt: im Dashboard `Kopie übernehmen` nutzen.
4. Danach echten Alert testen, der weiterhin auf `alerts/follow.mp3` zeigt.
5. Bei Problem: über Promote-Historie Rollback ausführen.
6. Danach weitere einzelne Audio-Dateien behandeln; Video-Dateien wie `.webm` separat planen.


## Nach STEP272I

- `alerts/follow.mp3` mit Slider/Presets erneut feinjustieren.
- Wenn Pegel passt: Boost-Kopie übernehmen und Backup/Rollback prüfen.
- Danach weitere zu leise Audio-Dateien einzeln bearbeiten.
- Video-Dateien wie `soundalerts/video/putzen.webm` später separat unterstützen.


## Nach STEP272I1

- `alerts/follow.mp3` im Dashboard mit gewünschtem Boost testen.
- Original und Test-Kopie über denselben Ausgabeweg vergleichen.
- Wenn passend: `Als Original übernehmen` nutzen.
- Danach echten Alert testen, der weiterhin auf `alerts/follow.mp3` zeigt.
- Bei Bedarf Rollback über die Promote-Historie ausführen.
- Danach weitere zu leise Audio-Dateien einzeln bearbeiten.
- Video-Dateien wie `soundalerts/video/putzen.webm` später separat unterstützen.
