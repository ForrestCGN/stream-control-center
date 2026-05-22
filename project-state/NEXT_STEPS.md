# NEXT_STEPS

## Nach STEP273C2 testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/catalog"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
```

Im Dashboard prüfen:

- Community → Commands → Commands
- Action-Typ: Modul-Command
- Kategorien: Deathcounter, Hug-System, Clips, Tagebuch, Todo, System/Medien
- Aktion `Rehug ausführen` sichtbar

## Danach

- STEP274A zentrale Medienverwaltung Core.
- Später Todo-Command-Route final prüfen und Todo-Katalog von prepared auf echte Aktion umstellen.
