# HT3.3.1 – HypeTrain Dashboard Event-Actions eigener Tab

## Zweck

HT3.3 hatte die Event-Actions zu breit in die HypeTrain-Ansicht gehängt. HT3.3.1 korrigiert die UX: Event-Actions liegen in einem eigenen HypeTrain-Tab.

## Änderung

- Dashboard-Erweiterung injiziert einen eigenen Tab `Event-Actions` in das bestehende HypeTrain-Modul.
- Start, Stufenaufstieg, Ende und Rekord werden nur in diesem Tab angezeigt.
- Übersicht/Config/Texte/Statistik/Tests bleiben getrennt.
- MediaField/MediaPicker bleiben eingebunden.
- Keine Backend-, DB-, SoundSystem- oder Overlay-Änderung.

## Test

Dashboard hart neu laden: `/dashboard?v=ht331`.
Im HypeTrain-Modul muss ein eigener Tab `Event-Actions` sichtbar sein.
