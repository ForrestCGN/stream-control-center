# CAN44.33 AutoShoutout Settings Truth Fix – Status

## Stand
ZIP erstellt für Backend-Fix in `clip_shoutout.js`.

## Kern
`settings.autoShoutout` in `/api/clip-shoutout/settings` wird auf effektive DB-/Runtime-AutoShoutout-Konfiguration umgestellt.
Alte JSON-/Fallback-Konfiguration wird als `legacyAutoShoutoutConfig` getrennt.

## Modulversion
`clip_shoutout` 0.2.47

## StepDone
`.\stepdone.cmd "CAN44.33 AutoShoutout Settings Truth Fix"`
