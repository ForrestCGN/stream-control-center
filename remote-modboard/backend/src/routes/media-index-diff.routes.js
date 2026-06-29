'use strict';

const path = require('path');
const {
  buildAgentMediaInventoryStatusResponse,
  buildAgentConnectionSummary
} = require('../services/agent-runtime.service');
const { withReadOnlyConnection, publicDbError } = require('../services/db.service');

const MODULE = 'remote_media_index_diff_readonly';
const STATUS_API_VERSION = 'rdap_media_index_diff_effective_change_counts_058g.v1';
const PREVIOUS_STATUS_API_VERSION = 'rdap_media_index_diff_modified_at_soft_match_058f.v1';
const BUILD = 'RDAP_0.2.58G_MEDIA_INDEX_DIFF_EFFECTIVE_CHANGE_COUNTS';
const PREVIOUS_BUILD = 'RDAP_0.2.58F_MEDIA_INDEX_DIFF_MODIFIED_AT_SOFT_MATCH_POLICY';
const ROUTE = '/api/remote/media/index/diff/status';
const PERSISTENT_INDEX_TABLE = 'remote_media_index';
const DEFAULT_PREVIEW_LIMIT = 20;
const MAX_PREVIEW_LIMIT = 50;
const MAX_DB_ROWS = 2000;
const MODIFIED_AT_TOLERANCE_MS = 1500;
const MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS = 5000;
const MODIFIED_AT_SOFT_OFFSET_BUCKETS = Object.freeze([
  { key: 'one_hour', ms: 60 * 60 * 1000 },
  { key: 'two_hours', ms: 2 * 60 * 60 * 1000 }
]);

const MEDIA_ALLOWED_EXTENSIONS = Object.freeze(['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.mp4', '.png', '.jpg', '.jpeg', '.webp', '.gif']);
const MEDIA_ROOT_KEYS = new Set(['sounds', 'videos', 'images']);

function registerMediaIndexDiffRoutes(app, context) {
  app.get(ROUTE, async (req, res) => {
    const result = await buildMediaIndexDiffStatus(context, req);
    res.status(result.httpStatus || 200).json(result.body || result);
  });
}

async function buildMediaIndexDiffStatus(context = {}, req = null) {
  const generatedAt = new Date().toISOString();
  const previewLimit = readPreviewLimit(req);
  const agentStatus = safeBuildAgentMediaInventoryStatus();
  const connectionSummary = safeBuildAgentConnectionSummary();
  const agentInventory = sanitizeAgentInventory(agentStatus, connectionSummary);
  const agentSnapshotDiagnostic = buildAgentSnapshotDiagnostic({ agentInventory, connectionSummary });
  const agentSnapshotUnavailable = agentSnapshotDiagnostic.available !== true;

  let dbInventory;
  try {
    dbInventory = await readPersistentIndexItems(context.config || {});
  } catch (err) {
    const code = publicDbError(err).code || 'media_index_diff_db_read_failed';
    const emptyCounts = buildEmptyCounts();
    return {
      ok: false,
      httpStatus: 200,
      service: 'remote-modboard',
      module: MODULE,
      moduleVersion: context.appVersion || '0.2.58G',
      moduleBuild: context.moduleBuild || BUILD,
      routeBuild: BUILD,
      previousRouteBuild: PREVIOUS_BUILD,
      statusApiVersion: STATUS_API_VERSION,
      previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
      route: ROUTE,
      generatedAt,
      readOnly: true,
      writeEnabled: false,
      active: false,
      status: code,
      error: code,
      agent: buildAgentSummary(agentInventory, agentSnapshotUnavailable),
      agentSnapshotDiagnostic,
      database: { table: PERSISTENT_INDEX_TABLE, readOnly: true, total: 0, active: false },
      counts: emptyCounts,
      previewLimit,
      previews: buildEmptyPreviews(),
      comparePolicy: buildComparePolicy(),
      reliability: buildReliabilityBlock({
        agentInventory,
        agentSnapshotDiagnostic,
        dbInventory: { truncated: false },
        diff: { counts: emptyCounts }
      }),
      safety: buildSafetyBlock(),
      note: 'Diff-Diagnose konnte die Online-DB nicht read-only lesen. Es wurden keine Writes ausgefuehrt.'
    };
  }

  const diff = buildDiff({
    agentItems: agentInventory.items,
    dbItems: dbInventory.items,
    previewLimit,
    agentTruncated: agentInventory.truncated,
    agentSnapshotUnavailable,
    dbTruncated: dbInventory.truncated
  });

  const reliability = buildReliabilityBlock({ agentInventory, agentSnapshotDiagnostic, dbInventory, diff });

  return {
    ok: true,
    service: 'remote-modboard',
    module: MODULE,
    moduleVersion: context.appVersion || '0.2.58G',
    moduleBuild: context.moduleBuild || BUILD,
    routeBuild: BUILD,
    previousRouteBuild: PREVIOUS_BUILD,
    statusApiVersion: STATUS_API_VERSION,
    previousStatusApiVersion: PREVIOUS_STATUS_API_VERSION,
    route: ROUTE,
    generatedAt,
    readOnly: true,
    writeEnabled: false,
    active: true,
    status: agentSnapshotUnavailable ? 'diff_available_agent_snapshot_unavailable' : (agentInventory.truncated ? 'diff_available_agent_snapshot_truncated' : 'diff_available'),
    source: 'agent_snapshot_vs_remote_media_index_readonly',
    agent: buildAgentSummary(agentInventory, agentSnapshotUnavailable),
    agentSnapshotDiagnostic,
    database: { table: PERSISTENT_INDEX_TABLE, readOnly: true, total: dbInventory.total, returned: dbInventory.items.length, truncated: dbInventory.truncated, active: dbInventory.items.length > 0 },
    counts: diff.counts,
    previewLimit,
    previews: diff.previews,
    comparePolicy: buildComparePolicy(),
    reliability,
    safety: buildSafetyBlock(),
    nextSteps: [
      'Agent-Snapshot-Verfuegbarkeit pruefen, bevor missingOnAgent als Loeschstatus bewertet wird.',
      'Bei agent_snapshot_available den Diff erneut bewerten.',
      'Gated Delta-Upsert separat planen.',
      'Tombstone/deleted=1 nur spaeter mit eigenem Gate, Confirm, Audit/Lock und Readback planen.',
      'Upload/Edit/Delete bleibt aus.'
    ],
    note: agentSnapshotUnavailable
      ? 'Diese Route vergleicht read-only. Der Agent-Snapshot ist leer oder nicht verfuegbar; agentSnapshotDiagnostic zeigt die wahrscheinliche Ursache. Es wird kein belastbarer missingOnAgent-/Loeschstatus abgeleitet.'
      : 'Diese Route vergleicht read-only Agent-Snapshot und remote_media_index. 0.2.58G ergaenzt Effective-/Strict-Change-Counts. Sie schreibt nichts und fuehrt keine Dateiaktion aus.'
  };
}

function safeBuildAgentMediaInventoryStatus() {
  try {
    if (typeof buildAgentMediaInventoryStatusResponse !== 'function') return null;
    return buildAgentMediaInventoryStatusResponse();
  } catch (err) {
    return null;
  }
}

function safeBuildAgentConnectionSummary() {
  try {
    if (typeof buildAgentConnectionSummary !== 'function') return {};
    return buildAgentConnectionSummary() || {};
  } catch (err) {
    return {};
  }
}

function sanitizeAgentInventory(agentStatus, connectionSummary = {}) {
  const status = agentStatus && typeof agentStatus === 'object' && !Array.isArray(agentStatus) ? agentStatus : {};
  const inventory = status.inventory && typeof status.inventory === 'object' && !Array.isArray(status.inventory) ? status.inventory : {};
  const rawItems = Array.isArray(inventory.items) ? inventory.items : [];
  const items = rawItems.map(sanitizeMediaItem).filter(Boolean);
  const counts = inventory.counts && typeof inventory.counts === 'object' && !Array.isArray(inventory.counts) ? inventory.counts : {};
  const totalSeen = safeNonNegativeNumber(counts.totalSeen || counts.total || rawItems.length);
  const returned = safeNonNegativeNumber(counts.returned || items.length);
  const summary = connectionSummary && typeof connectionSummary === 'object' && !Array.isArray(connectionSummary) ? connectionSummary : {};
  return {
    active: status.active === true || inventory.active === true || items.length > 0,
    connected: Boolean((status.agent && status.agent.connected === true) || summary.connected === true),
    connectionState: safeStatus((status.agent && status.agent.connectionState) || summary.connectionState || ''),
    lastSeenAt: safeIsoOrNull((status.agent && status.agent.lastSeenAt) || summary.lastSeenAt),
    lastHeartbeatAt: safeIsoOrNull((status.agent && status.agent.lastHeartbeatAt) || summary.lastHeartbeatAt),
    heartbeatAgeMs: safeNullableNumber((status.agent && status.agent.heartbeatAgeMs) || summary.heartbeatAgeMs),
    stale: Boolean((status.agent && status.agent.stale === true) || summary.stale === true),
    lastMediaInventorySyncAt: safeIsoOrNull((status.agent && status.agent.lastMediaInventorySyncAt) || summary.lastMediaInventorySyncAt),
    mediaInventorySyncSeq: safeNullableNumber(summary.mediaInventorySyncSeq),
    mediaInventorySyncRejectCount: safeNonNegativeNumber(summary.mediaInventorySyncRejectCount),
    lastMediaInventorySyncRejectAt: safeIsoOrNull(summary.lastMediaInventorySyncRejectAt),
    lastMediaInventorySyncRejectReason: safeReason(summary.lastMediaInventorySyncRejectReason),
    mediaFullSync: sanitizeMediaFullSync(summary.mediaFullSync),
    source: safeStatus(inventory.source || 'agent_memory'),
    items,
    returned: returned || items.length,
    totalSeen: Math.max(totalSeen, items.length),
    truncated: inventory.truncated === true || totalSeen > items.length || rawItems.length > items.length,
    hasMore: inventory.hasMore === true
  };
}

function buildAgentSnapshotDiagnostic({ agentInventory, connectionSummary }) {
  const inventory = agentInventory && typeof agentInventory === 'object' && !Array.isArray(agentInventory) ? agentInventory : {};
  const connection = connectionSummary && typeof connectionSummary === 'object' && !Array.isArray(connectionSummary) ? connectionSummary : {};
  const connected = inventory.connected === true || connection.connected === true;
  const itemCount = Array.isArray(inventory.items) ? inventory.items.length : 0;
  const lastMediaInventorySyncAt = inventory.lastMediaInventorySyncAt || safeIsoOrNull(connection.lastMediaInventorySyncAt);
  const rejectCount = safeNonNegativeNumber(inventory.mediaInventorySyncRejectCount || connection.mediaInventorySyncRejectCount);
  const lastRejectReason = safeReason(inventory.lastMediaInventorySyncRejectReason || connection.lastMediaInventorySyncRejectReason);
  const fullSync = sanitizeMediaFullSync(inventory.mediaFullSync || connection.mediaFullSync);
  const active = inventory.active === true;
  let reason = 'agent_snapshot_available';

  if (!connected) reason = 'agent_not_connected';
  else if (rejectCount > 0 && !lastMediaInventorySyncAt && lastRejectReason) reason = 'media_inventory_rejected';
  else if (!lastMediaInventorySyncAt) reason = 'media_inventory_not_received_since_restart';
  else if (!active || itemCount <= 0) reason = 'media_inventory_empty';

  const available = reason === 'agent_snapshot_available';

  return {
    prepared: true,
    build: BUILD,
    readOnly: true,
    available,
    reason,
    agentConnected: connected,
    connectionState: safeStatus(inventory.connectionState || connection.connectionState || ''),
    lastSeenAt: inventory.lastSeenAt || safeIsoOrNull(connection.lastSeenAt),
    lastHeartbeatAt: inventory.lastHeartbeatAt || safeIsoOrNull(connection.lastHeartbeatAt),
    heartbeatAgeMs: safeNullableNumber(inventory.heartbeatAgeMs || connection.heartbeatAgeMs),
    stale: inventory.stale === true || connection.stale === true,
    mediaInventoryActive: active,
    mediaInventoryItems: itemCount,
    mediaInventoryReturned: safeNonNegativeNumber(inventory.returned || itemCount),
    mediaInventoryTotalSeen: safeNonNegativeNumber(inventory.totalSeen || itemCount),
    mediaInventoryTruncated: inventory.truncated === true,
    lastMediaInventorySyncAt,
    mediaInventorySyncSeq: safeNullableNumber(inventory.mediaInventorySyncSeq || connection.mediaInventorySyncSeq),
    mediaInventoryRejectCount: rejectCount,
    lastMediaInventoryRejectAt: inventory.lastMediaInventorySyncRejectAt || safeIsoOrNull(connection.lastMediaInventorySyncRejectAt),
    lastMediaInventoryRejectReason: lastRejectReason,
    mediaFullSync: fullSync,
    noAgentActionTriggered: true,
    noOnlineToAgentAction: true,
    noDatabaseWrite: true,
    note: diagnosticNote(reason)
  };
}

function diagnosticNote(reason) {
  if (reason === 'agent_not_connected') return 'Agent ist nicht verbunden; der In-Memory-Snapshot kann nach Restart/Deploy leer sein.';
  if (reason === 'media_inventory_rejected') return 'Media-Inventory wurde nicht akzeptiert oder zuletzt abgelehnt; Reject-Grund pruefen.';
  if (reason === 'media_inventory_not_received_since_restart') return 'Seit dem letzten Webserver-Start wurde noch kein Media-Inventory-Snapshot empfangen.';
  if (reason === 'media_inventory_empty') return 'Agent-Verbindung ist vorhanden, aber der Media-Inventory-Snapshot enthaelt keine Items.';
  return 'Agent-Snapshot ist fuer Diff-Auswertung vorhanden.';
}

async function readPersistentIndexItems(config) {
  return await withReadOnlyConnection(config, async (connection) => {
    const [rows] = await connection.query(
      `SELECT id, root_key, kind, relative_path, name, extension, size_bytes, modified_at, last_seen_at, source, sync_version
       FROM ${PERSISTENT_INDEX_TABLE}
       WHERE deleted = 0
       ORDER BY root_key ASC, relative_path ASC
       LIMIT ?`,
      [MAX_DB_ROWS]
    );
    const [countRows] = await connection.query(`SELECT COUNT(*) AS total_count FROM ${PERSISTENT_INDEX_TABLE} WHERE deleted = 0`);
    const items = (Array.isArray(rows) ? rows : []).map(sanitizePersistentIndexItem).filter(Boolean);
    const total = safeNonNegativeNumber(countRows && countRows[0] && countRows[0].total_count ? countRows[0].total_count : items.length);
    return { items, total, truncated: total > items.length };
  });
}

function buildDiff({ agentItems, dbItems, previewLimit, agentTruncated, agentSnapshotUnavailable, dbTruncated }) {
  const agentById = indexById(agentItems);
  const dbById = indexById(dbItems);
  const newOnAgent = [];
  const changedOnAgent = [];
  const softChangedOnAgent = [];
  const effectiveChangedOnAgent = [];
  const unchanged = [];
  const compareStats = { metadataCompareWarnings: 0, changeReasonCounts: {}, modifiedAtDeltasMs: [], hardChangedOnAgentCount: 0, softModifiedAtOnlyCount: 0 };

  for (const agentItem of agentById.values()) {
    const dbItem = dbById.get(agentItem.id);
    if (!dbItem) {
      newOnAgent.push(agentItem);
      continue;
    }
    const change = compareMediaItems(agentItem, dbItem);
    addCompareStats(compareStats, change);
    if (change.changed) {
      const changedItem = { ...agentItem, changeReasons: change.reasons, metadataWarnings: change.warnings, compareDetails: change.details, changeClass: change.changeClass, modifiedAtOffsetBucket: change.modifiedAtOffsetBucket };
      changedOnAgent.push(changedItem);
      if (change.changeClass === 'soft_modified_at_offset_only') softChangedOnAgent.push(changedItem);
      else effectiveChangedOnAgent.push(changedItem);
    } else {
      unchanged.push(change.warnings.length ? { ...agentItem, metadataWarnings: change.warnings } : agentItem);
    }
  }

  const missingOnAgentReliable = !agentSnapshotUnavailable && !agentTruncated && !dbTruncated;
  const missingOnAgent = [];
  if (missingOnAgentReliable) {
    for (const dbItem of dbById.values()) {
      if (!agentById.has(dbItem.id)) missingOnAgent.push(dbItem);
    }
  }

  const matchedCount = unchanged.length + changedOnAgent.length;
  return {
    counts: {
      agentTotal: agentItems.length,
      remoteDbTotal: dbItems.length,
      matchedCount,
      newOnAgentCount: newOnAgent.length,
      changedOnAgentCount: changedOnAgent.length,
      strictChangedOnAgentCount: changedOnAgent.length,
      hardChangedOnAgentCount: compareStats.hardChangedOnAgentCount,
      effectiveChangedOnAgentCount: compareStats.hardChangedOnAgentCount,
      softChangedOnAgentCount: compareStats.softModifiedAtOnlyCount,
      softModifiedAtOnlyCount: compareStats.softModifiedAtOnlyCount,
      effectiveNoopChangedOnAgentCount: compareStats.softModifiedAtOnlyCount,
      missingOnAgentCount: missingOnAgentReliable ? missingOnAgent.length : null,
      missingOnAgentReliable,
      agentSnapshotUnavailable: agentSnapshotUnavailable === true,
      unchangedCount: unchanged.length,
      strictUnchangedCount: unchanged.length,
      effectiveUnchangedCount: unchanged.length + compareStats.softModifiedAtOnlyCount,
      comparableAgentItems: agentItems.length,
      metadataCompareWarnings: compareStats.metadataCompareWarnings,
      changeReasonCounts: compareStats.changeReasonCounts,
      modifiedAtDeltaStats: buildModifiedAtDeltaStats(compareStats.modifiedAtDeltasMs),
      readOnly: true,
      writesEnabled: false
    },
    previews: {
      newOnAgent: newOnAgent.slice(0, previewLimit).map(safePreviewItem),
      changedOnAgent: changedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      strictChangedOnAgent: changedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      softChangedOnAgent: softChangedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      effectiveChangedOnAgent: effectiveChangedOnAgent.slice(0, previewLimit).map(safePreviewItem),
      missingOnAgent: missingOnAgentReliable ? missingOnAgent.slice(0, previewLimit).map(safePreviewItem) : [],
      unchanged: unchanged.slice(0, previewLimit).map(safePreviewItem)
    }
  };
}

function buildReliabilityBlock({ agentInventory, agentSnapshotDiagnostic, dbInventory, diff }) {
  const dbTruncated = dbInventory && dbInventory.truncated === true;
  const agentSnapshotUnavailable = agentSnapshotDiagnostic && agentSnapshotDiagnostic.available !== true;
  const metadataCompareWarnings = diff && diff.counts ? safeNonNegativeNumber(diff.counts.metadataCompareWarnings) : 0;
  const missingOnAgentReliable = !agentSnapshotUnavailable && !(agentInventory && agentInventory.truncated === true) && !dbTruncated;
  let note = 'Agent- und DB-Snapshot sind nicht als gekuerzt gemeldet.';
  if (agentSnapshotUnavailable) {
    note = agentSnapshotDiagnostic && agentSnapshotDiagnostic.note
      ? agentSnapshotDiagnostic.note
      : 'Agent-Snapshot ist leer oder nicht verfuegbar. Fehlende DB-Eintraege werden deshalb nicht als belastbarer Loesch-/Tombstone-Status bewertet.';
  } else if (agentInventory && agentInventory.truncated === true) {
    note = 'Agent-Snapshot ist gekuerzt. Fehlende DB-Eintraege werden deshalb nicht als belastbarer Loeschstatus bewertet.';
  } else if (dbTruncated) {
    note = 'DB-Snapshot ist gekuerzt. Fehlende Agent-Eintraege werden deshalb nicht vollstaendig bewertet.';
  }
  return {
    agentSnapshotUnavailable,
    agentSnapshotReason: agentSnapshotDiagnostic ? agentSnapshotDiagnostic.reason : 'unknown',
    agentSnapshotTruncated: agentInventory && agentInventory.truncated === true,
    databaseSnapshotTruncated: dbTruncated,
    newAndChangedReliableForReturnedAgentItems: !agentSnapshotUnavailable,
    missingOnAgentReliable,
    metadataCompareWarnings,
    note
  };
}

function compareMediaItems(agentItem, dbItem) {
  const reasons = [];
  const warnings = [];
  const details = {};

  const agentSize = safeComparableNumber(agentItem.sizeBytes);
  const dbSize = safeComparableNumber(dbItem.sizeBytes);
  const sizeComparableAndEqual = agentSize !== null && dbSize !== null && agentSize === dbSize;
  if (agentSize !== null && dbSize !== null && agentSize !== dbSize) reasons.push('size_changed');
  else if ((agentSize === null) !== (dbSize === null)) warnings.push('size_uncomparable');

  const agentModifiedIso = safeIsoOrNull(agentItem.modifiedAt);
  const dbModifiedIso = safeIsoOrNull(dbItem.modifiedAt);
  const agentModified = dateMs(agentModifiedIso);
  const dbModified = dateMs(dbModifiedIso);
  let modifiedAtOffsetBucket = null;
  if (agentModified !== null && dbModified !== null) {
    const modifiedAtDeltaMs = agentModified - dbModified;
    modifiedAtOffsetBucket = modifiedAtSoftOffsetBucket(modifiedAtDeltaMs);
    if (Math.abs(modifiedAtDeltaMs) > MODIFIED_AT_TOLERANCE_MS) {
      reasons.push('modified_at_changed');
      details.modifiedAt = {
        agentModifiedAt: agentModifiedIso,
        dbModifiedAt: dbModifiedIso,
        modifiedAtDeltaMs,
        modifiedAtDeltaAbsMs: Math.abs(modifiedAtDeltaMs),
        toleranceMs: MODIFIED_AT_TOLERANCE_MS,
        softOffsetBucket: modifiedAtOffsetBucket,
        softOffsetToleranceMs: MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS
      };
    }
  } else if ((agentModified === null) !== (dbModified === null)) {
    warnings.push('modified_at_uncomparable');
    details.modifiedAt = {
      agentModifiedAt: agentModifiedIso,
      dbModifiedAt: dbModifiedIso,
      modifiedAtDeltaMs: null,
      modifiedAtDeltaAbsMs: null,
      toleranceMs: MODIFIED_AT_TOLERANCE_MS,
      softOffsetBucket: null,
      softOffsetToleranceMs: MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS
    };
  }

  const agentKind = safeKind(agentItem.kind);
  const dbKind = safeKind(dbItem.kind);
  const kindComparableAndEqual = Boolean(agentKind && dbKind && agentKind === dbKind);
  if (agentKind && dbKind && agentKind !== dbKind) reasons.push('kind_changed');

  const changed = reasons.length > 0;
  const softModifiedAtOnly = changed
    && reasons.length === 1
    && reasons[0] === 'modified_at_changed'
    && sizeComparableAndEqual
    && kindComparableAndEqual
    && Boolean(modifiedAtOffsetBucket);

  return {
    changed,
    reasons,
    warnings,
    details,
    changeClass: softModifiedAtOnly ? 'soft_modified_at_offset_only' : (changed ? 'hard_changed' : 'unchanged'),
    modifiedAtOffsetBucket: modifiedAtOffsetBucket || 'other'
  };
}

function addCompareStats(stats, change) {
  if (!stats || !change) return;
  if (change.changed === true) {
    if (change.changeClass === 'soft_modified_at_offset_only') {
      stats.softModifiedAtOnlyCount += 1;
      stats.changeReasonCounts.soft_modified_at_offset_only = safeNonNegativeNumber(stats.changeReasonCounts.soft_modified_at_offset_only) + 1;
    } else {
      stats.hardChangedOnAgentCount += 1;
    }
  }
  for (const reason of Array.isArray(change.reasons) ? change.reasons : []) {
    stats.changeReasonCounts[reason] = safeNonNegativeNumber(stats.changeReasonCounts[reason]) + 1;
  }
  if (change.details && change.details.modifiedAt && Number.isFinite(change.details.modifiedAt.modifiedAtDeltaMs)) {
    stats.modifiedAtDeltasMs.push(change.details.modifiedAt.modifiedAtDeltaMs);
  }
  for (const warning of Array.isArray(change.warnings) ? change.warnings : []) {
    stats.metadataCompareWarnings += 1;
    stats.changeReasonCounts[warning] = safeNonNegativeNumber(stats.changeReasonCounts[warning]) + 1;
  }
}

function indexById(items) {
  const map = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    if (item && item.id && !map.has(item.id)) map.set(item.id, item);
  }
  return map;
}

function sanitizePersistentIndexItem(row) {
  const source = row && typeof row === 'object' && !Array.isArray(row) ? row : {};
  return sanitizeMediaItem({
    id: source.id,
    rootKey: source.root_key,
    kind: source.kind,
    relativePath: source.relative_path,
    name: source.name,
    extension: source.extension,
    sizeBytes: source.size_bytes,
    modifiedAt: source.modified_at,
    lastSeenAt: source.last_seen_at,
    source: source.source,
    syncVersion: source.sync_version
  });
}

function sanitizeMediaItem(item) {
  const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {};
  const rootKey = safeRootKey(source.rootKey);
  const relativePath = safeRelativePath(source.relativePath);
  if (!rootKey || !relativePath) return null;
  const extension = safeExtension(source.extension || path.extname(relativePath));
  if (!extension) return null;
  const id = safeMediaId(source.id || `${rootKey}:${relativePath}`);
  if (!id) return null;
  return {
    id,
    rootKey,
    relativePath,
    kind: safeKind(source.kind),
    sizeBytes: safeNonNegativeNumber(source.sizeBytes),
    modifiedAt: safeIsoOrNull(source.modifiedAt),
    lastSeenAt: safeIsoOrNull(source.lastSeenAt),
    extension
  };
}

function sanitizeMediaFullSync(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return {
    state: safeStatus(source.state || 'unknown'),
    syncId: source.syncId ? String(source.syncId).replace(/[^\w:.-]/g, '_').slice(0, 120) : null,
    receivedChunks: safeNonNegativeNumber(source.receivedChunks),
    totalChunks: safeNonNegativeNumber(source.totalChunks),
    receivedItems: safeNonNegativeNumber(source.receivedItems),
    totalItems: safeNonNegativeNumber(source.totalItems),
    startedAt: safeIsoOrNull(source.startedAt),
    lastChunkAt: safeIsoOrNull(source.lastChunkAt),
    completedAt: safeIsoOrNull(source.completedAt),
    lastError: safeReason(source.lastError),
    lastRejectAt: safeIsoOrNull(source.lastRejectAt),
    lastRejectReason: safeReason(source.lastRejectReason),
    writeEnabled: source.writeEnabled === true,
    writesBlocked: source.writesBlocked !== false,
    uploadEditDeleteEnabled: false
  };
}

function safePreviewItem(item) {
  const safe = sanitizeMediaItem(item) || {};
  const preview = {
    id: safe.id || '',
    rootKey: safe.rootKey || '',
    relativePath: safe.relativePath || '',
    kind: safe.kind || '',
    sizeBytes: safeNonNegativeNumber(safe.sizeBytes),
    modifiedAt: safe.modifiedAt || null
  };
  if (Array.isArray(item.changeReasons)) preview.changeReasons = item.changeReasons.filter(Boolean).slice(0, 5);
  if (item.changeClass) preview.changeClass = safeStatus(item.changeClass);
  if (item.modifiedAtOffsetBucket) preview.modifiedAtOffsetBucket = safeStatus(item.modifiedAtOffsetBucket);
  if (Array.isArray(item.metadataWarnings)) preview.metadataWarnings = item.metadataWarnings.filter(Boolean).slice(0, 5);
  if (item.compareDetails && item.compareDetails.modifiedAt) {
    preview.agentModifiedAt = item.compareDetails.modifiedAt.agentModifiedAt || null;
    preview.dbModifiedAt = item.compareDetails.modifiedAt.dbModifiedAt || null;
    preview.modifiedAtDeltaMs = Number.isFinite(item.compareDetails.modifiedAt.modifiedAtDeltaMs) ? item.compareDetails.modifiedAt.modifiedAtDeltaMs : null;
    preview.modifiedAtDeltaAbsMs = Number.isFinite(item.compareDetails.modifiedAt.modifiedAtDeltaAbsMs) ? item.compareDetails.modifiedAt.modifiedAtDeltaAbsMs : null;
    preview.modifiedAtToleranceMs = item.compareDetails.modifiedAt.toleranceMs || MODIFIED_AT_TOLERANCE_MS;
  }
  return preview;
}

function buildAgentSummary(agentInventory, agentSnapshotUnavailable = false) {
  return {
    active: agentInventory.active,
    connected: agentInventory.connected,
    connectionState: agentInventory.connectionState,
    source: agentInventory.source,
    returned: agentInventory.returned,
    totalSeen: agentInventory.totalSeen,
    truncated: agentInventory.truncated,
    hasMore: agentInventory.hasMore,
    lastSeenAt: agentInventory.lastSeenAt,
    lastHeartbeatAt: agentInventory.lastHeartbeatAt,
    lastMediaInventorySyncAt: agentInventory.lastMediaInventorySyncAt,
    mediaInventorySyncSeq: agentInventory.mediaInventorySyncSeq,
    mediaInventorySyncRejectCount: agentInventory.mediaInventorySyncRejectCount,
    lastMediaInventorySyncRejectReason: agentInventory.lastMediaInventorySyncRejectReason,
    snapshotUnavailable: agentSnapshotUnavailable === true
  };
}

function modifiedAtSoftOffsetBucket(deltaMs) {
  if (!Number.isFinite(deltaMs)) return null;
  const absDelta = Math.abs(deltaMs);
  for (const bucket of MODIFIED_AT_SOFT_OFFSET_BUCKETS) {
    if (Math.abs(absDelta - bucket.ms) <= MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS) return bucket.key;
  }
  return null;
}


function buildModifiedAtDeltaStats(deltas) {
  const values = (Array.isArray(deltas) ? deltas : []).filter(Number.isFinite);
  if (values.length <= 0) {
    return {
      count: 0,
      minMs: null,
      maxMs: null,
      avgMs: null,
      minAbsMs: null,
      maxAbsMs: null,
      avgAbsMs: null,
      allPositive: false,
      allNegative: false,
      mixedSigns: false,
      toleranceMs: MODIFIED_AT_TOLERANCE_MS
    };
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  const absValues = values.map(value => Math.abs(value));
  const absSum = absValues.reduce((acc, value) => acc + value, 0);
  const allPositive = values.every(value => value > 0);
  const allNegative = values.every(value => value < 0);
  return {
    count: values.length,
    minMs: Math.min(...values),
    maxMs: Math.max(...values),
    avgMs: Math.round(sum / values.length),
    minAbsMs: Math.min(...absValues),
    maxAbsMs: Math.max(...absValues),
    avgAbsMs: Math.round(absSum / values.length),
    allPositive,
    allNegative,
    mixedSigns: !allPositive && !allNegative,
    toleranceMs: MODIFIED_AT_TOLERANCE_MS
  };
}


function buildEmptyCounts() {
  return {
    agentTotal: 0,
    remoteDbTotal: 0,
    matchedCount: 0,
    newOnAgentCount: 0,
    changedOnAgentCount: 0,
    strictChangedOnAgentCount: 0,
    hardChangedOnAgentCount: 0,
    effectiveChangedOnAgentCount: 0,
    softChangedOnAgentCount: 0,
    softModifiedAtOnlyCount: 0,
    effectiveNoopChangedOnAgentCount: 0,
    missingOnAgentCount: null,
    missingOnAgentReliable: false,
    agentSnapshotUnavailable: true,
    unchangedCount: 0,
    strictUnchangedCount: 0,
    effectiveUnchangedCount: 0,
    comparableAgentItems: 0,
    metadataCompareWarnings: 0,
    changeReasonCounts: {},
    modifiedAtDeltaStats: buildModifiedAtDeltaStats([]),
    readOnly: true,
    writesEnabled: false
  };
}

function buildEmptyPreviews() {
  return { newOnAgent: [], changedOnAgent: [], strictChangedOnAgent: [], softChangedOnAgent: [], effectiveChangedOnAgent: [], missingOnAgent: [], unchanged: [] };
}

function buildComparePolicy() {
  return {
    build: BUILD,
    previousBuild: PREVIOUS_BUILD,
    readOnly: true,
    compares: ['sizeBytes', 'kind', 'modifiedAt'],
    modifiedAtToleranceMs: MODIFIED_AT_TOLERANCE_MS,
    uncomparableMetadataDoesNotMarkChanged: true,
    emptyAgentSnapshotDoesNotMarkMissingReliable: true,
    agentSnapshotDiagnosticEnabled: true,
    modifiedAtDeltaDiagnosticEnabled: true,
    modifiedAtSoftMatchPolicyEnabled: true,
    effectiveChangeCountsEnabled: true,
    changedOnAgentCountCompatibilityMode: 'strict_includes_soft_matches',
    modifiedAtSoftOffsetBuckets: MODIFIED_AT_SOFT_OFFSET_BUCKETS.map(bucket => ({ key: bucket.key, ms: bucket.ms })),
    modifiedAtSoftOffsetToleranceMs: MODIFIED_AT_SOFT_OFFSET_TOLERANCE_MS,
    diagnosticDoesNotTriggerAgentAction: true,
    warningFields: ['metadataCompareWarnings', 'metadataWarnings'],
    noFileContentHashing: true
  };
}

function buildSafetyBlock() {
  return {
    readOnly: true,
    writesEnabled: false,
    databaseWritesEnabled: false,
    uploadEditDeleteEnabled: false,
    noFileContent: true,
    noAbsolutePaths: true,
    noOnlineToAgentActions: true,
    noTombstoneWrites: true,
    noPhysicalDelete: true,
    secretsExposed: false
  };
}

function readPreviewLimit(req) {
  const raw = req && req.query ? Number.parseInt(String(req.query.previewLimit || req.query.limit || ''), 10) : 0;
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_PREVIEW_LIMIT;
  return Math.max(1, Math.min(raw, MAX_PREVIEW_LIMIT));
}

function safeRootKey(value) {
  const key = safeStatus(value);
  return MEDIA_ROOT_KEYS.has(key) ? key : '';
}

function safeRelativePath(value) {
  const rel = String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/[\u0000-\u001f<>:"|?*]/g, '').slice(0, 220);
  if (!rel || rel.includes('..') || /^[a-zA-Z]:/.test(rel) || rel.startsWith('~')) return '';
  return rel;
}

function safeExtension(value) {
  const ext = String(value || '').toLowerCase().trim();
  return MEDIA_ALLOWED_EXTENSIONS.includes(ext) ? ext : '';
}

function safeKind(value) {
  const kind = safeStatus(value);
  if (['audio', 'video', 'image', 'media'].includes(kind)) return kind;
  return 'media';
}

function safeMediaId(value) {
  const id = String(value || '').replace(/[^\w:./-]/g, '_').slice(0, 260);
  if (!id || id.includes('..') || /^[a-zA-Z]:/.test(id)) return '';
  return id;
}

function safeStatus(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9_.:-]/g, '_').slice(0, 80);
}

function safeReason(value) {
  const reason = safeStatus(value);
  return reason || null;
}

function safeNonNegativeNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.floor(num);
}

function safeNullableNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.floor(num);
}

function safeComparableNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.floor(num);
}

function safeIsoOrNull(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  const parsed = Date.parse(String(value));
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed).toISOString();
}

function dateMs(value) {
  const iso = safeIsoOrNull(value);
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
}

module.exports = { registerMediaIndexDiffRoutes, buildMediaIndexDiffStatus };
