# STEP207 – Alert-Regel TTS-Einstellungen im Dashboard aufräumen

Stand: 2026-05-09

## Ziel

Der Regel-Editor im Alert-Dashboard zeigt die TTS-Funktionen jetzt nicht mehr als „TTS vorbereitet“, sondern als echte **Text-to-Speech**-Einstellungen.

Seit STEP206 wird Alert-TTS tatsächlich abgespielt. Deshalb wurde der UI-Bereich fachlich angepasst.

## Geändert

Betroffene Dateien:

- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`

## Neue UI-Struktur

Im Regel-Editor gibt es jetzt einen klaren Bereich **Text-to-Speech** mit:

- `TTS-Ausgabe`: Aus / An
- `Timing`: Nach Alert-Sound / Während Alert
- `Modus`: Nur Audio
- dynamischem Mindestwert:
  - Bits → `Min-Bits für TTS`
  - Donation → `Min-Betrag für TTS`
  - Resub → `Min-Monate für TTS`
  - Channelpoints → `Min-Punkte für TTS`
- `Max. Zeichen`
- `Gesprochener Text / Template`
- Hilfetexte zu Quelle, Mindestwert und Platzhaltern

## Verhalten

Wenn TTS aus ist, werden Detailfelder ausgeblendet und der Status zeigt klar, dass kein TTS abgespielt wird.

Wenn TTS an ist, werden die Detailfelder eingeblendet und der Status erklärt:

> Erst läuft der Alert-Sound. Danach wird der Text per TTS abgespielt. Der Alert bleibt bis zum Ende sichtbar.

## Nicht geändert

- keine Backend-Änderung
- keine DB-Änderung
- keine Alert-Regeln geändert
- keine TTS-Logik geändert
- keine bestehende Funktionalität entfernt

## Prüfung

Syntaxcheck:

```powershell
node -c htdocs/dashboard/modules/alerts.js
```

## Manueller UI-Test

1. Dashboard öffnen
2. Alerts → Regeln
3. Regel bearbeiten
4. Bereich `Text-to-Speech` prüfen
5. TTS-Ausgabe zwischen Aus/An wechseln
6. Quelle/Typ wechseln und prüfen, ob der Mindestwert korrekt beschriftet wird

