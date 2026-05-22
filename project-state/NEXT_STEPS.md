# NEXT_STEPS

## Direkt nach STEP273C1 testen

1. Patch anwenden:
   ```bat
   node tools\easy\STEP273C1_APPLY_COMMAND_CATALOG.cjs
   ```

2. Syntax:
   ```bat
   node --check backend\modules\commands.js
   node --check htdocs\dashboard\modules\commands.js
   node --check tools\easy\STEP273C1_APPLY_COMMAND_CATALOG.cjs
   ```

3. API:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/commands/catalog"
   Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
   ```

4. Dashboard:
   - Community → Commands → Commands
   - Action-Typ `Modul-Command`
   - Kategorie wählen
   - Modul-Aktion wählen
   - `↩️ Defaults übernehmen`

## Danach

- STEP274A zentrale Medienverwaltung Core.
- STEP274B Medienverwaltung Dashboard.
- STEP274C Commands an Medienverwaltung anbinden.
