import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';

const OUT = 'C:/Users/SAMSUNG/AppData/Local/Temp/claude/c--Users-SAMSUNG-Desktop-HackTX/a1b4bcf5-1a6e-4a3d-a30f-4c1e9a6528c5/scratchpad/screenshots';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

async function shot(name, fn) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // Inject a fake Supabase session into localStorage so auth guards pass,
  // and stub getSession / onAuthStateChange to return the fake user.
  await page.addInitScript(() => {
    const fakeSession = {
      access_token: 'fake-token',
      user: { id: 'demo-user-id', email: 'demo@example.com' },
    };
    // Supabase stores the session under this key
    localStorage.setItem(
      'sb-placeholder-auth-token',
      JSON.stringify({ currentSession: fakeSession, expiresAt: 9999999999 })
    );

    // Intercept the supabase-js auth calls before the app boots
    const _origFetch = window.fetch;
    window.fetch = async (url, ...args) => {
      // Stub the Supabase user/profile API calls
      if (typeof url === 'string' && url.includes('supabase')) {
        const body = { data: null, error: null };
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return _origFetch(url, ...args);
    };
  });

  await fn(page);
  await ctx.close();
}

// 1. Login page
await shot('01-login', async (page) => {
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/01-login.png` });
  console.log('✓ 01-login');
});

// 2. Onboarding
await shot('02-onboarding', async (page) => {
  await page.goto('http://localhost:5173/onboarding', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/02-onboarding.png` });
  console.log('✓ 02-onboarding');
});

// 3-7: We need a real profile to bypass RequireAuth fully.
// The app redirects unauthenticated users, so let's render the page
// components in isolation using a direct URL approach with mock context.
// Instead, let's show the Pages/PlaceBoard/NoteDetail screens by
// navigating to the right URL while Supabase returns empty data.

// For now take the pages that don't hard-block:
await shot('03-create-place', async (page) => {
  await page.goto('http://localhost:5173/place/new', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/03-create-place.png` });
  console.log('✓ 03-create-place');
});

await browser.close();
console.log('All screenshots done:', OUT);
