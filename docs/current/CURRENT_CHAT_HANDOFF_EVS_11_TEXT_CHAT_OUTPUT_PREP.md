# CURRENT CHAT HANDOFF – EVS-11 Text Chat Output Prep

## Stand

EVS-11 baut auf EVS-10b auf und bereitet Chat-Ausgaben fuer die Text-Spiel-Runtime vor, ohne direkt in den Twitch-Chat zu senden.

## Geändert

- `backend/modules/stream_events.js`
  - Version `0.4.2`
  - Build `STEP_EVS_11_TEXT_CHAT_OUTPUT_PREP`
  - Textvarianten-Seed erweitert: pro relevantem Key jeweils 5 Varianten im Altersheim-/CGN-/Rentner-/Heimleitungs-Stil.
  - Runtime-Bus-Payloads enthalten vorbereitete `chatOutput`-Objekte.
  - Worttreffer koennen zusaetzlich `wordPointsChatOutput` enthalten, wenn Wortpunkte vergeben wurden.

## Wichtig

- Es wird weiterhin nichts direkt in den Twitch-Chat gesendet.
- Die Ausgabe ist nur vorbereitet und kann spaeter vom Chat-/Bot-Ausgabemodul genutzt werden.
- Es wird weiterhin `helper_texts` / `module_text_variants` genutzt.
- Keine parallele Textstruktur.

## Vorbereitete Textkeys

- `text.partial.general`
- `text.partial.with_sentence`
- `text.word_points.added`
- `text.phrase.solved`
- plus Event-/Sound-/Scoring-Texte ebenfalls mit 5 Varianten.

## Test

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-11 Text Chat Output Prep"
```

Danach wie bei EVS-10b ein Testevent anlegen und mit `test-chat` pruefen. In den Bus-Payloads sind dann vorbereitete Chattexte sichtbar.

## Naechste Schritte

- Chat-Ausgabe-Modul/Route spaeter anbinden.
- Keine direkte Ausgabe ohne Freigabe.
- Danach ggf. Dashboard-Ansicht fuer Runtime-Events/Chat-Outputs oder Statistik vorbereiten.
