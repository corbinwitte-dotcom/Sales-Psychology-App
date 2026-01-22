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
        categorySections: null,
        renameModal: null,
        renameInput: null,
        originalTitle: null,
        saveRenameBtn: null,
        cancelRenameBtn: null,
        closeRenameModal: null,
        resetTitleBtn: null
    },

    // Current meditation being renamed
    currentRenameMeditation: null,

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
        this.elements.renameModal = document.getElementById('renameModal');
        this.elements.renameInput = document.getElementById('renameInput');
        this.elements.originalTitle = document.getElementById('originalTitle');
        this.elements.saveRenameBtn = document.getElementById('saveRenameBtn');
        this.elements.cancelRenameBtn = document.getElementById('cancelRenameBtn');
        this.elements.closeRenameModal = document.getElementById('closeRenameModal');
        this.elements.resetTitleBtn = document.getElementById('resetTitleBtn');

        // Initialize rename modal
        this.initRenameModal();

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
        const customTitle = StorageManager.getCustomTitle(meditation.filename);
        const displayTitle = customTitle || meditation.title;
        const hasCustomTitle = !!customTitle;

        card.innerHTML = `
            <div class="meditation-card-header">
                <div class="meditation-card-icon">
                    <span style="font-size: 1.5em;">${meditation.category.icon}</span>
                </div>
            </div>
            <div class="meditation-card-content">
                <div class="meditation-card-title-wrapper">
                    <div class="meditation-card-title-text">
                        <h3 class="meditation-card-title">
                            ${displayTitle}
                            ${hasCustomTitle ? '<span class="custom-title-indicator" title="Custom title"></span>' : ''}
                        </h3>
                    </div>
                </div>
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

        // Create actions container
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'meditation-card-actions';

        // Add rename button
        const renameBtn = document.createElement('button');
        renameBtn.className = 'meditation-card-rename';
        renameBtn.title = 'Rename meditation';
        renameBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
        `;

        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openRenameModal(meditation);
        });

        actionsContainer.appendChild(renameBtn);
        actionsContainer.appendChild(favoriteBtn);
        header.appendChild(actionsContainer);

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
     * Initialize rename modal
     */
    initRenameModal() {
        // Close modal handlers
        this.elements.closeRenameModal.addEventListener('click', () => {
            this.closeRenameModal();
        });

        this.elements.cancelRenameBtn.addEventListener('click', () => {
            this.closeRenameModal();
        });

        // Click outside to close
        this.elements.renameModal.addEventListener('click', (e) => {
            if (e.target === this.elements.renameModal || e.target.classList.contains('modal-overlay')) {
                this.closeRenameModal();
            }
        });

        // Save rename
        this.elements.saveRenameBtn.addEventListener('click', () => {
            this.saveRename();
        });

        // Reset to original title
        this.elements.resetTitleBtn.addEventListener('click', () => {
            this.resetTitle();
        });

        // Enter key to save
        this.elements.renameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveRename();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.closeRenameModal();
            }
        });
    },

    /**
     * Open rename modal
     */
    openRenameModal(meditation) {
        this.currentRenameMeditation = meditation;

        const customTitle = StorageManager.getCustomTitle(meditation.filename);
        const displayTitle = customTitle || meditation.title;

        this.elements.renameInput.value = displayTitle;
        this.elements.originalTitle.textContent = meditation.title;

        // Show/hide reset button based on whether there's a custom title
        if (customTitle) {
            this.elements.resetTitleBtn.style.display = 'block';
        } else {
            this.elements.resetTitleBtn.style.display = 'none';
        }

        this.elements.renameModal.classList.remove('hidden');
        setTimeout(() => {
            this.elements.renameModal.classList.add('active');
            this.elements.renameInput.focus();
            this.elements.renameInput.select();
        }, 10);
    },

    /**
     * Close rename modal
     */
    closeRenameModal() {
        this.elements.renameModal.classList.remove('active');
        setTimeout(() => {
            this.elements.renameModal.classList.add('hidden');
            this.currentRenameMeditation = null;
        }, 300);
    },

    /**
     * Save renamed title
     */
    saveRename() {
        if (!this.currentRenameMeditation) return;

        const newTitle = this.elements.renameInput.value.trim();

        if (!newTitle) {
            alert('Please enter a name for the meditation');
            this.elements.renameInput.focus();
            return;
        }

        // Save custom title
        StorageManager.setCustomTitle(this.currentRenameMeditation.filename, newTitle);

        // Update the meditation object's title for current session
        const meditation = this.meditations.find(m => m.filename === this.currentRenameMeditation.filename);
        if (meditation) {
            // Note: We don't actually modify the meditation object, custom title is stored separately
            // and retrieved when displaying
        }

        // Re-render UI
        this.render();

        // Update player if this meditation is currently playing
        if (AudioPlayer.currentMeditation &&
            AudioPlayer.currentMeditation.filename === this.currentRenameMeditation.filename) {
            AudioPlayer.elements.playerTitle.textContent = newTitle;
        }

        this.closeRenameModal();
    },

    /**
     * Reset to original title
     */
    resetTitle() {
        if (!this.currentRenameMeditation) return;

        if (confirm('Reset to original title?')) {
            StorageManager.removeCustomTitle(this.currentRenameMeditation.filename);
            this.render();

            // Update player if this meditation is currently playing
            if (AudioPlayer.currentMeditation &&
                AudioPlayer.currentMeditation.filename === this.currentRenameMeditation.filename) {
                AudioPlayer.elements.playerTitle.textContent = this.currentRenameMeditation.title;
            }

            this.closeRenameModal();
        }
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
