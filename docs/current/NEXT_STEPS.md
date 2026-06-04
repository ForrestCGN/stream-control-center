# NEXT_STEPS

Stand: 2026-06-04

## Direkt als Nächstes empfohlen

```text
CAN-44.20 – Shoutout Dashboard Reorganisation
```

Ziel: Das Shoutout-Dashboard übersichtlicher und nutzerfreundlicher neu strukturieren, ohne bestehende Funktionalität zu entfernen.

## Geplante Dashboard-Zielstruktur

```text
1. Übersicht
2. Chat-Shoutout
3. AutoShoutout
4. Queues
5. Texte
6. Verlauf
7. Statistik
8. Eingehend
9. Diagnose
10. Einstellungen
```

## CAN-44.20 Vorschlag

1. Aktuelle Dashboard-Dateien prüfen:
   - `htdocs/dashboard/modules/shoutout.js`
   - `htdocs/dashboard/modules/shoutout.css`
   - `htdocs/dashboard/modules/auto_shoutout.js`
   - `htdocs/dashboard/modules/auto_shoutout.css`
   - `htdocs/dashboard/modules/shoutout_texts.js`
   - `htdocs/dashboard/modules/shoutout_texts.css`

2. Bestehende Tabs/Routen den neuen Bereichen zuordnen.

3. Erst einen Struktur-/Umbauplan erstellen, bevor Code geändert wird.

4. Dann in kleinen Schritten umbauen:
   - Übersicht aufräumen
   - Chat-Shoutout als eigenen Bereich
   - AutoShoutout besser integrieren
   - Texte-Tab erhalten
   - Produktion/Live-Test unter Diagnose zusammenfassen
   - Settings/Test in echte Einstellungen überführen

## Danach sinnvoll

```text
CAN-44.21 – Runtime Text-Key Migration
```

Ziel: Runtime schrittweise von alten Config-Texten auf `shoutout.*` Textkeys umstellen.

Dabei gilt:

```text
alte Config-Texte bleiben Fallback
auto.greeting bleibt Legacy/Fallback
keine harten Löschungen
keine bestehende Funktionalität entfernen
```

## Später prüfen

- Rechte Navigation eventuell in obere, immer sichtbare Leiste überführen.
- Dashboard insgesamt mehr Platz für Content geben.
- Textvarianten später inhaltlich überarbeiten.
- Shoutout-Statistik und Verlauf besser verbinden.
- EventBus-/Monitoring-Status sichtbarer machen.
