# GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. **Go to GitHub** and create a new repository:
   - Visit: https://github.com/new
   - Repository name: `youtube-channel` (or your preferred name)
   - Description: "Next.js app with Neon Postgres database"
   - Visibility: Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Copy the repository URL** that GitHub shows you (it will look like):
   ```
   https://github.com/YOUR_USERNAME/youtube-channel.git
   ```

## Step 2: Push Your Code to GitHub

After creating the repository, run these commands in your terminal:

```bash
# Add the GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/youtube-channel.git

# Push your code to GitHub
git push -u origin main
```

If you get an authentication error, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys

### Option A: Use Personal Access Token (Easier)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "YouTube Channel App"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token (you won't see it again!)
7. When pushing, use the token as your password

### Option B: Use SSH (More Secure)

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# Go to https://github.com/settings/keys
# Click "New SSH key"
# Paste your public key

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/youtube-channel.git
git push -u origin main
```

## Step 3: Connect to Vercel

### Option A: Import from GitHub (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Log in if needed

2. **Import Git Repository**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - You may need to authorize Vercel to access your GitHub account
   - Select your `youtube-channel` repository
   - Click "Import"

3. **Configure Project**
   - Project Name: `youtube-channel` (or your preference)
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
   - Click "Deploy"

4. **Wait for Deployment**
   - Vercel will build and deploy your app
   - You'll get a production URL like: `youtube-channel.vercel.app`

### Option B: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to GitHub repository and deploy
vercel --prod

# Follow the prompts to link your GitHub repo
```

## Step 4: Add Neon Integration

After your app is deployed on Vercel:

1. **Go to your Vercel project dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Click on your `youtube-channel` project

2. **Add Neon Integration**
   - Click "Integrations" tab
   - Search for "Neon"
   - Click "Add Integration"
   - Click "Continue" to authorize

3. **Configure Neon Database**
   - Choose "Create a new Neon database"
   - Database name: `youtube-channel-db`
   - Region: Choose closest to your users
   - Select your Vercel project
   - Click "Create Database"

4. **Verify Environment Variables**
   - Go to Settings → Environment Variables
   - You should see `DATABASE_URL` automatically added
   - This is available in Production, Preview, and Development

## Step 5: Set Up Local Development

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Pull environment variables from Vercel
vercel env pull .env.local

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

## Step 6: Test Everything

1. **Local test:**
   ```
   http://localhost:3000/api/test-db
   ```

2. **Production test:**
   ```
   https://your-project.vercel.app/api/test-db
   ```

You should see:
```json
{
  "success": true,
  "message": "Database connection successful",
  "userCount": 0,
  "users": []
}
```

## Automatic Deployments

Now that GitHub is connected to Vercel:

- **Every push to `main`** → Deploys to Production
- **Every push to other branches** → Creates Preview Deployment
- **Every Pull Request** → Creates Preview Deployment

### Deploy a change:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push

# Vercel will automatically deploy!
```

## Troubleshooting

### Can't push to GitHub
- Check your authentication (token or SSH key)
- Make sure you have write access to the repository

### Vercel can't find repository
- Make sure you've authorized Vercel to access your GitHub account
- Check that the repository is not in an organization that needs approval

### Database connection fails
- Make sure you've added the Neon integration
- Pull environment variables: `vercel env pull .env.local`
- Check that `DATABASE_URL` exists in Vercel settings

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code to GitHub
3. ✅ Deploy to Vercel
4. ✅ Add Neon integration
5. ✅ Pull environment variables
6. ✅ Run migrations
7. ✅ Test your app
8. 🚀 Start building!

---

**Need help?** Check the main README.md and DEPLOYMENT.md files for more details.
