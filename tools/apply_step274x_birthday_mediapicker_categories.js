'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const mediaPath = path.join(root, 'backend', 'modules', 'media.js');
const birthdayPath = path.join(root, 'htdocs', 'dashboard', 'modules', 'birthday.js');
const pickerPath = path.join(root, 'htdocs', 'dashboard', 'components', 'media_picker.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`file_missing:${path.relative(root, file)}`);
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, before, after, label) {
  if (before === after) {
    console.log(`[skip] ${label} already up to date`);
    return false;
  }
  fs.writeFileSync(file, after, 'utf8');
  console.log(`[patch] ${label}`);
  return true;
}

function replaceOnce(text, search, replacement, label) {
  if (!text.includes(search)) throw new Error(`anchor_not_found:${label}`);
  return text.replace(search, replacement);
}

function patchMediaDefaults() {
  const before = read(mediaPath);
  let after = before;

  const marker = "  { moduleKey: 'birthday', categoryKey: 'general', label: 'Geburtstag / Allgemein', allowedTypes: ['audio', 'video', 'image', 'animation'], isSystem: true },";
  const insert = `${marker}\n  { moduleKey: 'birthday', categoryKey: 'intro', label: 'Geburtstag / Intro-Videos', allowedTypes: ['video', 'animation'], isSystem: true },\n  { moduleKey: 'birthday', categoryKey: 'default-song', label: 'Geburtstag / Standardsongs', allowedTypes: ['audio'], isSystem: true },\n  { moduleKey: 'birthday', categoryKey: 'user-songs', label: 'Geburtstag / User-Songs', allowedTypes: ['audio'], isSystem: true },`;

  if (!after.includes("categoryKey: 'intro', label: 'Geburtstag / Intro-Videos'")) {
    after = replaceOnce(after, marker, insert, 'media birthday category defaults');
  }

  writeIfChanged(mediaPath, before, after, 'backend media birthday category defaults');
}

function patchMediaPickerInitialCategory() {
  const before = read(pickerPath);
  let after = before;
  const oldLine = "    state.categoryKey = '';\n    state.query = '';";
  const newLine = "    state.categoryKey = config.categoryKey || '';\n    state.query = '';";
  if (after.includes(oldLine)) {
    after = after.replace(oldLine, newLine);
  } else if (!after.includes("state.categoryKey = config.categoryKey || '';")) {
    throw new Error('anchor_not_found:media_picker_open_categoryKey');
  }
  writeIfChanged(pickerPath, before, after, 'MediaPicker initial category filter from caller');
}

function patchBirthdayButtonCategories() {
  const before = read(birthdayPath);
  let after = before;

  const introOld = `intro_video: {\n        title: 'Birthday Intro-Video auswählen oder hochladen',\n        allowedTypes: ['video', 'animation']\n      },`;
  const introNew = `intro_video: {\n        title: 'Birthday Intro-Video auswählen oder hochladen',\n        allowedTypes: ['video', 'animation'],\n        categoryKey: 'intro',\n        categoryLabel: 'Geburtstag / Intro-Videos'\n      },`;
  if (after.includes(introOld)) after = after.replace(introOld, introNew);
  else if (!after.includes("categoryKey: 'intro'")) throw new Error('anchor_not_found:birthday_intro_category');

  const defaultOld = `default_song: {\n        title: 'Birthday Standardsong auswählen oder hochladen',\n        allowedTypes: ['audio']\n      },`;
  const defaultNew = `default_song: {\n        title: 'Birthday Standardsong auswählen oder hochladen',\n        allowedTypes: ['audio'],\n        categoryKey: 'default-song',\n        categoryLabel: 'Geburtstag / Standardsongs'\n      },`;
  if (after.includes(defaultOld)) after = after.replace(defaultOld, defaultNew);
  else if (!after.includes("categoryKey: 'default-song'")) throw new Error('anchor_not_found:birthday_default_song_category');

  const userOld = `user_song: {\n        title: 'Birthday User-Song auswählen oder hochladen',\n        allowedTypes: ['audio']\n      }`;
  const userNew = `user_song: {\n        title: 'Birthday User-Song auswählen oder hochladen',\n        allowedTypes: ['audio'],\n        categoryKey: 'user-songs',\n        categoryLabel: 'Geburtstag / User-Songs'\n      }`;
  if (after.includes(userOld)) after = after.replace(userOld, userNew);
  else if (!after.includes("categoryKey: 'user-songs'")) throw new Error('anchor_not_found:birthday_user_song_category');

  const pickerOld = `window.MediaPicker.open({\n      moduleKey: 'birthday',\n      categoryKey: 'general',\n      allowedTypes: cfg.allowedTypes,\n      title: cfg.title,`;
  const pickerNew = `window.MediaPicker.open({\n      moduleKey: 'birthday',\n      categoryKey: cfg.categoryKey || 'general',\n      allowedTypes: cfg.allowedTypes,\n      title: cfg.title,`;
  if (after.includes(pickerOld)) after = after.replace(pickerOld, pickerNew);
  else if (!after.includes("categoryKey: cfg.categoryKey || 'general'")) throw new Error('anchor_not_found:birthday_picker_categoryKey');

  const bodyOld = `kind: cleanKind,\n              mediaId: asset.id,\n              login`;
  const bodyNew = `kind: cleanKind,\n              mediaId: asset.id,\n              login,\n              categoryKey: cfg.categoryKey || 'general',\n              categoryLabel: cfg.categoryLabel || ''`;
  if (after.includes(bodyOld)) after = after.replace(bodyOld, bodyNew);
  else if (!after.includes('categoryLabel: cfg.categoryLabel')) throw new Error('anchor_not_found:birthday_import_payload_category');

  const noticeOld = `state.notice = result?.message || 'Birthday-Medium übernommen.';`;
  const noticeNew = `state.notice = result?.message || ('Birthday-Medium übernommen' + (cfg.categoryLabel ? ' · ' + cfg.categoryLabel : '') + '.');`;
  if (after.includes(noticeOld)) after = after.replace(noticeOld, noticeNew);
  else if (!after.includes("cfg.categoryLabel ? ' · '")) throw new Error('anchor_not_found:birthday_notice_category');

  writeIfChanged(birthdayPath, before, after, 'Birthday MediaPicker category routing');
}

patchMediaDefaults();
patchMediaPickerInitialCategory();
patchBirthdayButtonCategories();

console.log('[ok] STEP274X Birthday MediaPicker categories patched.');
