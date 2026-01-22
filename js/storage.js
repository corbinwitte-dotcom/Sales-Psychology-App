/**
 * Storage Manager
 * Handles all localStorage operations for the meditation app
 */

const StorageManager = {
    // Storage keys
    KEYS: {
        FAVORITES: 'peakPerformance_favorites',
        PLAYBACK_POSITIONS: 'peakPerformance_playbackPositions',
        RECENT_PLAYED: 'peakPerformance_recentPlayed',
        SETTINGS: 'peakPerformance_settings'
    },

    /**
     * Get data from localStorage
     */
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    /**
     * Set data in localStorage
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    /**
     * Get all favorites
     */
    getFavorites() {
        return this.get(this.KEYS.FAVORITES) || [];
    },

    /**
     * Add meditation to favorites
     */
    addFavorite(filename) {
        const favorites = this.getFavorites();
        if (!favorites.includes(filename)) {
            favorites.push(filename);
            this.set(this.KEYS.FAVORITES, favorites);
        }
        return favorites;
    },

    /**
     * Remove meditation from favorites
     */
    removeFavorite(filename) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(fav => fav !== filename);
        this.set(this.KEYS.FAVORITES, favorites);
        return favorites;
    },

    /**
     * Toggle favorite status
     */
    toggleFavorite(filename) {
        const favorites = this.getFavorites();
        const isFavorited = favorites.includes(filename);

        if (isFavorited) {
            return this.removeFavorite(filename);
        } else {
            return this.addFavorite(filename);
        }
    },

    /**
     * Check if meditation is favorited
     */
    isFavorited(filename) {
        const favorites = this.getFavorites();
        return favorites.includes(filename);
    },

    /**
     * Get playback position for a meditation
     */
    getPlaybackPosition(filename) {
        const positions = this.get(this.KEYS.PLAYBACK_POSITIONS) || {};
        return positions[filename] || 0;
    },

    /**
     * Save playback position for a meditation
     */
    savePlaybackPosition(filename, position, duration) {
        const positions = this.get(this.KEYS.PLAYBACK_POSITIONS) || {};

        // Don't save if near the end (last 5 seconds) or very beginning (first 3 seconds)
        if (position < 3 || (duration - position) < 5) {
            delete positions[filename];
        } else {
            positions[filename] = {
                position: position,
                duration: duration,
                timestamp: Date.now()
            };
        }

        this.set(this.KEYS.PLAYBACK_POSITIONS, positions);
    },

    /**
     * Clear playback position for a meditation
     */
    clearPlaybackPosition(filename) {
        const positions = this.get(this.KEYS.PLAYBACK_POSITIONS) || {};
        delete positions[filename];
        this.set(this.KEYS.PLAYBACK_POSITIONS, positions);
    },

    /**
     * Get recently played meditations
     */
    getRecentlyPlayed() {
        return this.get(this.KEYS.RECENT_PLAYED) || [];
    },

    /**
     * Add meditation to recently played
     */
    addToRecentlyPlayed(filename, title, category) {
        let recent = this.getRecentlyPlayed();

        // Remove if already exists
        recent = recent.filter(item => item.filename !== filename);

        // Add to beginning
        recent.unshift({
            filename: filename,
            title: title,
            category: category,
            timestamp: Date.now()
        });

        // Keep only last 10
        recent = recent.slice(0, 10);

        this.set(this.KEYS.RECENT_PLAYED, recent);
        return recent;
    },

    /**
     * Clear recently played
     */
    clearRecentlyPlayed() {
        this.set(this.KEYS.RECENT_PLAYED, []);
    },

    /**
     * Get app settings
     */
    getSettings() {
        return this.get(this.KEYS.SETTINGS) || {
            volume: 1.0,
            autoplay: false
        };
    },

    /**
     * Save app settings
     */
    saveSettings(settings) {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...settings };
        this.set(this.KEYS.SETTINGS, newSettings);
        return newSettings;
    },

    /**
     * Clear all data (for debugging)
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

// Make it globally available
window.StorageManager = StorageManager;
