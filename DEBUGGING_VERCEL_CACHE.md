# 🔍 CRITICAL DEBUGGING INFORMATION

## Current Situation

**Problem:** Vercel logs still show `imagen-3.0-generate-002` and `:predict` errors
**Expected:** Should show `imagen-4.0-generate-001` and `:generateContent`

## Files Confirmed Correct

### ✅ `/src/app/api/generate/scenario-image/route.ts`
- Line 71: `imagen-4.0-generate-001:generateContent` ✅
- Line 127: `generatedBy: 'imagen-4'` ✅
- Has version constant: `API_VERSION = '2.0-imagen4'` ✅
- Has version logging on line 22 ✅

### ✅ Dashboard (`/src/app/dashboard/page.tsx`)
- Line 135: Calls `/api/generate/scenario-image` ✅ (correct endpoint)

### ⚠️ `/src/app/api/update-image/route.ts`
- Line 14: Still has `generatedBy: 'imagen-3'`
- **BUT** this endpoint does NOT call the Imagen API
- It only updates the database
- It's not being called from anywhere

## Git Status

```
Latest commit: 519a69c - "fix: Force function rebuild with version constant - IMAGEN 4"
Previous commits:
- 96b7f35 - debug: Add version check endpoint
- 932ecc2 - docs: Add deployment troubleshooting guides
- d740341 - fix: Use imagen-4.0-generate-001 instead of imagen-3
```

## What to Check in Vercel

### 1. Deployment Status
- Go to Vercel Dashboard → Deployments
- Confirm latest deployment shows commit `519a69c` or later
- Check deployment status (should be "Ready")

### 2. Function Logs - CRITICAL CHECK
When you generate an image, the logs should show:

**Expected (NEW code):**
```
🎨 Generating image for scenario X...
📌 API Version: 2.0-imagen4          ← KEY INDICATOR
🎨 Calling Imagen API...
```

**If you see (OLD code):**
```
🎨 Generating image for scenario X...
🎨 Calling Imagen API...              ← Missing version line
```

### 3. Check Build Logs
- Click on the deployment
- Look at the build logs
- Search for "scenario-image" to see if the file was built

### 4. Function Source Code (Advanced)
- In Vercel, go to deployment → Functions tab
- Find `/api/generate/scenario-image`
- Some Vercel plans allow viewing the deployed function source
- Check if it matches our local code

## Possible Causes

### A. Vercel Function Cache (Most Likely)
- Vercel is caching the compiled function
- Even though source is updated, the runtime is cached
- **Solution:** Need to clear Vercel's function cache

### B. Wrong Branch Deployed
- Check Vercel Settings → Git
- Ensure "Production Branch" is set to `main`
- Ensure no other branches are being deployed

### C. Build Failed Silently
- Check build logs for errors
- TypeScript errors might prevent rebuild
- **Solution:** Look for red errors in build logs

### D. Multiple Deployments
- Check if there are multiple active deployments
- Old deployment might still be serving traffic
- **Solution:** Cancel old deployments

## Immediate Actions

### Action 1: Check Version Endpoint
Visit: `https://your-site.vercel.app/api/version-check`

Should return:
```json
{
  "message": "Code version check",
  "modelName": "imagen-4.0-generate-001",
  "endpoint": "generateContent",
  "timestamp": "...",
  "commitHash": "932ecc2"
}
```

### Action 2: Manual Redeploy
1. Go to Vercel Dashboard
2. Deployments → Latest deployment
3. Click ⋯ (three dots)
4. Click "Redeploy"
5. **IMPORTANT:** Check "Use existing Build Cache" - UNCHECK THIS
6. Click "Redeploy"

### Action 3: Check Environment Variables
Ensure `GEMINI_API_KEY` is set correctly in Vercel (the NEW key you created)

## Questions to Answer

1. **What does `/api/version-check` return?**
2. **Do you see `📌 API Version: 2.0-imagen4` in the logs?**
3. **What commit hash does Vercel show for the latest deployment?**
4. **Are there any build errors in the deployment logs?**

## Next Steps Based on Answers

**If version-check shows old data:**
→ Vercel is definitely caching, need to force rebuild

**If version-check shows new data but image generation fails:**
→ Different issue, possibly with Imagen 4 API itself

**If logs don't show version line:**
→ Old code is still running, cache issue confirmed

---

**Please check these items and let me know what you find!**
