# CURRENT SYSTEM STATUS

STEP277A_FIX8 repariert Clip-Shoutout Direct Playback ohne permanenten MP4-Cache. Der vorherige 500er wurde dadurch verursacht, dass externe Clip-Items eine `soundId` setzten und das Sound-System diese als Preset suchte. Das Clip-Item lässt `soundId` nun weg.
