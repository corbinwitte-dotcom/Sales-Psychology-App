# Quick Start Guide

Get your Peak Performance app running in 5 minutes!

## Step 1: Add Audio Files

Place your meditation/visualization audio files in the `audio/` folder, then update `audio/audio-files.json`:

```json
{
  "files": [
    "morning-sales-confidence.mp3",
    "pre-cold-call-visualization.mp3",
    "presentation-power.mp3",
    "networking-event-prep.mp3",
    "daily-mindset-practice.mp3"
  ]
}
```

**Important:** List ALL your audio files in `audio-files.json` for them to appear in the app!

## Step 2: Generate Icons (Optional but Recommended)

Quick option - Use an online generator:
1. Go to https://realfavicongenerator.net/
2. Upload `icons/icon.svg`
3. Download and extract to `icons/` folder

See `icons/ICON-GUIDE.md` for detailed instructions.

## Step 3: Start Local Server

Choose your preferred method:

**Python (easiest):**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server -p 8000
```

**PHP:**
```bash
php -S localhost:8000
```

## Step 4: Open in Browser

Navigate to: `http://localhost:8000`

## Step 5: Install on iPhone (Optional)

1. Open in Safari on iPhone
2. Tap Share button
3. Select "Add to Home Screen"
4. Tap "Add"

Done! Your meditation app is ready to use.

## Testing Without Audio Files

The app will show a helpful empty state if no audio files are found. You can still:
- Test the interface
- Check responsive design
- Verify PWA installation
- Review the UI/UX

## Next Steps

- Customize colors in `css/styles.css`
- Add your branding
- Create your meditation content
- Share with your team!

## Need Help?

Check `README.md` for comprehensive documentation and troubleshooting.

---

**Pro Tip**: Name your files descriptively! The app automatically categorizes based on keywords in the filename. Use words like "call", "meeting", "presentation", "confidence", "morning", etc.
