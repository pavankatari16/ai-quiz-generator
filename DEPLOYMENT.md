# Deployment Guide

Complete guide for deploying the AI Quiz Generator to production environments.

## Table of Contents

1. [Backend Deployment](#backend-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Monitoring & Logs](#monitoring--logs)
6. [Troubleshooting](#troubleshooting)

---

## Backend Deployment

### Option 1: Railway (Recommended for Beginners)

Railway makes backend deployment very easy.

#### Step 1: Prepare Code

```bash
# Make sure all changes are committed to Git
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Step 2: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

#### Step 3: Deploy from GitHub

1. Select "Deploy from GitHub repo"
2. Choose your repository
3. Select `backend` as the root directory

#### Step 4: Configure Environment

In Railway dashboard:
1. Go to Variables
2. Add:
   - `DATABASE_URL`: Leave empty (Railway provides PostgreSQL)
   - `GEMINI_API_KEY`: Your Gemini API key

#### Step 5: Deploy

Railway auto-deploys. Your backend is live at the generated URL.

**Getting Your Backend URL:**
- Dashboard → Deployments → Domains → Copy URL

### Option 2: Heroku (Classic Choice)

#### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows (download installer)
# https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli
```

#### Step 2: Login and Create App

```bash
heroku login
heroku create your-app-name
```

#### Step 3: Add Postgres Database

```bash
heroku addons:create heroku-postgresql:hobby-dev --app your-app-name
```

#### Step 4: Set Environment Variables

```bash
heroku config:set GEMINI_API_KEY=your_key --app your-app-name
```

#### Step 5: Deploy

```bash
git push heroku main
```

**Get Backend URL:**
```bash
heroku open --app your-app-name
```

### Option 3: AWS EC2 (Advanced)

#### Prerequisites
- AWS account
- EC2 instance (t3.micro free tier eligible)
- SSH access configured

#### Step 1: Connect to Instance

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

#### Step 2: Install Dependencies

```bash
sudo yum update -y
sudo yum install python3 python3-pip git -y
python3 --version
```

#### Step 3: Clone and Setup

```bash
git clone https://github.com/pavankatari16/ai-quiz-generator.git
cd ai-quiz-generator/backend/app
pip3 install -r requirements.txt
```

#### Step 4: Configure Environment

```bash
nano .env
# Add DATABASE_URL and GEMINI_API_KEY
```

#### Step 5: Start with Gunicorn

```bash
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 backend.app.main:app
```

#### Step 6: Use Systemd for Auto-start

Create `/etc/systemd/system/quiz-api.service`:

```ini
[Unit]
Description=AI Quiz Generator API
After=network.target

[Service]
Type=notify
User=ec2-user
WorkingDirectory=/home/ec2-user/ai-quiz-generator/backend/app
Environment="PATH=/home/ec2-user/venv/bin"
ExecStart=/home/ec2-user/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 backend.app.main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable quiz-api
sudo systemctl start quiz-api
```

---

## Frontend Deployment

### Vercel (Easiest)

#### Step 1: Push to GitHub

```bash
git push origin main
```

#### Step 2: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Select your GitHub repository
4. Choose `frontend` directory

#### Step 3: Add Environment Variables

In Vercel dashboard:
1. Settings → Environment Variables
2. Add: `REACT_APP_API_URL` = Your backend URL

#### Step 4: Deploy

Click "Deploy" and wait for build to complete.

**Your frontend URL:** `https://your-project.vercel.app`

### Netlify

#### Step 1: Build Locally

```bash
cd frontend
npm run build
```

#### Step 2: Deploy with Netlify

Option A: CLI
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=build
```

Option B: Dashboard
1. Go to https://app.netlify.com
2. Click "New site from Git"
3. Connect GitHub repository
4. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
5. Set environment variable: `REACT_APP_API_URL`

### Docker Deployment

#### Create Dockerfile (Backend)

```dockerfile
FROM python:3.9

WORKDIR /app

COPY backend/app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Create Dockerfile (Frontend)

```dockerfile
FROM node:16 AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

#### Build and Run

```bash
docker build -t quiz-api -f backend/Dockerfile.backend .
docker build -t quiz-frontend -f frontend/Dockerfile.frontend .

docker run -p 8000:8000 quiz-api
docker run -p 3000:80 quiz-frontend
```

---

## Database Setup

### PostgreSQL Setup (Production-Ready)

#### Local PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql
createdb quiz_generator

# Linux (Ubuntu)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb quiz_generator
```

#### Cloud PostgreSQL

**Option 1: Railway PostgreSQL**
- Railway auto-provisions PostgreSQL
- Set `DATABASE_URL` automatically

**Option 2: AWS RDS**
1. Create RDS instance (PostgreSQL)
2. Get connection string
3. Set `DATABASE_URL` environment variable

**Option 3: Render PostgreSQL**
1. Go to https://render.com
2. Create PostgreSQL database
3. Copy connection string to `DATABASE_URL`

### Initialize Database

```bash
# Create tables
python -c "from backend.app.database import init_db; init_db()"
```

---

## Environment Variables

### Required Variables

```env
# Production Backend
DATABASE_URL=postgresql://user:password@host:5432/quiz_generator
GEMINI_API_KEY=your_gemini_api_key

# Production Frontend
REACT_APP_API_URL=https://your-backend-url.com
```

### Secure Practices

1. **Never commit .env files** ✗
2. **Use environment secrets** in deployment platforms
3. **Rotate API keys** regularly
4. **Use strong database passwords**
5. **Enable HTTPS** for all communication

### Managing Secrets

#### Railway
Dashboard → Project → Variables → Protected

#### Heroku
```bash
heroku config:set KEY=value
```

#### Vercel/Netlify
Dashboard → Settings → Environment Variables → Mark as Sensitive

---

## SSL/HTTPS

### Auto SSL (Recommended)

Most platforms provide automatic HTTPS:
- Railway: Automatic
- Vercel: Automatic
- Netlify: Automatic
- Heroku: Free `.herokuapp.com` domain

### Custom Domain with SSL

1. Register domain (Godaddy, Namecheap, etc.)
2. Update DNS settings to point to your platform
3. Platform issues SSL certificate (Let's Encrypt)

### Local Testing with HTTPS

```bash
# Generate self-signed cert
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Run with SSL
uvicorn backend.app.main:app --ssl-keyfile=key.pem --ssl-certfile=cert.pem
```

---

## Monitoring & Logs

### Backend Logs

#### Railway
- Dashboard → Deployments → Logs tab

#### Heroku
```bash
heroku logs --tail --app your-app-name
```

#### AWS EC2
```bash
sudo journalctl -u quiz-api -f
# Or tail application logs
tail -f /var/log/quiz-api.log
```

### Frontend Monitoring

#### Vercel
- Dashboard → Analytics
- Dashboard → Functions (if using serverless)

#### Netlify
- Site settings → Analytics

### Error Tracking (Optional)

Add to backend:

```bash
pip install sentry-sdk
```

In `main.py`:

```python
import sentry_sdk
sentry_sdk.init("https://your-key@sentry.io/project-id")
```

### Performance Monitoring

Consider adding:
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log aggregation

---

## SSL Certificate Management

### Free Certificates with Let's Encrypt

Most platforms handle this automatically. For manual setup:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Certificate location
/etc/letsencrypt/live/your-domain.com/
```

---

## Continuous Integration/Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          # Your deployment commands
      
      - name: Deploy Frontend
        run: |
          # Your deployment commands
```

---

## Backup Strategy

### Database Backups

#### PostgreSQL Automated Backups
- Railway: Automatic daily
- AWS RDS: Automatic snapshots
- Heroku: `heroku pg:backups` (paid)

#### Manual Backup

```bash
pg_dump quiz_generator > backup.sql

# Restore
psql quiz_generator < backup.sql
```

### Application Backups

- Use Git for code version control
- Store environment configs securely
- Document custom configurations

---

## Scaling Strategies

### When to Scale

- **Database**: If queries slow down, optimize queries first
- **API**: If CPU usage >80%, add more workers
- **Frontend**: CDN caching usually sufficient

### Horizontal Scaling

Backend:
```bash
# Heroku
heroku ps:scale web=3 --app your-app-name

# Railway: Auto-scaling available
```

### Database Scaling

```sql
-- Add indexes for slow queries
CREATE INDEX idx_url ON quizzes(url);
CREATE INDEX idx_date ON quizzes(date_generated);
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
heroku logs --tail

# Test locally
python -m uvicorn backend.app.main:app

# Check database connection
python -c "from backend.app.database import engine; print(engine.url)"
```

### Frontend Blank Page

1. Check browser console (F12)
2. Verify `REACT_APP_API_URL` in build
3. Check network tab for API errors

### Database Connection Issues

```bash
# Test connection
psql -h host -U user -d quiz_generator

# Reset connection
heroku pg:restart --app your-app-name
```

### High Memory Usage

```bash
# Restart application
heroku restart --app your-app-name

# Check process
ps aux | grep python
```

### API Timeout Issues

```bash
# Increase timeout in frontend
// services/api.js
const apiClient = axios.create({
  timeout: 60000  // 60 seconds
});
```

---

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify database connection
- [ ] Check frontend loads correctly
- [ ] Test quiz generation
- [ ] Review history functionality
- [ ] Check error handling
- [ ] Monitor logs for errors
- [ ] Test with real URLs
- [ ] Verify HTTPS working
- [ ] Set up monitoring/alerts
- [ ] Document deployment URLs
- [ ] Create backup schedule
- [ ] Plan scaling strategy

---

## Support & Monitoring

### Health Check Endpoint

Add to backend (`main.py`):

```python
@app.get("/health")
def health():
    return {"status": "healthy"}
```

### Automated Monitoring

```bash
# Cron job to check health
0 */5 * * * curl https://your-api.com/health || alert
```

---

## Additional Resources

- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Heroku Docs](https://devcenter.heroku.com/)
- [AWS EC2 Docs](https://docs.aws.amazon.com/ec2/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Docs](https://docs.docker.com/)
