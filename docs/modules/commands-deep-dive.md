# Commands-Modul – Dashboard v0.1.5 Exact Saved Command Editor

## Stand
- Backend bleibt auf `commands` Modul `0.1.4` / Build `safe-modal-editor`, sofern keine Backend-Änderung nötig ist.
- Dashboard UI: `0.1.5` / Build `exact-saved-command-editor`.

## Zweck
Beim Bearbeiten eines vorhandenen Commands müssen exakt die gespeicherten Daten angezeigt und gespeichert werden. Katalog-Defaults dürfen nicht automatisch über bestehende Commands gelegt werden.

## Geändert
- Bestehende Commands öffnen im Modal mit den gespeicherten Werten aus der DB.
- Modul-Key, Action-Key und Target-URL bleiben beim Speichern erhalten.
- Der Katalog ist nur noch eine Vorlage.
- Defaults werden nur übernommen, wenn der User bewusst `Defaults bewusst übernehmen` klickt.
- Commands ohne passenden Katalogeintrag werden als `Benutzerdefiniert / gespeicherte Modul-Aktion` angezeigt.
- Der Bereich `Erweitert / technische Details` wird für benutzerdefinierte Modul-Aktionen automatisch geöffnet.

## Wichtig
Für bestehende Commands wie `!so` gilt: gespeicherte Werte sind maßgeblich. Kein Dropdown darf beim Öffnen automatisch einen anderen Modul-Befehl auswählen und dadurch das Routing verfälschen.
