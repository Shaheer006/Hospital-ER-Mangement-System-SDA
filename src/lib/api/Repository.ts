export const DatabaseRepository = {
  async fetchInitialData() {
    try {
      const response = await fetch('http://localhost:3001/api/sync');
      const data = await response.json();

      const parseData = (items: any[]) => {
        if (!items || !Array.isArray(items)) return null;
        return items.map(item => {
          const copy = { ...item };
          for (const key in copy) {
            // THE FIX: Safely try to parse ANY string that looks like an array
            if (typeof copy[key] === 'string' && (copy[key].trim().startsWith('[') || copy[key].trim().startsWith('{'))) {
              try {
                const parsed = JSON.parse(copy[key]);
                if (typeof parsed === 'object') copy[key] = parsed;
              } catch (e) { /* Ignore if it fails, keep as string */ }
            }
          }
          return copy;
        });
      };

      return {
        beds: parseData(data.beds),
        patients: parseData(data.patients),
        inventory: parseData(data.inventory),
        archive: parseData(data.archive)
      };
    } catch (e) {
      console.error("Database not running, using empty state.", e);
      return { beds: null, patients: null, inventory: null, archive: null };
    }
  },

  async syncTable(tableName: string, currentReactState: any[]) {
    try {
      if (!currentReactState || currentReactState.length === 0) return;

      const safeData = currentReactState.map(item => {
        const copy: any = {};
        for (const key in item) {
          if (typeof item[key] === 'object' && item[key] !== null) {
            copy[key] = JSON.stringify(item[key]);
          } else {
            copy[key] = item[key];
          }
        }
        return copy;
      });

      await fetch('http://localhost:3001/api/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, data: safeData })
      });
    } catch (e) {
      console.error(`Failed to sync ${tableName} to database`, e);
    }
  }
};