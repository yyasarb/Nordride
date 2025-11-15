# Nordride Development Workflow

## Overview
This document outlines the development workflow for Nordride web app with future mobile app compatibility.

## Branch Strategy

### Branches
- **`main`** - Production branch (live website at https://nordride.se)
- **`develop`** - Staging branch (preview at https://nordride-git-develop.vercel.app)
- **`feature/*`** - Feature branches for new features/updates

### Automatic Deployments
- **Production**: `main` branch → https://nordride.se (auto-deploy)
- **Staging**: `develop` branch → https://nordride-git-develop.vercel.app (auto-deploy)
- **Feature Previews**: `feature/*` branches → https://nordride-git-feature-name.vercel.app (auto-deploy)

---

## Daily Development Workflow

### Starting a New Feature

```bash
# 1. Switch to develop branch and pull latest changes
git checkout develop
git pull origin develop

# 2. Create a new feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# Edit files, add features, fix bugs...

# 4. Commit your changes
git add .
git commit -m "Your descriptive commit message

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 5. Push to GitHub
git push -u origin feature/your-feature-name

# 6. Vercel automatically creates a preview URL
# Check Vercel dashboard or GitHub for the preview link
# Example: https://nordride-git-feature-your-feature-name.vercel.app
```

### Testing Your Changes

1. **Preview URL**: Vercel creates a unique URL for your feature branch
2. **Test thoroughly**: Check all functionality on the preview URL
3. **Share with team**: Send preview URL to stakeholders for feedback
4. **Make adjustments**: Continue committing to the same branch

### Merging to Staging (Develop)

```bash
# 1. Switch to develop branch
git checkout develop

# 2. Pull latest changes
git pull origin develop

# 3. Merge your feature branch
git merge feature/your-feature-name

# 4. Push to staging
git push origin develop

# 5. Test on staging URL
# Visit: https://nordride-git-develop.vercel.app
```

### Deploying to Production (Main)

```bash
# 1. Switch to main branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Merge develop branch
git merge develop

# 4. Push to production
git push origin main

# 5. Live site updates automatically
# Visit: https://nordride.se
```

---

## Database Changes (Supabase)

### Making Schema Changes

```bash
# 1. Create a new migration
npx supabase migration new your_migration_name

# 2. Edit the migration file in supabase/migrations/
# Add your SQL changes

# 3. Test locally (if you have local Supabase setup)
npx supabase db reset

# 4. Apply to production when ready
npx supabase db push

# 5. Commit the migration file
git add supabase/migrations/
git commit -m "Add migration: your_migration_name"
```

### Important for Mobile Apps (Future)
- Always make **backwards-compatible** database changes
- Don't drop columns immediately (mobile users may have old app versions)
- Add new columns first, migrate data, then deprecate old columns later

---

## API Versioning (For Future Mobile Apps)

### Current Structure
```
app/api/          # Current web-only API routes
app/api/v1/       # Future: Version 1 API for mobile apps
```

### When Building Mobile Apps
1. Move current API routes to `/api/v1/`
2. Mobile apps will call: `https://nordride.se/api/v1/rides`
3. Web app can continue using `/api/rides` or migrate to `/api/v1/`

### Adding New API Versions
```typescript
// app/api/v2/rides/route.ts (new version)
export async function GET(request: Request) {
  // New improved response format
  return Response.json({
    data: [...],
    meta: { total, page, perPage }
  })
}

// Keep v1 for old mobile apps
// app/api/v1/rides/route.ts (old version)
```

---

## Environment Strategy

### Current Environments
- **Production**: `main` branch → Supabase production database
- **Staging**: `develop` branch → Supabase production database (same as production for now)
- **Preview**: `feature/*` branches → Supabase production database

### Future: Separate Staging Database
When needed, create a Supabase branch for staging:
```bash
npx supabase branches create develop
```

Then update Vercel environment variables:
- Production environment: Uses production Supabase
- Preview environments: Uses staging Supabase branch

---

## Quick Reference

### Common Commands

```bash
# Check current branch
git branch

# Switch to develop
git checkout develop

# Create new feature branch
git checkout -b feature/name

# Pull latest changes
git pull origin develop

# Push changes
git push origin branch-name

# Build and test locally
npm run build
npm run dev

# Apply database migrations
npx supabase db push
```

### URLs
- **Production**: https://nordride.se
- **Staging**: https://nordride-git-develop.vercel.app
- **Feature Preview**: https://nordride-git-feature-name.vercel.app

---

## Best Practices

1. ✅ **Always work on feature branches**, never directly on `main`
2. ✅ **Test on preview URLs** before merging to develop
3. ✅ **Test on staging (`develop`)** before merging to production (`main`)
4. ✅ **Write descriptive commit messages**
5. ✅ **Make small, focused commits** (easier to review and rollback)
6. ✅ **Run `npm run build`** locally before pushing to catch errors early
7. ✅ **Keep `develop` stable** - it's your staging environment
8. ✅ **Use migrations for all database changes** (tracked in git)

---

## Rollback Strategy

### If Something Breaks in Production

```bash
# Option 1: Quick fix on a hotfix branch
git checkout main
git checkout -b hotfix/fix-critical-bug
# Make fix...
git add .
git commit -m "Fix critical bug"
git push origin hotfix/fix-critical-bug
git checkout main
git merge hotfix/fix-critical-bug
git push origin main

# Option 2: Revert to previous commit
git checkout main
git log  # Find the last working commit hash
git revert <commit-hash>
git push origin main

# Option 3: Hard reset (use with caution!)
git checkout main
git reset --hard <last-working-commit-hash>
git push --force origin main  # Only if absolutely necessary!
```

---

## Mobile App Development (Future)

When you start building iOS/Android apps:

1. **Create separate repo** (recommended) or **add to monorepo**
2. **Point mobile apps to production API**: `https://nordride.se/api/v1/`
3. **Use environment configs** in mobile app:
   - Development: `http://localhost:3000/api/v1/`
   - Staging: `https://nordride-git-develop.vercel.app/api/v1/`
   - Production: `https://nordride.se/api/v1/`
4. **Test on Vercel preview URLs** before releasing mobile updates
5. **Use TestFlight (iOS)** and **Internal Testing (Android)** for beta testing

---

## Support

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repository**: https://github.com/yyasarb/Nordride

---

## Example: Complete Feature Development Flow

```bash
# Day 1: Start feature
git checkout develop
git pull origin develop
git checkout -b feature/improved-search
# Make changes...
git add .
git commit -m "Add improved search filters"
git push -u origin feature/improved-search
# Test on: https://nordride-git-feature-improved-search.vercel.app

# Day 2: More changes
# Make more changes...
git add .
git commit -m "Add autocomplete to search"
git push origin feature/improved-search
# Test again on preview URL

# Day 3: Ready for staging
git checkout develop
git pull origin develop
git merge feature/improved-search
git push origin develop
# Test on: https://nordride-git-develop.vercel.app

# Day 4: Ready for production
git checkout main
git pull origin main
git merge develop
git push origin main
# Live on: https://nordride.se

# Cleanup (optional)
git branch -d feature/improved-search
git push origin --delete feature/improved-search
```

---

**Last Updated**: 2025-11-15
