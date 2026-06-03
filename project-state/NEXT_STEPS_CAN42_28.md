# NEXT STEPS — CAN-42.28

Aktueller Stand:

- `/api/diagnostics/registry` existiert.
- Dashboard nutzt die Backend-Registry mit Fallback.
- Registry-Coverage zeigt, ob geladene Backend-Module in der Registry fehlen.

Nächster sinnvoller Schritt:

1. Registry-Coverage lokal testen.
2. Prüfen, ob `missingLoadedModules` leer ist oder bewusst ignorierte Module fehlen.
3. Danach CAN-42.29 planen: Registry aus Modul-Metadaten/Config weiter automatisieren, aber ohne produktive Modul-Logik zu verändern.
