// ==========================================
// STORAGE MODULE - localStorage operations
// Demonstrates: try-catch, JSON.stringify/parse, null checks
// ==========================================

// Save data to localStorage with error handling
export function saveToLocalStorage(key, data) {
  try {
    if (typeof key !== 'string' || !key) {
      throw new Error('Invalid storage key');
    }
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage: ${error.message}`);
    return false;
  }
}

// Load data from localStorage with error handling
export function loadFromLocalStorage(key) {
  try {
    if (typeof key !== 'string' || !key) {
      throw new Error('Invalid storage key');
    }
    const data = localStorage.getItem(key);
    if (data === null || data === undefined) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading from localStorage: ${error.message}`);
    return null;
  }
}

// Remove data from localStorage
export function removeFromLocalStorage(key) {
  try {
    if (typeof key !== 'string' || !key) {
      throw new Error('Invalid storage key');
    }
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${error.message}`);
    return false;
  }
}

// Export library data as formatted JSON string
export function exportLibraryData(library) {
  try {
    if (!library) throw new Error('No library data to export');
    return JSON.stringify(library, null, 2);
  } catch (error) {
    console.error(`Error exporting data: ${error.message}`);
    return null;
  }
}

// Import library data from JSON string
export function importLibraryData(jsonString) {
  try {
    if (typeof jsonString !== 'string') {
      throw new Error('Input must be a JSON string');
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    return null;
  }
}

// CommonJS export for Jest compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage,
    exportLibraryData, importLibraryData
  };
}