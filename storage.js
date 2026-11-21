// Shared, versioned storage adapter for the standalone app.
(() => {
  const CURRENT_KEY = 'personal_command_center_data_v2';
  const LEGACY_KEYS = ['upsc_app_data_v19'];
  window.AppStore = {
    read(fallback = {}) {
      try {
        const current = localStorage.getItem(CURRENT_KEY);
        if (current) return JSON.parse(current);
        for (const key of LEGACY_KEYS) {
          const legacy = localStorage.getItem(key);
          if (legacy) {
            const data = JSON.parse(legacy);
            localStorage.setItem(CURRENT_KEY, JSON.stringify(data));
            return data;
          }
        }
      } catch (error) { console.error('Local data could not be read:', error); }
      return fallback;
    },
    write(data) {
      try {
        localStorage.setItem(CURRENT_KEY, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Local data could not be saved:', error);
        return false;
      }
    },
    readCollection(key, fallback = []) {
      try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
      catch (error) { console.error(`Could not read ${key}:`, error); return fallback; }
    },
    writeCollection(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (error) { console.error(`Could not save ${key}:`, error); return false; }
    },
    createBackup(data, notes) {
      return { format: 'personal-command-center', version: 2, exportedAt: new Date().toISOString(), appData: data, notespaceDB: notes };
    }
  };
})();
