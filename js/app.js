/**
 * Main Application
 * Manages the overall app state and UI
 */

const App = {
    // Application state
    meditations: [],
    filteredMeditations: [],
    isLoading: false,

    // DOM elements
    elements: {
        emptyState: null,
        loadingIndicator: null,
        favoritesSection: null,
        favoritesList: null,
        recentSection: null,
        recentList: null,
        categorySections: null
    },

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Peak Performance App...');

        // Get DOM elements
        this.elements.emptyState = document.getElementById('emptyState');
        this.elements.loadingIndicator = document.getElementById('loadingIndicator');
        this.elements.favoritesSection = document.getElementById('favoritesSection');
        this.elements.favoritesList = document.getElementById('favoritesList');
        this.elements.recentSection = document.getElementById('recentSection');
        this.elements.recentList = document.getElementById('recentList');
        this.elements.categorySections = document.getElementById('categorySections');

        // Initialize audio player
        AudioPlayer.init();

        // Load meditations
        await this.loadMeditations();

        // Render UI
        this.render();

        // Register service worker for PWA
        this.registerServiceWorker();

        console.log('App initialized successfully');
    },

    /**
     * Load meditation files from the audio directory
     */
    async loadMeditations() {
        this.showLoading();

        try {
            // Fetch the list of audio files
            const response = await fetch('audio/');
            const html = await response.text();

            // Parse audio files from directory listing
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a');

            const audioFiles = [];
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && this.isAudioFile(href)) {
                    audioFiles.push(href);
                }
            });

            // If no files found via directory listing, try alternative method
            if (audioFiles.length === 0) {
                console.log('No audio files found via directory listing');
                // In production, you might want to maintain a manifest file
                // For now, we'll show the empty state
                this.meditations = [];
            } else {
                // Process audio files
                this.meditations = audioFiles.map(filename => {
                    const category = CategoryManager.categorize(filename);
                    const title = CategoryManager.formatTitle(filename);

                    return {
                        filename: filename,
                        title: title,
                        path: `audio/${filename}`,
                        category: category
                    };
                });

                console.log(`Loaded ${this.meditations.length} meditations`);
            }
        } catch (error) {
            console.error('Error loading meditations:', error);
            // If fetch fails (CORS issues, etc.), try to use a hardcoded list or manifest
            this.meditations = [];
        }

        this.hideLoading();
    },

    /**
     * Check if file is an audio file
     */
    isAudioFile(filename) {
        const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac'];
        const lowerFilename = filename.toLowerCase();
        return audioExtensions.some(ext => lowerFilename.endsWith(ext));
    },

    /**
     * Render the UI
     */
    render() {
        if (this.meditations.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        // Render favorites
        this.renderFavorites();

        // Render recently played
        this.renderRecentlyPlayed();

        // Render categories
        this.renderCategories();
    },

    /**
     * Render favorites section
     */
    renderFavorites() {
        const favorites = StorageManager.getFavorites();
        const favoriteMeditations = this.meditations.filter(m =>
            favorites.includes(m.filename)
        );

        if (favoriteMeditations.length === 0) {
            this.elements.favoritesSection.classList.add('hidden');
            return;
        }

        this.elements.favoritesSection.classList.remove('hidden');
        this.elements.favoritesList.innerHTML = '';

        favoriteMeditations.forEach(meditation => {
            const card = this.createMeditationCard(meditation);
            this.elements.favoritesList.appendChild(card);
        });
    },

    /**
     * Render recently played section
     */
    renderRecentlyPlayed() {
        const recentItems = StorageManager.getRecentlyPlayed();

        if (recentItems.length === 0) {
            this.elements.recentSection.classList.add('hidden');
            return;
        }

        this.elements.recentSection.classList.remove('hidden');
        this.elements.recentList.innerHTML = '';

        // Show only first 6 recent items
        recentItems.slice(0, 6).forEach(item => {
            const meditation = this.meditations.find(m => m.filename === item.filename);
            if (meditation) {
                const card = this.createMeditationCard(meditation);
                this.elements.recentList.appendChild(card);
            }
        });
    },

    /**
     * Render categories
     */
    renderCategories() {
        const grouped = CategoryManager.groupByCategory(this.meditations);

        this.elements.categorySections.innerHTML = '';

        Object.values(grouped).forEach(group => {
            const section = this.createCategorySection(group.category, group.meditations);
            this.elements.categorySections.appendChild(section);
        });
    },

    /**
     * Create a category section
     */
    createCategorySection(category, meditations) {
        const section = document.createElement('section');
        section.className = 'section';

        const title = document.createElement('h2');
        title.className = 'section-title';
        title.innerHTML = `
            <span style="font-size: 1.5em;">${category.icon}</span>
            ${category.name}
        `;

        const grid = document.createElement('div');
        grid.className = 'meditation-grid';

        meditations.forEach(meditation => {
            const card = this.createMeditationCard(meditation);
            grid.appendChild(card);
        });

        section.appendChild(title);
        section.appendChild(grid);

        return section;
    },

    /**
     * Create a meditation card
     */
    createMeditationCard(meditation) {
        const card = document.createElement('div');
        card.className = 'meditation-card';

        const isFavorited = StorageManager.isFavorited(meditation.filename);
        const playbackData = StorageManager.getPlaybackPosition(meditation.filename);
        const hasProgress = playbackData && playbackData.position > 0;

        card.innerHTML = `
            <div class="meditation-card-header">
                <div class="meditation-card-icon">
                    <span style="font-size: 1.5em;">${meditation.category.icon}</span>
                </div>
            </div>
            <div class="meditation-card-content">
                <h3 class="meditation-card-title">${meditation.title}</h3>
                <p class="meditation-card-category">${meditation.category.name}</p>
                ${hasProgress ? `
                    <div class="meditation-card-progress">
                        <p class="progress-label">Continue from ${this.formatTime(playbackData.position)}</p>
                        <div class="progress-bar-small">
                            <div class="progress-fill-small" style="width: ${(playbackData.position / playbackData.duration) * 100}%"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Add favorite button
        const header = card.querySelector('.meditation-card-header');
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = `meditation-card-favorite ${isFavorited ? 'favorited' : ''}`;
        favoriteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorited ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        `;

        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(meditation.filename);
        });

        header.appendChild(favoriteBtn);

        // Add click handler to play
        card.addEventListener('click', () => {
            this.playMeditation(meditation);
        });

        return card;
    },

    /**
     * Play a meditation
     */
    playMeditation(meditation) {
        AudioPlayer.load(meditation);
    },

    /**
     * Toggle favorite
     */
    toggleFavorite(filename) {
        StorageManager.toggleFavorite(filename);
        this.render();
    },

    /**
     * Format time in MM:SS
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Show loading indicator
     */
    showLoading() {
        this.isLoading = true;
        this.elements.loadingIndicator.classList.add('active');
    },

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.isLoading = false;
        this.elements.loadingIndicator.classList.remove('active');
    },

    /**
     * Show empty state
     */
    showEmptyState() {
        this.elements.emptyState.classList.remove('hidden');
        this.elements.favoritesSection.classList.add('hidden');
        this.elements.recentSection.classList.add('hidden');
        this.elements.categorySections.innerHTML = '';
    },

    /**
     * Hide empty state
     */
    hideEmptyState() {
        this.elements.emptyState.classList.add('hidden');
    },

    /**
     * Register service worker for PWA functionality
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('service-worker.js');
                console.log('Service Worker registered successfully:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Make App globally available
window.App = App;
