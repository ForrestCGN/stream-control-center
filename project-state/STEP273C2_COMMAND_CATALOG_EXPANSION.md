# STEP273C2 – Command Catalog Erweiterung

## Ziel

Der Modul-Command-Catalog wurde erweitert und fachlich sauberer getrennt.

## Änderungen

- Hug-System als eigene Kategorie ergänzt.
- `!rehug` als echte Modul-Command-Aktion ergänzt.
- Weitere Hug-Aktionen ergänzt: Hug, Stats, Top, Top Received, Top Rehug, On, Off, Reload.
- Tagebuch und Todo getrennt.
- Tagebuch bekommt eigene echte Katalog-Aktionen auf Basis der vorhandenen `/api/tagebuch/*` Routen.
- Todo bleibt vorbereitet, bis die konkrete Todo-Command-Route final geprüft/angebunden wird.
- System/Medien bleibt vorbereitet für STEP274 zentrale Medienverwaltung.

## Wichtige Regel

Neue Backend-Module müssen künftig ihren Command-Catalog pflegen oder im zentralen Catalog ergänzt werden. Sonst tauchen neue Commands nicht im Dashboard-Dropdown auf.

## Nicht geändert

- Keine Medienverwaltung implementiert.
- Keine bestehenden Commands entfernt.
- Keine Streamer.bot-Kompatibilität entfernt.
- Keine bestehenden Tagebuch-/Todo-Routen umgebaut.
