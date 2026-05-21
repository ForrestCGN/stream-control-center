# NEXT STEPS - stream-control-center

Stand: 2026-05-21

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
