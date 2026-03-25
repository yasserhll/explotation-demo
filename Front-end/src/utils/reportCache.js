/**
 * reportCache.js
 * Cache localStorage pour les rapports (journalier, hebdomadaire, mensuel).
 * TTL par défaut : 24h.
 * Invalidation : appelée depuis api.js après toute mutation (create/update/delete).
 */

const CACHE_VERSION = 'v1';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

function cacheKey(type, params) {
  return `rapport_cache_${CACHE_VERSION}_${type}_${JSON.stringify(params)}`;
}

export function cacheGet(type, params) {
  try {
    const raw = localStorage.getItem(cacheKey(type, params));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) {
      localStorage.removeItem(cacheKey(type, params));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function cacheSet(type, params, data) {
  try {
    localStorage.setItem(cacheKey(type, params), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Invalide TOUT le cache rapport (appelé après create/update/delete).
 */
export function cacheInvalidateAll() {
  try {
    const prefix = `rapport_cache_${CACHE_VERSION}_`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    // Ignore
  }
}

// ─── Gasoil par date ────────────────────────────────────────────────────────

const GASOIL_KEY = 'gasoil_journalier';

export function gasoilGet(date) {
  try {
    const raw = localStorage.getItem(GASOIL_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[date] || { camions: '', engins: '' };
  } catch {
    return { camions: '', engins: '' };
  }
}

export function gasoilSet(date, values) {
  try {
    const raw = localStorage.getItem(GASOIL_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[date] = values;
    localStorage.setItem(GASOIL_KEY, JSON.stringify(store));
  } catch {
    // Ignore
  }
}
