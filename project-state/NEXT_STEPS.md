# NEXT STEP - Nach STEP237

## Hug/Rehug Status

Hug/Rehug ist aktuell fuer API, Dashboard-Basis, Dashboard-Create/Update/Delete bei chatweiten Hug-Texten und Command-Flow geprueft.

Status: **vorlaeufig STABLE**

## Offen nur bei Bedarf

```text
- echten Streamer.bot-Livetest im Chat beobachten
- ggf. weitere Dashboard-Editoren einzeln testen: Textpaare, Systemantworten, Toplisten-Titel
- ggf. Hug/Rehug-History/Statistiken im Dashboard ausbauen
```

## Naechster sinnvoller Systemblock

Jetzt kann das naechste System integriert werden. Sinnvolle Kandidaten:

```text
1. SoundAlerts / Sound-System weiter dashboardfaehig machen
2. VIP-System pruefen und integrieren
3. TTS / Alert-TTS-Wortfilter vorbereiten
4. Loyalty Dashboard/Flow weiter pruefen
```

---


# NEXT STEP - Hug/Rehug nach STEP235

## STEP236 empfohlen: Hug/Rehug Dashboard-Schreibtest und Chat-Flow-Test

Da STEP235 alle Hug-API-Leserouten erfolgreich geprüft hat, folgt als naechstes kein Backend-Umbau, sondern gezielte Schreib-/Flow-Pruefung.

### Dashboard-Schreibtests

1. Hug/Rehug-Paar bearbeiten, speichern, neu laden, wieder zuruecksetzen.
2. Chatweite Hug-Variante hinzufuegen, deaktivieren, loeschen.
3. Systemantwort bearbeiten und zuruecksetzen.
4. Toplisten-Titel bearbeiten und zuruecksetzen.

### Streamer.bot-/Chat-Flow-Test

Zu pruefen:

```text
!hug @user
!rehug @user
!hug stats
!hug top
!hug top received
!hug top rehug
!hug on/off
!hug reload
```

### Entscheidung danach

- Wenn alles funktioniert: Hug/Rehug als STABLE dokumentieren.
- Wenn Dashboard-Schreiben oder Chat-Flow hakt: gezielter STEP236-Fix.

---

# NEXT STEPS - stream-control-center

Stand: 2026-05-11

## Priorität A - Nächster Entwicklungsblock

### 1. Hug/Rehug prüfen und ggf. ins aktuelle Systemmuster bringen

Vor Änderung prüfen:

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
config/hug_system.json
module_text_variants / module-bezogene Hug-Texte
bestehende Routen /api/hug/*
bestehende Dashboard-Routen /api/dashboard/community/hug/*
```

Ziele:

```text
- keine bestehende Hug/Rehug-Funktion brechen
- vorhandene DB-Struktur nicht ersetzen
- Texte variantenfähig/dashboardfähig halten
- Settings/Config sauber kapseln
- Dashboard nur über Backend-APIs
```

## Priorität B - UI/Modul-Konsistenz

Aus STEP234 prüfen:

```text
soundalerts: Section + JS/CSS vorhanden, aber nicht direkt in window.CGN.modules registriert
tts: Section + JS/CSS vorhanden, aber nicht direkt in window.CGN.modules registriert
loyalty: Section + JS/CSS vorhanden, aber nicht direkt in window.CGN.modules registriert
sound_system: Modul-ID nutzt sound.js/sound.css
```

Entscheiden, ob das Absicht ist oder vereinheitlicht werden soll.

## Priorität C - Tools/Testskripte sortieren

Viele alte STEP-Testskripte liegen noch unter `tools/`.

Späterer separater STEP:

```text
- aktive Deploy-/Easy-Skripte behalten
- alte STEP201/STEP202-Testskripte archivieren
- nichts löschen ohne vorheriges Manifest
```

## Priorität D - Optionale Automatisierung

Später sinnvoll:

```text
tools/generate_project_maps.js
```

Ziel:

```text
- Route-Map automatisch aus Backend-Dateien erzeugen
- Dashboard-Map automatisch aus index/app.js erzeugen
- Config-/DB-Map teilweise automatisch erzeugen
```

## Aktuell nicht anfassen

```text
app.sqlite
Secrets / .env
produktive Alert-/Loyalty-/Discord-/Twitch-Logik
historische Analyse-Snapshots
```


## Nach STEP236 - Hug/Rehug Dashboard-Schreibtest wiederholen

Nach Deploy testen:

```text
Dashboard -> Community -> Hug-System -> Chatweite Hugs -> neuen Testtext anlegen
```

Erwartung:

```text
Kein Fehler "Unknown named parameter 'id'"
Text erscheint in der API und kann danach gelöscht werden.
```

API-Prüfung:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/dashboard/community/hug/hug-all-texts" | ConvertTo-Json -Depth 100
```

Danach auch prüfen:

```text
- neues Hug/Rehug-Paar anlegen und löschen
- Response-Text anlegen/löschen
- Toplisten-Titel anlegen/löschen
```
