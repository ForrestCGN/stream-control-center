
## Nächster Schritt nach EVS52.13

1. EVS52.13 einspielen und `stepdone.cmd` ausführen.
2. Backend neu starten.
3. Live testen: Teiltreffer in einem Satz, Teiltreffer in mehreren Sätzen, Soundantwort, Satzlösung, Duplicate.
4. Danach entscheiden: Doku-Abschluss oder Dashboard-Config für Bot-/Systemaccount-Blockliste.

# NEXT_STEPS – stream-control-center

Stand: 2026-06-18 – EVS52.12

## Jetzt testen

EVS52.12 filtert bekannte Bot-/Systemaccounts, damit Heimaufsicht-/Bot-Ausgaben nicht wieder als Spieleingabe verarbeitet werden.

### Nach Deploy

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.chatSource | Format-List
$s.runtime.counters | Select-Object twitchChatMessages,twitchChatSelfSkipped,textMessagesProcessed,soundChatMessagesProcessed,soundAnswerMatches,soundAnswerMisses,textWordHits,textPhraseSolves,chatOutputsLiveSent | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.83
moduleBuild   : STEP_EVS52_12_BOT_SELF_MESSAGE_FILTER
```

### Live-Test-Reihenfolge

1. Genau ein aktives Event sicherstellen.
2. Forrest/Engel/Roxxy/Tronic mit Teilwort testen.
3. Erwartung: Satz/Text wird verarbeitet.
4. Heimaufsicht-Antwort abwarten.
5. Erwartung: `twitchChatSelfSkipped` oder `chatSource.selfSkipped` steigt, aber keine neue Kettenreaktion.
6. Soundantwort testen.
7. Komplette Satzloesung testen.
8. Duplicate testen.
9. `!event status` testen.

## Danach

- Wenn stabil: EVS52.12 dokumentieren und als Hotfix bestaetigen.
- Bot-/Self-Message-Blockliste spaeter dashboardfaehig machen.
- Teiltreffer-Chatmeldungen zusammenfassen/limitieren, damit eine Usernachricht nicht mehrere Chatmeldungen erzeugt.
- Ranking/User-Historie pruefen.
