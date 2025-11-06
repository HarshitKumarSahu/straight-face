# Say It! With a Straight Face

An interactive web game that challenges you to read absurd phrases aloud **without showing any emotion**. Using your webcam and microphone, AI tracks your facial expressions and speech in real time. Stay stoic to earn points — but crack a smile, frown, or gasp, and it's **Game Over**.

Built with real-time facial emotion detection, speech recognition, and a healthy dose of humor.

![Gameplay Preview](/preview.jpg)  

---

## Features

- **3-Phase Experience**:
    -  **Splash** – Bold intro with parallax background.
    - **Instructions** – Clear steps with animated visuals.
    - **Gameplay** – Real-time emotion + speech tracking.

- **Emotion Detection** (via Face++ API):
  - Tracks: `happiness`, `surprise`, `sadness`, `disgust`, `anger`
  - Threshold: **>66%** on any emotion → **Game Over** after 1.2s

- **Speech Recognition** (Web Speech API):
  - Fuzzy matching allows natural speech.
  - Highlights words as you say them correctly.

- **Visual Feedback**:
  - Live audio waveform
  - Face landmark tracking (TensorFlow.js BlazeFace)
  - Animated emotion bars with alert blink

- **Game Over Screen**:
  - Final score
  - Reason for loss (e.g., "too **happy**")
  - Share via Web Share API or clipboard
  - "Try Again" button

- **Accessibility**:
  - `prefers-reduced-motion` support
  - Mobile-responsive layout
  - High contrast yellow-on-black theme

---

## Tech Stack

| Layer       | Technology |
|------------|------------|
| **Frontend** | Vite, Vanilla JS (ES Modules), SCSS |
| **Backend**  | Node.js, Express, Socket.IO |
| **AI/ML**    | Face++ (emotion), TensorFlow.js (landmarks), Web Speech API |
| **Libs**     | Lodash, FuzzySet.js, intrinsic-scale |
| **Build**    | Vite + Sass |
| **Deploy**   | Render (recommended), Heroku-ready |

---

## Quick Start (Local)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/say-it-with-a-straight-face.git
cd say-it-with-a-straight-face
npm install
```

### 2. Add Face++ API Keys
Create .env in root:
```bash
envFACE_PLUS_KEY=your_faceplusplus_key_here
FACE_PLUS_SECRET=your_faceplusplus_secret_here
```

Get free keys at faceplusplus.com

### 3. Run Development Server
```bash
npm run dev
``` 
Open http://localhost:3000 (Chrome recommended)

## Scripts
| Command       | Description |
|------------|------------|
| **npm run dev** | Start dev server with hot reload |
| **npm run build**  | Build production assets to /dist |
| **npm start**    | Run production server (NODE_ENV=production) |


## Deployment
### Render.com (Recommended)

- Push code to GitHub
- Go to render.com → New Web Service
- Connect your repo
- Settings:
    1. Build Command: npm install && npm run build
    2. Start Command: npm start
    3. Enviro nment Variables:
        - FACE_PLUS_KEY
        - FACE_PLUS_SECRET

Project Structure
```bash 
src/
├── js/                → Game logic modules
│   ├── initPhaseThree.js
│   ├── onTranscript.js
│   ├── phrases.js
│   └── ...
├── scss/              → Modular styles
│   ├── phase01.scss
│   ├── phase03.scss
│   └── base.scss
├── main.js            → Entry point
└── main.scss          → Style imports
server/
├── io.js              → Socket.IO logic
├── facePlusPlus.js    → Face++ API wrapper
└── index.js           → Express + Vite server
index.html             → App shell
package.json
.env                   → API keys (git ignored)
```

## Game Mechanics

- Phrases: 50+ hand-written absurd lines (add more in src/js/phrases.js)
- Scoring: +1 point per completed phrase
- Emotion Timer: 1.2s grace period after threshold breach
- Speech Matching: FuzzySet with 60% confidence threshold
- Face Landmarks: 3 key points tracked (eyes + mouth)


## Browser Support
| Browser       | Speech API | Camera | Notes |
|------------|------------|-----------|--------|
| **Chrome** | Yes | Yes | Best experience |
| **Firefox**  | Partial | Yes | Speech may be unstable |
| **Safari**    | No | Yes | No speech recognition |

## Contributing

- Fork the repo
- Create a feature branch
- Run npm run dev and test
- Submit a Pull Request

## Tips:

- Add new phrases to phrases.js
- Keep them short, weird, and speakable
- Use Prettier: 4-space tabs, single quotes

## License
MIT ©[Harshit Kumar Sahu](https://www.linkedin.com/in/harshitkumarsahu-14082004aug/)


```
 "Read this out loud with a straight face: 'The princess WILL NOT be eating the fruitcake.'"
```


