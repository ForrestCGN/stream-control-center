#!/usr/bin/env node
"use strict";

/*
  CAN-44.21.15
  Clip-Shoutout: robustere Clip-Suche + Playback-Kandidaten-Fallback

  Ziel:
  - Zeiträume automatisch um 730/1095/all-time erweitern, auch wenn DB/Config noch 90/365/0 enthält.
  - Wenn ein früher Zeitraum nur fallback_duration liefert, weiter nach besseren duration_ok Clips suchen.
  - Bei clip_playback_missing / no_qualities / incomplete nicht nach einem Clip abbrechen,
    sondern mehrere Kandidaten testen.
*/

const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const root = process.cwd();
const target = path.join(root, "backend", "modules", "clip_shoutout.js");

function fail(msg) {
  console.error("[CAN-44.21.15] FEHLER:", msg);
  process.exit(1);
}

if (!fs.existsSync(target)) {
  fail("Datei nicht gefunden: " + target);
}

let src = fs.readFileSync(target, "utf8");
const original = src;
const backup = target + ".CAN-44.21.15.bak";
if (!fs.existsSync(backup)) fs.writeFileSync(backup, original, "utf8");

function replaceOnce(label, search, replacement) {
  if (!src.includes(search)) fail("Suchblock nicht gefunden: " + label);
  src = src.replace(search, replacement);
  console.log("[CAN-44.21.15] ersetzt:", label);
}

function replaceRegex(label, regex, replacement) {
  if (!regex.test(src)) fail("Regex-Block nicht gefunden: " + label);
  src = src.replace(regex, replacement);
  console.log("[CAN-44.21.15] ersetzt:", label);
}

// Version
replaceOnce(
  "MODULE_VERSION 0.2.26 -> 0.2.27",
  'const MODULE_VERSION = "0.2.26";',
  'const MODULE_VERSION = "0.2.27";'
);

// Default-Zeiträume erweitern. DB-Config kann weiterhin kürzer sein, deshalb zusätzlich normalize-Funktion patchen.
replaceOnce(
  "DEFAULT_CONFIG.clipSearchRangesDays erweitern",
  "    clipSearchRangesDays: [90, 365, 0],",
  "    clipSearchRangesDays: [90, 365, 730, 1095, 0],"
);

// Neue optionale Kandidaten-Grenze einfügen.
replaceOnce(
  "DEFAULT_CONFIG.playbackCandidateLimit einfügen",
  '    recentClipFallbackWhenAllBlocked: true,\n    allowBroadcasterSelfTarget: true,',
  '    recentClipFallbackWhenAllBlocked: true,\n    playbackCandidateLimit: 8,\n    allowBroadcasterSelfTarget: true,'
);

// normalizeClipSearchRanges: zusätzliche Zeiträume immer ergänzen.
replaceOnce(
  "normalizeClipSearchRanges erweitert",
  `  const result = [];
  const seen = new Set();
  for (const value of source) {`,
  `  const extendedSource = Array.isArray(source) ? source.slice() : [];
  for (const extra of [730, 1095, 0]) {
    if (!extendedSource.map(v => String(Math.max(0, Number.parseInt(v, 10) || 0))).includes(String(extra))) {
      extendedSource.push(extra);
    }
  }
  const result = [];
  const seen = new Set();
  for (const value of extendedSource) {`
);

// listClipsForBroadcaster: fallback nicht sofort zurückgeben, sondern weiter nach duration_ok suchen.
replaceOnce(
  "listClipsForBroadcaster fallbackCandidate init",
  `  };

  for (const days of ranges) {`,
  `  };
  let fallbackCandidate = null;

  for (const days of ranges) {`
);

replaceOnce(
  "listClipsForBroadcaster fallback_duration weiter suchen",
  `      if (fallbackOk.length) {
        debug.selectedRange = rangeInfo;
        debug.selectedMode = "fallback_duration";
        return { clips: fallbackOk, rawClips: rawRows, debug };
      }`,
  `      if (fallbackOk.length) {
        if (!fallbackCandidate) {
          fallbackCandidate = {
            clips: fallbackOk,
            rawClips: rawRows,
            selectedRange: { ...rangeInfo },
            selectedMode: "fallback_duration"
          };
        }
      }`
);

replaceOnce(
  "listClipsForBroadcaster unlimited_duration als Fallback-Kandidat",
  `      if (viewRows.length && allowLongerClipFallback && fallbackMaxClipDurationSeconds <= 0) {
        debug.selectedRange = rangeInfo;
        debug.selectedMode = "unlimited_duration";
        return { clips: viewRows, rawClips: rawRows, debug };
      }`,
  `      if (viewRows.length && allowLongerClipFallback && fallbackMaxClipDurationSeconds <= 0) {
        if (!fallbackCandidate) {
          fallbackCandidate = {
            clips: viewRows,
            rawClips: rawRows,
            selectedRange: { ...rangeInfo },
            selectedMode: "unlimited_duration"
          };
        }
      }`
);

replaceOnce(
  "listClipsForBroadcaster fallbackCandidate return",
  `  return { clips: [], rawClips: [], debug };
}`,
  `  if (fallbackCandidate) {
    debug.selectedRange = fallbackCandidate.selectedRange;
    debug.selectedMode = fallbackCandidate.selectedMode;
    return { clips: fallbackCandidate.clips, rawClips: fallbackCandidate.rawClips, debug };
  }

  return { clips: [], rawClips: [], debug };
}`
);

// Neue Candidate-Funktion nach pickClip einfügen.
replaceOnce(
  "buildClipPlaybackCandidates einfügen",
  `function pickClip(clips, cfg, targetLogin = "") {
  const candidates = Array.isArray(clips) ? clips.filter(clip => clipIdOf(clip)) : [];
  if (!candidates.length) return { clip: null, selection: null };

  const avoidRecent = cfg.avoidRecentClips !== false && clipMemoryLimit(cfg) > 0;
  const recentIds = avoidRecent ? getRecentClipIds(targetLogin, cfg) : [];
  const recentSet = new Set(recentIds);
  const nonRecent = avoidRecent ? candidates.filter(clip => !recentSet.has(clipIdOf(clip))) : candidates.slice();

  let pool = nonRecent.length ? nonRecent : candidates;
  const usedFallbackBecauseAllBlocked = avoidRecent && !nonRecent.length && candidates.length > 0;
  if (usedFallbackBecauseAllBlocked && cfg.recentClipFallbackWhenAllBlocked === false) pool = candidates;

  let clip = null;
  if (cfg.randomPick === false) clip = pool[0] || candidates[0];
  else clip = pool[Math.floor(Math.random() * pool.length)] || pool[0] || candidates[0];

  const selection = {
    mode: cfg.randomPick === false ? (avoidRecent ? "first_avoid_recent" : "first") : (avoidRecent ? "random_avoid_recent" : "random"),
    candidateCount: candidates.length,
    recentMemory: recentIds,
    recentBlockedCount: avoidRecent ? candidates.filter(clipItem => recentSet.has(clipIdOf(clipItem))).length : 0,
    poolCount: pool.length,
    usedFallbackBecauseAllBlocked,
    selectedClipId: clipIdOf(clip),
    avoidRecentClips: avoidRecent,
    memoryPerChannel: clipMemoryLimit(cfg)
  };

  return { clip, selection };
}

`,
  `function pickClip(clips, cfg, targetLogin = "") {
  const candidateInfo = buildClipPlaybackCandidates(clips, cfg, targetLogin);
  const ordered = candidateInfo.candidates || [];
  const clip = ordered[0] || null;
  const selection = {
    mode: candidateInfo.mode,
    candidateCount: candidateInfo.candidateCount,
    recentMemory: candidateInfo.recentMemory,
    recentBlockedCount: candidateInfo.recentBlockedCount,
    poolCount: candidateInfo.poolCount,
    usedFallbackBecauseAllBlocked: candidateInfo.usedFallbackBecauseAllBlocked,
    selectedClipId: clipIdOf(clip),
    avoidRecentClips: candidateInfo.avoidRecentClips,
    memoryPerChannel: candidateInfo.memoryPerChannel
  };

  return { clip, selection };
}

function shuffleClipCandidates(items) {
  const arr = Array.isArray(items) ? items.slice() : [];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function buildClipPlaybackCandidates(clips, cfg, targetLogin = "") {
  const candidates = Array.isArray(clips) ? clips.filter(clip => clipIdOf(clip)) : [];
  const avoidRecent = cfg.avoidRecentClips !== false && clipMemoryLimit(cfg) > 0;
  const recentIds = avoidRecent ? getRecentClipIds(targetLogin, cfg) : [];
  const recentSet = new Set(recentIds);
  const nonRecent = avoidRecent ? candidates.filter(clip => !recentSet.has(clipIdOf(clip))) : candidates.slice();
  const recentBlocked = avoidRecent ? candidates.filter(clipItem => recentSet.has(clipIdOf(clipItem))) : [];
  const usedFallbackBecauseAllBlocked = avoidRecent && !nonRecent.length && candidates.length > 0;
  let primaryPool = nonRecent.length ? nonRecent : candidates.slice();
  if (usedFallbackBecauseAllBlocked && cfg.recentClipFallbackWhenAllBlocked === false) primaryPool = candidates.slice();

  const orderedPrimary = cfg.randomPick === false ? primaryPool.slice() : shuffleClipCandidates(primaryPool);
  const primaryIds = new Set(orderedPrimary.map(clipIdOf));
  const orderedFallback = candidates.filter(clip => !primaryIds.has(clipIdOf(clip)));
  const ordered = [...orderedPrimary, ...orderedFallback];

  return {
    candidates: ordered,
    mode: cfg.randomPick === false ? (avoidRecent ? "first_avoid_recent_multi" : "first_multi") : (avoidRecent ? "random_avoid_recent_multi" : "random_multi"),
    candidateCount: candidates.length,
    recentMemory: recentIds,
    recentBlockedCount: recentBlocked.length,
    poolCount: primaryPool.length,
    usedFallbackBecauseAllBlocked,
    avoidRecentClips: avoidRecent,
    memoryPerChannel: clipMemoryLimit(cfg)
  };
}

`
);

// runDisplayJob: single clip -> multi playback candidates
replaceOnce(
  "runDisplayJob single playback -> playback fallback loop",
  `  const pickedClip = pickClip(clips, cfg, targetUser.login);
  const clip = pickedClip.clip;
  const clipSelection = pickedClip.selection || null;
  if (!clip) {
    state.stats.noClips += 1;
    state.lastError = 'no_valid_clip_after_selection';
    state.lastRun = { target: targetUser, targetLogin, error: 'no_valid_clip_after_selection', input: summarizeInput(input), clipSearch: clipSearch.debug || null, failedAt: state.lastRunAt };
    throw new Error('no_valid_clip_after_selection');
  }

  const playbackUrl = await resolveClipPlaybackUrl(clip.id, cfg);
  const playback = await prepareClipPlayback(playbackUrl, clip, targetUser, cfg);`,
  `  const candidateInfo = buildClipPlaybackCandidates(clips, cfg, targetUser.login);
  const maxCandidates = Math.max(1, Math.min(20, Number.parseInt(cfg.playbackCandidateLimit, 10) || 8));
  const playbackAttempts = [];
  let clip = null;
  let playback = null;
  let playbackUrl = "";
  let clipSelection = null;

  for (const candidate of (candidateInfo.candidates || []).slice(0, maxCandidates)) {
    const candidateId = clipIdOf(candidate);
    try {
      const candidatePlaybackUrl = await resolveClipPlaybackUrl(candidateId, cfg);
      const candidatePlayback = await prepareClipPlayback(candidatePlaybackUrl, candidate, targetUser, cfg);
      clip = candidate;
      playback = candidatePlayback;
      playbackUrl = candidatePlaybackUrl;
      clipSelection = {
        mode: candidateInfo.mode,
        candidateCount: candidateInfo.candidateCount,
        recentMemory: candidateInfo.recentMemory,
        recentBlockedCount: candidateInfo.recentBlockedCount,
        poolCount: candidateInfo.poolCount,
        usedFallbackBecauseAllBlocked: candidateInfo.usedFallbackBecauseAllBlocked,
        selectedClipId: candidateId,
        avoidRecentClips: candidateInfo.avoidRecentClips,
        memoryPerChannel: candidateInfo.memoryPerChannel,
        playbackCandidateLimit: maxCandidates,
        playbackAttemptCount: playbackAttempts.length + 1,
        playbackAttempts: [...playbackAttempts, { clipId: candidateId, title: String(candidate.title || ""), ok: true }]
      };
      break;
    } catch (err) {
      playbackAttempts.push({
        clipId: candidateId,
        title: String(candidate && candidate.title || ""),
        error: err && err.message ? err.message : String(err)
      });
    }
  }

  if (!clip || !playback) {
    state.stats.noClips += 1;
    const errorCode = playbackAttempts.length ? 'clip_playback_missing_all_candidates' : 'no_valid_clip_after_selection';
    state.lastError = errorCode;
    state.lastRun = {
      target: targetUser,
      targetLogin,
      error: errorCode,
      input: summarizeInput(input),
      clipSearch: clipSearch.debug || null,
      playbackCandidateLimit: maxCandidates,
      playbackAttempts,
      failedAt: state.lastRunAt
    };
    throw new Error(errorCode);
  }`
);

// state.lastRun ergänzen um playbackAttempts
replaceOnce(
  "state.lastRun playbackAttempts ergänzen",
  `    clipSelection,
    clipSearch: clipSearch.debug || null,
    bundleId: bundlePayload.bundleId,`,
  `    clipSelection,
    clipSearch: clipSearch.debug || null,
    playbackAttempts: clipSelection && Array.isArray(clipSelection.playbackAttempts) ? clipSelection.playbackAttempts : [],
    bundleId: bundlePayload.bundleId,`
);

if (src === original) {
  fail("Keine Änderung erzeugt.");
}

fs.writeFileSync(target, src, "utf8");

try {
  child_process.execFileSync(process.execPath, ["-c", target], { stdio: "inherit" });
} catch (err) {
  fs.writeFileSync(target, original, "utf8");
  fail("node -c fehlgeschlagen. Original wurde zurückgeschrieben. Backup: " + backup);
}

console.log("[CAN-44.21.15] OK: Patch angewendet.");
console.log("[CAN-44.21.15] Backup:", backup);
console.log("[CAN-44.21.15] Nächste Schritte: Backend neu starten, dann /api/clip-shoutout/status prüfen.");
