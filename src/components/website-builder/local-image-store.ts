"use client";

import { localImageUrl, newLocalImageRef, registerLocalImageUrl } from "@/lib/website-builder/local-images";

/**
 * Keeps photos of hosts without an account in this browser (IndexedDB), so nothing is
 * uploaded to Hostvia storage before they register. Each photo gets a `local:` reference
 * in the document and an object URL for previews while the tab is open.
 */

const DB_NAME = "hostvia-website-photos";
const STORE = "photos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser cannot keep photos offline"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open photo storage"));
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE, mode);
      const request = action(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error ?? new Error("Photo storage failed"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Photo storage is full"));
    });
  } finally {
    db.close();
  }
}

/** Saves a photo in this browser and returns its document reference. */
export async function saveLocalImage(file: Blob): Promise<string> {
  const ref = newLocalImageRef();
  await run("readwrite", (store) => store.put(file, ref));
  registerLocalImageUrl(ref, URL.createObjectURL(file));
  return ref;
}

export async function readLocalImage(ref: string): Promise<Blob | null> {
  const value = await run<unknown>("readonly", (store) => store.get(ref));
  return value instanceof Blob ? value : null;
}

export async function deleteLocalImages(refs: string[]): Promise<void> {
  if (!refs.length) return;
  await run("readwrite", (store) => {
    let last: IDBRequest<undefined> | null = null;
    for (const ref of refs) last = store.delete(ref);
    return last as IDBRequest<undefined>;
  }).catch(() => undefined);
}

/** Makes object URLs for references saved in an earlier visit. Returns how many are ready. */
export async function loadLocalImages(refs: string[]): Promise<number> {
  let ready = 0;
  for (const ref of refs) {
    if (localImageUrl(ref)) {
      ready += 1;
      continue;
    }
    const blob = await readLocalImage(ref).catch(() => null);
    if (!blob) continue;
    registerLocalImageUrl(ref, URL.createObjectURL(blob));
    ready += 1;
  }
  return ready;
}
