# Ops Hinweis – alte Shadow-Bridge entfernen

Falls aus LWG-4O.1 noch folgende Datei im Live-/Repo-Stand liegt:

```text
backend/modules/twitch_chat_bus_bridge.js
```

soll sie entfernt werden.

Begründung:

- Die finale Architektur läuft jetzt zentral über `twitch_presence` / `twitch_events` und `twitch.chat.message`.
- `loyalty_giveaways` subscribed direkt auf den Communication Bus.
- Ein zusätzliches Bridge-Modul ist nicht mehr gewünscht und würde eine Parallelstruktur erzeugen.

Dieser ZIP-Step löscht die Datei nicht automatisch. Bitte vor dem Neustart prüfen und manuell entfernen, falls sie vorhanden ist.
