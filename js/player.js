/**
 * Audio Player Manager
 * Handles all audio playback functionality
 */

const AudioPlayer = {
    // DOM elements
    elements: {
        player: null,
        audio: null,
        playPauseBtn: null,
        playIcon: null,
        pauseIcon: null,
        rewindBtn: null,
        forwardBtn: null,
        progressSlider: null,
        progressFill: null,
        currentTime: null,
        duration: null,
        playerTitle: null,
        playerCategory: null,
        favoriteBtn: null,
        favoriteIcon: null,
        favoriteIconFilled: null,
        closePlayer: null
    },

    // Current meditation data
    currentMeditation: null,
    isPlaying: false,
    progressUpdateInterval: null,

    /**
     * Initialize the audio player
     */
    init() {
        // Get DOM elements
        this.elements.player = document.getElementById('audioPlayer');
        this.elements.audio = document.getElementById('audioElement');
        this.elements.playPauseBtn = document.getElementById('playPauseBtn');
        this.elements.playIcon = document.getElementById('playIcon');
        this.elements.pauseIcon = document.getElementById('pauseIcon');
        this.elements.rewindBtn = document.getElementById('rewindBtn');
        this.elements.forwardBtn = document.getElementById('forwardBtn');
        this.elements.progressSlider = document.getElementById('progressSlider');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.currentTime = document.getElementById('currentTime');
        this.elements.duration = document.getElementById('duration');
        this.elements.playerTitle = document.getElementById('playerTitle');
        this.elements.playerCategory = document.getElementById('playerCategory');
        this.elements.favoriteBtn = document.getElementById('favoriteBtn');
        this.elements.favoriteIcon = document.getElementById('favoriteIcon');
        this.elements.favoriteIconFilled = document.getElementById('favoriteIconFilled');
        this.elements.closePlayer = document.getElementById('closePlayer');

        // Attach event listeners
        this.attachEventListeners();

        console.log('AudioPlayer initialized');
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Play/Pause
        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());

        // Rewind/Forward
        this.elements.rewindBtn.addEventListener('click', () => this.skip(-10));
        this.elements.forwardBtn.addEventListener('click', () => this.skip(10));

        // Progress slider
        this.elements.progressSlider.addEventListener('input', (e) => this.seek(e));
        this.elements.progressSlider.addEventListener('change', (e) => this.seek(e));

        // Audio events
        this.elements.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        this.elements.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.elements.audio.addEventListener('ended', () => this.onEnded());
        this.elements.audio.addEventListener('play', () => this.onPlay());
        this.elements.audio.addEventListener('pause', () => this.onPause());
        this.elements.audio.addEventListener('error', (e) => this.onError(e));

        // Favorite button
        this.elements.favoriteBtn.addEventListener('click', () => this.toggleFavorite());

        // Close player
        this.elements.closePlayer.addEventListener('click', () => this.close());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    },

    /**
     * Load and play a meditation
     */
    load(meditation) {
        this.currentMeditation = meditation;

        // Update player UI
        this.elements.playerTitle.textContent = meditation.title;
        this.elements.playerCategory.textContent = meditation.category.name;

        // Update favorite button state
        this.updateFavoriteButton();

        // Load audio
        this.elements.audio.src = meditation.path;

        // Show player
        this.show();

        // Load saved playback position
        const savedPosition = StorageManager.getPlaybackPosition(meditation.filename);
        if (savedPosition && savedPosition.position) {
            this.elements.audio.currentTime = savedPosition.position;
        }

        // Add to recently played
        StorageManager.addToRecentlyPlayed(
            meditation.filename,
            meditation.title,
            meditation.category.name
        );

        // Auto play
        this.play();
    },

    /**
     * Play audio
     */
    play() {
        const playPromise = this.elements.audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Playback started successfully
                    console.log('Playback started');
                })
                .catch(error => {
                    console.error('Playback failed:', error);
                    alert('Failed to play audio. Please try again.');
                });
        }
    },

    /**
     * Pause audio
     */
    pause() {
        this.elements.audio.pause();
    },

    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    /**
     * Skip forward or backward
     */
    skip(seconds) {
        this.elements.audio.currentTime = Math.max(
            0,
            Math.min(this.elements.audio.duration, this.elements.audio.currentTime + seconds)
        );
    },

    /**
     * Seek to position
     */
    seek(e) {
        const percent = e.target.value;
        const time = (percent / 100) * this.elements.audio.duration;
        this.elements.audio.currentTime = time;
    },

    /**
     * Show player
     */
    show() {
        this.elements.player.classList.remove('hidden');
        setTimeout(() => {
            this.elements.player.classList.add('active');
        }, 10);
    },

    /**
     * Close player
     */
    close() {
        this.pause();
        this.elements.player.classList.remove('active');
        setTimeout(() => {
            this.elements.player.classList.add('hidden');
            this.currentMeditation = null;
        }, 350);
    },

    /**
     * Toggle favorite
     */
    toggleFavorite() {
        if (!this.currentMeditation) return;

        StorageManager.toggleFavorite(this.currentMeditation.filename);
        this.updateFavoriteButton();

        // Trigger UI update in main app
        if (window.App && window.App.render) {
            window.App.render();
        }
    },

    /**
     * Update favorite button appearance
     */
    updateFavoriteButton() {
        if (!this.currentMeditation) return;

        const isFavorited = StorageManager.isFavorited(this.currentMeditation.filename);

        if (isFavorited) {
            this.elements.favoriteIcon.style.display = 'none';
            this.elements.favoriteIconFilled.style.display = 'block';
            this.elements.favoriteBtn.classList.add('favorited');
        } else {
            this.elements.favoriteIcon.style.display = 'block';
            this.elements.favoriteIconFilled.style.display = 'none';
            this.elements.favoriteBtn.classList.remove('favorited');
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
     * Event: Metadata loaded
     */
    onMetadataLoaded() {
        this.elements.duration.textContent = this.formatTime(this.elements.audio.duration);
        this.elements.progressSlider.max = 100;
    },

    /**
     * Event: Time update
     */
    onTimeUpdate() {
        const currentTime = this.elements.audio.currentTime;
        const duration = this.elements.audio.duration;

        // Update time display
        this.elements.currentTime.textContent = this.formatTime(currentTime);

        // Update progress bar
        const percent = (currentTime / duration) * 100;
        this.elements.progressFill.style.width = `${percent}%`;
        this.elements.progressSlider.value = percent;

        // Save playback position (throttled)
        if (this.currentMeditation) {
            this.savePlaybackPositionThrottled(currentTime, duration);
        }
    },

    /**
     * Save playback position (throttled to every 2 seconds)
     */
    savePlaybackPositionThrottled: (() => {
        let lastSave = 0;
        return function(currentTime, duration) {
            const now = Date.now();
            if (now - lastSave > 2000) {
                StorageManager.savePlaybackPosition(
                    this.currentMeditation.filename,
                    currentTime,
                    duration
                );
                lastSave = now;
            }
        };
    })(),

    /**
     * Event: Audio ended
     */
    onEnded() {
        this.isPlaying = false;
        this.updatePlayPauseButton();

        // Clear playback position
        if (this.currentMeditation) {
            StorageManager.clearPlaybackPosition(this.currentMeditation.filename);
        }

        // Reset to beginning
        this.elements.audio.currentTime = 0;
    },

    /**
     * Event: Play started
     */
    onPlay() {
        this.isPlaying = true;
        this.updatePlayPauseButton();
    },

    /**
     * Event: Paused
     */
    onPause() {
        this.isPlaying = false;
        this.updatePlayPauseButton();

        // Save current position
        if (this.currentMeditation) {
            StorageManager.savePlaybackPosition(
                this.currentMeditation.filename,
                this.elements.audio.currentTime,
                this.elements.audio.duration
            );
        }
    },

    /**
     * Event: Error
     */
    onError(e) {
        console.error('Audio error:', e);
        alert('Error loading audio file. Please check the file and try again.');
    },

    /**
     * Update play/pause button appearance
     */
    updatePlayPauseButton() {
        if (this.isPlaying) {
            this.elements.playIcon.style.display = 'none';
            this.elements.pauseIcon.style.display = 'block';
            this.elements.playPauseBtn.setAttribute('aria-label', 'Pause');
        } else {
            this.elements.playIcon.style.display = 'block';
            this.elements.pauseIcon.style.display = 'none';
            this.elements.playPauseBtn.setAttribute('aria-label', 'Play');
        }
    },

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Only handle if player is active
        if (!this.elements.player.classList.contains('active')) return;

        // Don't interfere with input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.skip(-10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.skip(10);
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }
};

// Make it globally available
window.AudioPlayer = AudioPlayer;
