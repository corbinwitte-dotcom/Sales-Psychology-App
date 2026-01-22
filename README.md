# Peak Performance - Sales Visualization App

A professional meditation and guided visualization web application designed for sales professionals, built on Psycho-Cybernetics principles. This app helps you achieve peak performance through targeted mental preparation for calls, meetings, presentations, and building professional confidence.

## Features

✨ **Core Functionality**
- Upload and play guided meditation/visualization audio files
- Automatic categorization based on file names
- Professional audio player with play/pause, seek, and time display
- Favorite/bookmark meditations for quick access
- Automatic playback position memory

🎨 **Design**
- Clean, professional, confidence-inspiring aesthetic
- Deep blue and white color scheme
- Mobile-first responsive design
- Smooth animations and transitions
- iPhone-optimized with home screen support

📱 **Progressive Web App (PWA)**
- Install as a native app on iPhone and Android
- Offline capability once audio files are cached
- Fast loading and smooth performance

🗂️ **Smart Categories**
- **Calls & Meetings** - Cold calls, demos, negotiations
- **Public Speaking** - Presentations, conferences, networking
- **Confidence & Presence** - Body language, self-image, leadership
- **Daily Practice** - Morning visualizations, general mindset

## Getting Started

### 1. Add Your Audio Files

Place your guided meditation audio files in the `audio/` folder. Supported formats:
- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- OGG (.ogg)
- AAC (.aac)
- FLAC (.flac)

### 2. File Naming for Auto-Categorization

The app automatically categorizes your meditations based on keywords in the filename:

**Calls & Meetings**
```
pre-sales-call-confidence.mp3
cold-call-visualization.mp3
demo-preparation.mp3
negotiation-mindset.mp3
```

**Public Speaking**
```
presentation-confidence.mp3
networking-event-prep.mp3
conference-speaking.mp3
stage-presence.mp3
```

**Confidence & Presence**
```
body-language-mastery.mp3
self-image-builder.mp3
professional-charisma.mp3
leadership-presence.mp3
```

**Daily Practice**
```
morning-sales-mindset.mp3
daily-confidence-practice.mp3
general-visualization.mp3
foundation-building.mp3
```

### 3. Running the App

**Option A: Using a Local Server (Recommended)**

Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js:
```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server -p 8000
```

Using PHP:
```bash
php -S localhost:8000
```

Then open your browser to: `http://localhost:8000`

**Option B: Direct File Access**

Simply open `index.html` in your browser. Note: Some features like service workers may not work without a server.

### 4. Installing as a Mobile App (iPhone)

1. Open the app in Safari on your iPhone
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Give it a name (e.g., "Peak Performance")
5. Tap "Add"

The app will now appear on your home screen like a native app!

## Project Structure

```
Sales-Psychology-App/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline capability
├── README.md              # This file
│
├── css/
│   └── styles.css         # All styles with mobile-first design
│
├── js/
│   ├── app.js            # Main application logic
│   ├── player.js         # Audio player functionality
│   ├── storage.js        # localStorage management
│   └── categories.js     # Auto-categorization logic
│
├── audio/                 # Place your audio files here
│   └── (your meditation files)
│
└── icons/                 # App icons for PWA
    ├── icon.svg          # Source SVG icon
    └── (generated PNG icons)
```

## Usage

### Playing a Meditation

1. Click on any meditation card
2. The player will appear at the bottom of the screen
3. Use the play/pause button or spacebar to control playback
4. Seek by dragging the progress bar
5. Skip forward/backward 10 seconds with the arrow buttons

### Keyboard Shortcuts

When the player is active:
- **Spacebar** or **K** - Play/Pause
- **Left Arrow** - Rewind 10 seconds
- **Right Arrow** - Forward 10 seconds
- **Escape** - Close player

### Managing Favorites

- Click the star icon on any meditation card to favorite it
- Favorited meditations appear in the "Favorites" section at the top
- Perfect for quick access to your pre-event visualizations

### Playback Position Memory

- The app automatically remembers where you left off
- Resume any meditation from where you stopped
- Position is saved every 2 seconds while playing
- Position clears automatically when you finish a meditation

### Recently Played

- Your last 10 played meditations appear in the "Recently Played" section
- Quickly repeat your favorite practices

## Customization

### Changing Colors

Edit `css/styles.css` and modify the CSS variables:

```css
:root {
    --primary-blue: #1e3a8a;        /* Main brand color */
    --accent-blue: #3b82f6;         /* Accent color */
    --light-blue: #60a5fa;          /* Light accent */
    /* ... more variables */
}
```

### Adding New Categories

Edit `js/categories.js` and add to the `categories` object:

```javascript
'your-category-id': {
    name: 'Your Category Name',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    icon: '🎯',
    color: '#3b82f6'
}
```

### Customizing the Icon

1. Edit `icons/icon.svg` with your design
2. Generate PNG icons using an online tool or image editor:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 180x180, 192x192, 384x384, 512x512

## Browser Support

- **Mobile**: iOS Safari 12+, Chrome for Android 80+
- **Desktop**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

## Data Storage

All data is stored locally in your browser using localStorage:
- **Favorites** - List of favorited meditations
- **Playback Positions** - Resume points for each meditation
- **Recently Played** - History of played meditations
- **Settings** - User preferences

**Privacy Note**: No data is sent to any server. Everything stays on your device.

## Offline Usage

Once you've loaded the app and played your audio files:
1. The app caches the core files automatically
2. Audio files are cached as you play them
3. You can use the app without internet connection
4. Perfect for airplane mode or areas with poor connectivity

## Troubleshooting

### Audio files not showing up

1. Make sure files are in the `audio/` folder
2. Check that file extensions are supported (.mp3, .wav, etc.)
3. If using direct file access, try using a local server instead
4. Check browser console (F12) for errors

### Player not working

1. Check browser console for errors
2. Ensure audio file format is supported by your browser
3. Try a different browser (Safari on iOS, Chrome on Android)

### Service worker issues

1. Service workers require HTTPS or localhost
2. Clear your browser cache and reload
3. Unregister old service workers in browser DevTools

### Can't install as PWA

1. Must be served over HTTPS (or localhost)
2. Manifest.json must be valid
3. Icons must be accessible
4. Try in a different browser

## Performance Tips

1. **Use MP3 format** - Best compatibility and file size
2. **Optimize audio bitrate** - 128kbps is usually sufficient for voice
3. **Keep filenames descriptive** - Helps with auto-categorization
4. **Limit to ~50 files** - For best performance
5. **Use HTTPS in production** - Enables all PWA features

## Development

Want to modify or extend the app?

### Technologies Used
- Vanilla JavaScript (ES6+)
- HTML5 Audio API
- CSS3 with CSS Variables
- LocalStorage API
- Service Worker API
- Web App Manifest

### No Build Process Required
All code is vanilla JS/CSS/HTML - no compilation or bundling needed!

### Code Organization
- `storage.js` - Data persistence layer
- `categories.js` - Categorization logic
- `player.js` - Audio player controls
- `app.js` - Main application controller

## License

This is a custom application for personal use. Modify and customize as needed!

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify file paths and names
3. Test in different browsers
4. Ensure you're using a local server (not file://)

---

**Built for peak performance. Use before important calls, meetings, and presentations to get into the optimal mental state for success.**

🎯 **Pro Tip**: Create a pre-call ritual - listen to a 5-minute visualization right before important sales calls. Your mind will associate the meditation with peak performance states.
