# CHANGELOG

## STEP277A_FIX6
- Avatar-Sanitize im Clip-Shoutout ergänzt.
- Backend verwirft ungültige Avatar-Werte wie `false`, `null`, `undefined`, `0` oder nicht-HTTP-Strings.
- Overlay prüft Avatar-URLs ebenfalls und nutzt bei ungültigen Werten den bestehenden Lookup/Fallback.
- Keine Änderung an Clip-Suche, Video-Retry, Sound-System-Queue oder Download-Cache.

## STEP277A_FIX5
- Avatar-Lookup und Overlay-Cleanup vorbereitet.
- Video-Retry aus FIX4 erhalten.

## STEP277A_FIX4
- Video-Retry im Sound-System-Overlay ergänzt.

## STEP277A_FIX3
- Frühe Video-Error-Events im Overlay entschärft.

## STEP277A_FIX2
- Clip-Suche um Debug/Fallback-Ranges erweitert.

## STEP277A_FIX1
- Command-Target-Fix für `!vso @user`.

## STEP277A
- Clip-Shoutout über Sound-System vorbereitet.
