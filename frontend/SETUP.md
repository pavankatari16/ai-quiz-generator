# Frontend Setup Guide

Complete setup instructions for the AI Quiz Generator React frontend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running Locally](#running-locally)
5. [Building for Production](#building-for-production)
6. [Deploying to Vercel](#deploying-to-vercel)
7. [Project Structure](#project-structure)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js 14+** and **npm** ([Download](https://nodejs.org/))
- **Git** (for cloning repository)
- **Backend API running** (See [backend/SETUP.md](../backend/SETUP.md))

### Verify Installation

```bash
node --version
npm --version
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/pavankatari16/ai-quiz-generator.git
cd ai-quiz-generator/frontend
```

### 2. Install Dependencies

```bash
npm install
```

**What gets installed:**
- `react` - UI library
- `react-dom` - React DOM renderer
- `axios` - HTTP client
- `react-scripts` - Build and run scripts

### 3. Verify Installation

```bash
npm list react axios
```

## Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Edit .env

The `.env.example` file is already configured for local development:

```env
REACT_APP_API_URL=http://localhost:8000
```

**For different environments:**

**Development (local):**
```env
REACT_APP_API_URL=http://localhost:8000
```

**Production (example):**
```env
REACT_APP_API_URL=https://api.example.com
```

### Important Notes on Environment Variables

- Must start with `REACT_APP_` prefix (React requirement)
- Cannot be changed after build
- Need to rebuild for changes to take effect
- Vercel automatically injects environment variables at build time

## Running Locally

### Start Development Server

```bash
npm start
```

**Output:**
```
Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

The app will automatically open in your default browser.

### Features When Running Locally

- Hot reload: Changes reflect immediately
- Source maps for debugging
- Full error messages in console
- Debug tools available

### Stop the Server

Press `Ctrl+C` in the terminal.

## Building for Production

### Create Optimized Build

```bash
npm run build
```

**Output directory:** `build/`

**Build includes:**
- Minified JavaScript and CSS
- Optimized images
- Source maps (optional)
- Static assets

### Test Production Build Locally

```bash
npm install -g serve
serve -s build
```

Visit: http://localhost:3000

## Project Structure

```
frontend/
├── public/
│   └── index.html               # HTML entry point
├── src/
│   ├── components/
│   │   ├── GenerateQuiz.jsx     # Quiz generation form
│   │   ├── GenerateQuiz.css
│   │   ├── History.jsx          # Quiz history grid
│   │   ├── History.css
│   │   ├── Modal.jsx            # Quiz details modal
│   │   └── Modal.css
│   ├── services/
│   │   └── api.js               # Axios API client
│   ├── App.jsx                  # Main app component
│   ├── App.css
│   ├── index.js                 # React entry point
│   └── index.css
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .gitignore
├── package.json                 # Dependencies
├── vercel.json                  # Vercel config
└── README.md
```

## Components

### App.jsx
- Main application component
- Tab navigation (Generate Quiz / History)
- Header and footer
- Theme styling

### GenerateQuiz.jsx
- URL input form
- Quiz generation logic
- Loading states
- Error handling
- Quiz display with card layout

### History.jsx
- Fetches quiz history from API
- Grid display of quizzes
- Refresh button
- Opens modal on quiz click

### Modal.jsx
- Full quiz details
- All questions and answers
- Close button
- Overlay click to close

### services/api.js
- Axios instance with base URL
- API methods: generateQuiz, getHistory, getQuiz
- Environment variable support

## API Service Usage

The `api.js` service provides three methods:

### Generate Quiz

```javascript
import { generateQuiz } from '../services/api';

const response = await generateQuiz('https://example.com');
// response.data contains: { id, url, title, date_generated, full_quiz_data }
```

### Get History

```javascript
import { getHistory } from '../services/api';

const response = await getHistory(limit = 50, offset = 0);
// response.data contains: array of quiz objects
```

### Get Specific Quiz

```javascript
import { getQuiz } from '../services/api';

const response = await getQuiz(1);
// response.data contains: { id, url, title, date_generated, full_quiz_data }
```

## Deploying to Vercel

### Prerequisites

- GitHub account with code pushed
- Vercel account (free at https://vercel.com)

### Step 1: Connect Repository to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Choose "frontend" directory as the root

### Step 2: Add Environment Variables

In Vercel dashboard:

1. Go to Settings → Environment Variables
2. Add variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** Your backend URL (e.g., `https://api.example.com`)
   - **Environments:** Check all environments

### Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit generated URL (e.g., `https://app.vercel.app`)

### Step 4: Automatic Deployments

- Vercel automatically deploys on push to main branch
- Pull requests get preview deployments
- Rollbacks available in Vercel dashboard

### Custom Domain

1. In Vercel dashboard: Settings → Domains
2. Add your custom domain
3. Follow DNS instructions
4. Domain updates within 24 hours

## Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests (if configured)
npm test

# Eject configuration (not reversible!)
npm run eject
```

## Styling

- **Components:** Individual CSS files for each component
- **Global:** index.css and App.css
- **Colors:** Primary blue (#667eea), secondary purple (#764ba2)
- **Responsive:** Mobile-first design with media queries

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance Tips

1. **Use React DevTools:** Browser extension for debugging
2. **Check Bundle Size:** `npm run build` shows size stats
3. **Lazy Loading:** Consider lazy loading components for large apps
4. **Image Optimization:** Use appropriate image formats

## Troubleshooting

### Issue: "npm: command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue: Port 3000 Already in Use

**Solution:**
```bash
npm start -- --port 3001
```

### Issue: "REACT_APP_API_URL is undefined"

**Solutions:**
1. Check `.env` file exists in root
2. Restart dev server: `npm start`
3. Variable must start with `REACT_APP_`

### Issue: API Requests Failing (CORS Error)

**Solutions:**
1. Verify backend is running on correct port
2. Check `REACT_APP_API_URL` in `.env`
3. Backend should have CORS enabled
4. Try with full URL: `http://localhost:8000`

### Issue: "Cannot find module" Error

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Changes Not Reflecting in Browser

**Solutions:**
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Restart dev server: `npm start`

### Issue: Build Fails on Vercel

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Check Node version: `node --version`
4. Test locally: `npm run build`

### Issue: Blank Page After Deploy

**Solutions:**
1. Open browser console (F12) for errors
2. Check browser network tab
3. Verify API endpoint is accessible
4. Check `REACT_APP_API_URL` is set correctly

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | Yes | http://localhost:8000 | Backend API endpoint |

## Development Workflow

1. **Local Development:**
   ```bash
   npm start
   ```

2. **Test Changes:**
   - Browser auto-refreshes
   - Check console for errors

3. **Build:**
   ```bash
   npm run build
   ```

4. **Deploy:**
   - Push to GitHub
   - Vercel auto-deploys

## Next Steps

1. **Install dependencies:** `npm install`
2. **Start dev server:** `npm start`
3. **Setup backend:** See [backend/SETUP.md](../backend/SETUP.md)
4. **Deploy:** Follow [Deploying to Vercel](#deploying-to-vercel)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Check React documentation: https://react.dev/

## Additional Resources

- [React Documentation](https://react.dev/)
- [Create React App Docs](https://create-react-app.dev/)
- [Axios Documentation](https://axios-http.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
