// The free Qaida — where a recording of your own voice is kept. QAIDA-BUILD.md step 7, docs/your-voice/02 §4.
//
// IndexedDB, never localStorage: localStorage holds strings, caps out near 5MB, and it's where qaida:progress lives —
// one oversized clip would throw on the next save and the student would silently lose every lesson they've finished.
// No DOM here at all, so the check script can drive it with no browser — the same split as shapes.js / marks.js.
//
// Every call is wrapped so it resolves rather than throws: a private window, blocked site data or storage eviction
// can all make IndexedDB refuse, and the recorder still has to work for this visit even when nothing can be kept.

(() => {
  const NAME = 'qaida-voice';
  const VERSION = 1;
  const STORE = 'clips';
  const MAX_CLIPS = 200;
  const MAX_BYTES = 25 * 1024 * 1024;

  let dbPromise = null;

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      let request;
      try {
        request = indexedDB.open(NAME, VERSION);
      } catch {
        resolve(null);
        return;
      }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('at', 'at');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    });
    return dbPromise;
  }

  // Runs `run(store)` inside a transaction and resolves to `fallback` for anything that goes wrong along the way —
  // no database, a transaction that can't open, one that aborts. Nothing here ever rejects.
  async function withStore(mode, run, fallback) {
    const db = await openDb();
    if (!db) return fallback;
    try {
      return await new Promise((resolve) => {
        let tx;
        try {
          tx = db.transaction(STORE, mode);
        } catch {
          resolve(fallback);
          return;
        }
        let settled = false;
        const finish = (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        tx.onerror = () => finish(fallback);
        tx.onabort = () => finish(fallback);
        Promise.resolve(run(tx.objectStore(STORE))).then(finish, () => finish(fallback));
      });
    } catch {
      return fallback;
    }
  }

  const ready = (async () => Boolean(await openDb()))();

  // Guards against whatever a damaged profile, an older version of this file or a hand-edited database might hold:
  // a record missing its blob, or with a string where a number goes, is treated as if it were never there.
  function isRecord(value) {
    return Boolean(
      value
      && typeof value === 'object'
      && typeof value.id === 'string'
      && value.blob instanceof Blob
      && typeof value.mime === 'string'
      && typeof value.ms === 'number'
      && typeof value.at === 'number',
    );
  }

  function get(id) {
    if (typeof id !== 'string' || !id) return Promise.resolve(null);
    return withStore('readonly', (store) => new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(isRecord(request.result) ? request.result : null);
      request.onerror = () => resolve(null);
    }), null);
  }

  // A single indexed lookup, for the dot on the Say it button — it doesn't need the clip itself, only whether one exists.
  function has(id) {
    if (typeof id !== 'string' || !id) return Promise.resolve(false);
    return withStore('readonly', (store) => new Promise((resolve) => {
      const request = store.getKey(id);
      request.onsuccess = () => resolve(request.result !== undefined);
      request.onerror = () => resolve(false);
    }), false);
  }

  function ids() {
    return withStore('readonly', (store) => new Promise((resolve) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve((request.result || []).filter((key) => typeof key === 'string'));
      request.onerror = () => resolve([]);
    }), []);
  }

  function remove(id) {
    return withStore('readwrite', (store) => new Promise((resolve) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    }), undefined);
  }

  function clear() {
    return withStore('readwrite', (store) => new Promise((resolve) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    }), undefined);
  }

  // Every real clip, oldest first — used only to enforce the caps after a put.
  function all() {
    return withStore('readonly', (store) => new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result || []).filter(isRecord).sort((a, b) => a.at - b.at));
      request.onerror = () => resolve([]);
    }), []);
  }

  // Drops the oldest clips until both caps are met. Run after every put, never before: a single new clip that alone
  // would break the byte cap is the caller's problem (32kbps mono makes that all but impossible for one letter).
  async function evict() {
    const records = await all();
    let bytes = records.reduce((sum, r) => sum + r.blob.size, 0);
    let over = records.length - MAX_CLIPS;
    let i = 0;
    while ((over > 0 || bytes > MAX_BYTES) && i < records.length) {
      // eslint-disable-next-line no-await-in-loop -- each eviction has to see the last one's effect before the next
      await remove(records[i].id);
      bytes -= records[i].blob.size;
      over -= 1;
      i += 1;
    }
  }

  // Re-recording replaces rather than adds: `put` uses the object store's keyPath, so the same id overwrites.
  async function put(id, blob, mime, ms) {
    if (typeof id !== 'string' || !id || !(blob instanceof Blob)) return false;
    const record = { id, blob, mime: String(mime || ''), ms: Number(ms) || 0, at: Date.now() };
    const ok = await withStore('readwrite', (store) => new Promise((resolve) => {
      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    }), false);
    if (ok) await evict();
    return ok;
  }

  window.qaidaVoiceStore = { ready, get, put, remove, has, ids, clear };
})();
