# NEXT STEPS

Stand: EVS-5d / Text Multi-Phrase + Word Points Documentation  
Datum: 2026-06-13

## Sofort

EVS-5d ist ein Doku-/TODO-Step. Es gibt keinen Syntaxcheck, weil keine Code-Dateien verändert wurden.

Optionaler StepDone:

```powershell
.\stepdone.cmd "EVS-5d Text Multi Phrase Word Points Docs"
```

## Danach

EVS-6 sollte nicht direkt als komplette Runtime gebaut werden.

Empfohlener nächster Schritt:

```text
EVS-6 – Event Item Config Model Planning / Prep
```

Ziel:

```text
- mehrere Sound-Schnipsel pro Event sauber planen
- mehrere Text-Sätze pro Event sauber planen
- Satz-Pool statt Einzeltext abbilden
- Sound-/Text-Items mit Status/Rotation vorbereiten
- Config-Dashboard-Felder vorbereiten
- Text-Config / Multi-Texte berücksichtigen
- vorhandene helper_texts / module_text_variants nutzen
```

## Spätere Schritte

```text
EVS-7 Backend/DB-Migration für Event-Items
EVS-8 Dashboard-Item-Verwaltung
EVS-9 Text-/Chat-Auswertung über twitch.chat.message
EVS-10 Sound-Rundensteuerung über vorhandenes Sound-/Media-System
EVS-11 Overlay/Ranking/Statistik
```

## Nicht vergessen

```text
- Keine parallele Textstruktur bauen.
- Keine parallele Media-/Sound-Struktur bauen.
- Config und Textvarianten müssen dashboardfähig werden.
- User-/Mod-Bedienung muss einfach bleiben.
- Vor jeder Codeänderung echte Dateien/GitHub/dev prüfen.
```


## Nach EVS-6

1. EVS-6 per StepDone sichern.
2. Dashboard prüfen: mehrere Sätze hinzufügen/entfernen, speichern, erneut öffnen.
3. Danach Backend-Runtime für Chat-Erkennung und Satzrotation planen.
4. Später Config-Dashboard und Text-Config/Multi-Texte über vorhandene Text-Helper einbauen.
