# Setup Guide - Adding Your Audio Files

Follow these simple steps to add your meditation audio files to the app.

## Step 1: Add Audio Files

Place your meditation/visualization audio files in the `audio/` folder.

```
audio/
├── audio-files.json
├── morning-confidence.mp3
├── pre-call-power.mp3
└── presentation-mastery.mp3
```

Supported formats: `.mp3`, `.wav`, `.m4a`, `.ogg`, `.aac`, `.flac`

## Step 2: Update the Manifest File

Open `audio/audio-files.json` and list ALL your audio files:

```json
{
  "files": [
    "morning-confidence.mp3",
    "pre-call-power.mp3",
    "presentation-mastery.mp3"
  ]
}
```

**Important:**
- Include the file extension (`.mp3`, etc.)
- Use the exact filename (case-sensitive)
- Separate filenames with commas
- Keep the JSON format valid

## Step 3: Start the Server

```bash
python -m http.server 8000
```

## Step 4: Open the App

Navigate to `http://localhost:8000` in your browser.

Your meditations should now appear!

## Troubleshooting

### "Welcome to Peak Performance" screen won't go away

**Check 1:** Are your files in the `audio/` folder?
```bash
ls audio/
```

**Check 2:** Is `audio-files.json` updated with your filenames?
```bash
cat audio/audio-files.json
```

**Check 3:** Is the JSON valid?
- Each filename in quotes
- Commas between filenames (but NOT after the last one)
- Proper brackets `{ }` and `[ ]`

**Check 4:** Open browser console (F12) and look for errors

### Example Valid JSON

✅ **Correct:**
```json
{
  "files": [
    "file1.mp3",
    "file2.mp3",
    "file3.mp3"
  ]
}
```

❌ **Wrong (extra comma):**
```json
{
  "files": [
    "file1.mp3",
    "file2.mp3",
    "file3.mp3",
  ]
}
```

❌ **Wrong (missing quotes):**
```json
{
  "files": [
    file1.mp3,
    file2.mp3
  ]
}
```

## File Naming for Auto-Categorization

The app automatically organizes your meditations based on keywords in the filename:

### Calls & Meetings
- `pre-sales-call-confidence.mp3`
- `cold-call-power.mp3`
- `client-meeting-prep.mp3`

### Public Speaking
- `presentation-confidence.mp3`
- `networking-event.mp3`
- `conference-speaking.mp3`

### Confidence & Presence
- `body-language-mastery.mp3`
- `professional-charisma.mp3`
- `leadership-presence.mp3`

### Daily Practice
- `morning-sales-mindset.mp3`
- `daily-visualization.mp3`
- `evening-reflection.mp3`

## Quick Reference

**Add file:**
1. Copy to `audio/` folder
2. Add filename to `audio-files.json`
3. Refresh browser

**Remove file:**
1. Delete from `audio/` folder
2. Remove from `audio-files.json`
3. Refresh browser

**Rename file:**
1. Rename in `audio/` folder
2. Update name in `audio-files.json`
3. Refresh browser
OR use the rename feature in the app (keeps original filename)

## Need Help?

Check the browser console (F12) for error messages. Common issues:
- JSON syntax errors
- Missing files
- Incorrect filenames
- Server not running

---

**That's it!** Once your files are listed in `audio-files.json`, they'll appear in the app automatically organized by category.
