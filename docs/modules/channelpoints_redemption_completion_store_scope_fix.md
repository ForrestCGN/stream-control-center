# Channelpoints – Redemption Completion Store Scope Fix

Stand: STEP519  
Backend: `0.9.7 · redemption-completion-store-scope-fix`

## Zweck

Dieser Step behebt einen Fehler im Speichern echter Twitch-Redemptions nach der Completion-Policy.

## Fehlerbild

Nach einer echten Twitch-Einlösung wurde die Aktion ausgeführt und Twitch konnte die Einlösung bereits als `FULFILLED` markieren, aber der lokale Store-Vorgang konnte mit folgendem Fehler abbrechen:

```text
completion is not defined
```

## Ursache

`storeNormalizedRedemption(...)` schrieb das Completion-Ergebnis in `result_json`, bekam den Wert aber nicht als Parameter übergeben. Dadurch war `completion` im Funktionsscope nicht definiert.

## Änderung

`storeNormalizedRedemption` nimmt nun `completion` als vierten Parameter entgegen:

```js
storeNormalizedRedemption(normalized, decision, execution, completion)
```

Das vorhandene Completion-Ergebnis wird dadurch sauber in `result_json` gespeichert und im EventBus-Event mit ausgegeben.

## Keine Änderungen

- keine neue Tabelle
- keine DB-Migration
- keine neue Route
- keine Dashboard-Logikänderung
- keine Änderung an der EventBus-Kette

## Erwartung nach Test

Nach einer echten Einlösung:

```text
receivedFromBus > 0
stored > 0
executed > 0
failed = 0
lastError leer
```
