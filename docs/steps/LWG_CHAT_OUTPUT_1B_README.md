# LWG_CHAT_OUTPUT_1B – Ticket/Wheel Chat-Output Single-Line Fix

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

## Ziel

Nach `LWG_CHAT_OUTPUT_1` wurden `ticket.*`- und `wheel.*`-Chatmeldungen korrekt gesendet, aber teilweise enthielt eine Chatnachricht zwei Textvarianten hintereinander.

Ursache war ein Legacy-/Migrationsfall: Mehrere Default-Texte konnten als ein mehrzeiliger Legacy-Text in `module_texts` bzw. als eine Mehrzeilen-Variante in `module_text_variants` landen.

## Änderung

`backend/modules/loyalty_giveaways.js`:

- `MODULE_VERSION` auf `0.1.18` erhöht.
- `MODULE_BUILD` auf `LWG_CHAT_OUTPUT_1B` gesetzt.
- Für `ticket.*` und `wheel.*` wird nach der Textauflösung geprüft, ob der gewählte Text mehrere nicht-leere Zeilen enthält.
- Falls ja, wird zufällig genau eine Zeile gewählt.
- Danach wird weiterhin normal sanitizt und über `helper_chat_output` gesendet.

## Nicht geändert

- Keine neuen Texte.
- Keine hartcodierten Chatmeldungen.
- Keine DB-Handarbeit.
- Keine Änderung an `!join` / `!raffle`.
- Keine Änderung an Draw-/Wheel-/Exclusion-Logik.
- Keine Änderung am Testscript.

## Erwartung

`!ticket`, `!wheel` und `!rad` senden weiterhin Chatantworten, aber jeweils nur noch eine einzelne Textvariante pro Antwort.

Beispiel:

```text
ForrestCGN, dein Ticket wurde von der Heimleitung abgestempelt. Du bist mit 1 Ticket(s) im Lostopf.
```

oder:

```text
ForrestCGN, die Rentnergang hat 1 Ticket(s) für dich in die Lostrommel geworfen.
```

Nicht mehr beide Varianten in derselben Nachricht.

## StepDone

```powershell
.\stepdone.cmd "LWG CHAT OUTPUT 1B - Ticket und Wheel Chatmeldungen auf Einzelvariante begrenzt"
```
