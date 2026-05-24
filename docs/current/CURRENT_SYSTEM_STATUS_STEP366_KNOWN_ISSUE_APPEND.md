# CURRENT_SYSTEM_STATUS Append: STEP366 Known Issue

## Offener Befund
Sound-System kann nach Birthday-Bundle/Manual-Stop in einen Zustand geraten, in dem `activeBundleLock` gesetzt bleibt, obwohl `current` und `currentBundle` leer sind.

## Effekt
Neue Birthday-/VIP-Sounds landen in der Queue, starten aber nicht.

## Live-Workaround
`POST /api/sound/clear` löst Queue und Lock.

## Nicht jetzt lösen
Der Fehler ist aufgenommen. Weiterarbeit geht zunächst am Bus/Alert-Thema weiter.
