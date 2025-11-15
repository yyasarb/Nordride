# 🚀 Quick Start Guide

## Your Setup is Ready!

You now have a professional development workflow with:
- ✅ **Production site**: https://nordride.se (main branch)
- ✅ **Staging site**: https://nordride-git-develop.vercel.app (develop branch)
- ✅ **Feature previews**: Auto-created for every feature branch

---

## How to Work on Updates (Without Affecting Live Site)

### Option 1: Work on Develop Branch (Recommended for Quick Updates)

```bash
# 1. Switch to develop branch
git checkout develop

# 2. Make your changes in Claude Code or your editor
# Edit files, test locally...

# 3. Commit and push
git add .
git commit -m "Your update description"
git push origin develop

# 4. Test on staging URL
# Visit: https://nordride-git-develop.vercel.app
# ✅ Live site is NOT affected

# 5. When ready to publish to live site
git checkout main
git merge develop
git push origin main
# ✅ Now live on https://nordride.se
```

### Option 2: Work on Feature Branches (Recommended for Big Features)

```bash
# 1. Create a feature branch from develop
git checkout develop
git checkout -b feature/new-payment-system

# 2. Make your changes
# Edit files, test locally...

# 3. Commit and push
git add .
git commit -m "Add new payment system"
git push -u origin feature/new-payment-system

# 4. Test on feature preview URL
# Vercel creates: https://nordride-git-feature-new-payment-system.vercel.app
# ✅ Live site is NOT affected
# ✅ Staging is NOT affected

# 5. When ready, merge to staging
git checkout develop
git merge feature/new-payment-system
git push origin develop
# Test on: https://nordride-git-develop.vercel.app

# 6. When ready, publish to production
git checkout main
git merge develop
git push origin main
# ✅ Now live on https://nordride.se
```

---

## Daily Workflow Examples

### Making a Small Update (e.g., fixing text, updating styles)

```bash
git checkout develop
# Make changes...
git add .
git commit -m "Fix typo on homepage"
git push origin develop
# Test on staging, then merge to main when ready
```

### Building a New Feature (e.g., adding referral program)

```bash
git checkout develop
git checkout -b feature/referral-program
# Build the feature...
git add .
git commit -m "Add referral program"
git push -u origin feature/referral-program
# Get preview URL, test, get feedback
# When ready, merge to develop, then to main
```

---

## Important URLs

- **Production (Live)**: https://nordride.se
- **Staging (Testing)**: https://nordride-git-develop.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/yyasarb/Nordride
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## Current Branch Structure

```
main (production)
└── develop (staging)
    └── feature/* (your work-in-progress features)
```

---

## What Happens Automatically

1. **Push to `main`** → Live site updates at https://nordride.se
2. **Push to `develop`** → Staging site updates at https://nordride-git-develop.vercel.app
3. **Push to `feature/*`** → Vercel creates unique preview URL
4. **Database migrations** → Run `npx supabase db push` to apply

---

## See Full Documentation

Read `DEVELOPMENT_WORKFLOW.md` for complete details, best practices, and advanced workflows.

---

**You're all set!** Your live website will stay stable while you work on updates in the `develop` branch. 🎉
