export const idb = {
    dbPromise: null,
    
    init() {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open('HisaabProDB', 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('store')) {
                        db.createObjectStore('store');
                    }
                };
            });
        }
        return this.dbPromise;
    },

    async get(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('store', 'readonly');
            const store = tx.objectStore('store');
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async set(key, value) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('store', 'readwrite');
            const store = tx.objectStore('store');
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async remove(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('store', 'readwrite');
            const store = tx.objectStore('store');
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
