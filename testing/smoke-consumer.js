// Automated smoke test for the consumer app, driven headlessly via Playwright against the
// Expo web build. Catches the class of bug that manual APK testing kept missing: layout
// collapses (text wrapping character-by-character because a container's width resolved to
// near-zero) that render fine in a quick glance but break real content. Run with:
//   node testing/smoke-consumer.js
// from the platform/ directory. Exits non-zero and prints a report on any failure.

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8090;
const APP_DIR = path.join(__dirname, '..', 'apps', 'consumer');
const OUT_DIR = path.join(__dirname, 'output');
const BASE_URL = `http://localhost:${PORT}`;

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
  console.log(condition ? `  ok  - ${message}` : `  FAIL - ${message}`);
}

// A fixed-height card whose content is actually taller than that height renders fine on web
// (CSS overflow defaults to visible, so the excess just spills below the card) but gets
// silently clipped on native Android (ScrollView clips both axes by default there) — the exact
// bug that got the hero banner's CTA button cut off on a real device while looking fine here.
// Compare declared height vs actual content extent so this class of bug is still catchable
// from a web-only test.
async function assertContentFitsDeclaredHeight(page, { markerText, declaredHeight, tolerance = 4 }) {
  const overflow = await page.evaluate(({ markerText, declaredHeight }) => {
    const all = Array.from(document.querySelectorAll('div'));
    for (const d of all) {
      if (d.children.length === 0 && d.textContent === markerText) {
        // Walk up to the nearest ancestor whose own rendered height matches the declared
        // fixed height of the slide wrapper (BannerCarousel sets this via inline style).
        let anc = d.parentElement;
        for (let i = 0; i < 8 && anc; i++) {
          const r = anc.getBoundingClientRect();
          if (Math.abs(r.height - declaredHeight) < 2) {
            // Found the slide wrapper. Now find the deepest-last content element inside it
            // and see how far past the wrapper's own bottom edge it extends.
            const inner = Array.from(anc.querySelectorAll('*'));
            let maxBottom = r.top;
            for (const el of inner) {
              const ir = el.getBoundingClientRect();
              if (ir.width > 0 && ir.height > 0) maxBottom = Math.max(maxBottom, ir.bottom);
            }
            return { wrapperBottom: r.bottom, contentBottom: maxBottom, overflowPx: maxBottom - r.bottom };
          }
          anc = anc.parentElement;
        }
        return { notFound: 'wrapper' };
      }
    }
    return { notFound: 'marker' };
  }, { markerText, declaredHeight });

  if (overflow.notFound) {
    failures.push(`could not measure slide containing "${markerText}" (${overflow.notFound} not found)`);
    console.log(`  FAIL - could not measure slide containing "${markerText}"`);
    return;
  }
  const healthy = overflow.overflowPx <= tolerance;
  check(healthy, `slide content fits its declared height (content overflows by ${Math.round(overflow.overflowPx)}px — this is invisible on web but gets clipped on native Android)`);
}

// The exact bug this guards against: a flex container collapsing to ~0 width makes text wrap
// to one character per line. A healthy short label never renders taller than ~2 lines, so a
// element that's short in width and mp taller than expected — is nearly always this collapse.
async function assertTextHealthy(page, text, { minWidth = 40 } = {}) {
  const rect = await page.evaluate((needle) => {
    const all = Array.from(document.querySelectorAll('div'));
    for (const d of all) {
      if (d.children.length === 0 && d.textContent === needle) {
        const r = d.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) return { w: r.width, h: r.height };
      }
    }
    return null;
  }, text);
  if (!rect) {
    failures.push(`text "${text}" not found on screen at all`);
    console.log(`  FAIL - "${text}" not found`);
    return;
  }
  const healthy = rect.w >= minWidth;
  check(healthy, `"${text}" renders at a healthy width (got ${Math.round(rect.w)}px, want >=${minWidth}px)`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`Starting Expo web server on port ${PORT}...`);
  const server = spawn('npx', ['expo', 'start', '--web', '--port', String(PORT), '-c'], {
    cwd: APP_DIR,
    shell: true,
    stdio: 'ignore',
  });

  const cleanup = () => {
    try { process.kill(-server.pid); } catch {}
    try { server.kill(); } catch {}
  };
  process.on('exit', cleanup);

  try {
    await waitForServer(BASE_URL, 120000);

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    console.log('\n[1/5] Login flow');
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.locator('input[placeholder="98765 43210"]').fill('9876543210');
    await page.getByText('Continue', { exact: true }).click();
    await page.waitForTimeout(2000);
    await page.locator('input[placeholder="••••••"]').fill('1234');
    await page.getByText('Verify & Continue', { exact: true }).click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(OUT_DIR, '1-home.png') });
    check(await page.getByText('Daily Offers').count() > 0, 'Home screen reached (Daily Offers visible)');
    await assertContentFitsDeclaredHeight(page, { markerText: '4.9 · 12k+ orders', declaredHeight: 310 });

    console.log('\n[2/5] Categories — All Products list');
    await page.getByRole('tab', { name: 'Categories' }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, '2-categories-all.png') });
    await assertTextHealthy(page, 'Fresh Strawberry');
    await assertTextHealthy(page, '250g Pack');
    await assertTextHealthy(page, 'Farm Tomato');

    console.log('\n[3/5] Categories — filtered by Vegetables');
    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('div'));
      for (const d of all) {
        if (d.children.length === 0 && d.textContent === 'Vegetables') {
          const r = d.getBoundingClientRect();
          if (r.left < 100 && r.width > 0) { d.click(); return true; }
        }
      }
      return false;
    });
    check(clicked, 'Vegetables sidebar item found and clicked');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '3-categories-vegetables.png') });
    await assertTextHealthy(page, 'Farm Tomato');
    await assertTextHealthy(page, 'Sweet Carrot');

    console.log('\n[4/5] Product detail + add to cart');
    await page.getByText('Farm Tomato', { exact: true }).first().click({ force: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '4-product-detail.png') });
    check(await page.getByText('Highlights').count() > 0, 'Product detail screen reached');
    await page.getByText('+', { exact: true }).last().click({ force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT_DIR, '4b-after-add.png') });

    console.log('\n[5/5] Cart + checkout');
    // Product detail is a stack screen pushed over the tab navigator (real header + back
    // button, not URL-routed), so the tab bar is hidden here — use the header back button
    // rather than browser history, which isn't wired up to this app's navigation.
    // react-navigation's native-stack header back link is rendered as <a role="link"
    // aria-label="<PreviousRouteName>, back">, not a generic "Go back" label.
    const backBtn = page.locator('a[role="link"][aria-label$=", back"]').first();
    if (await backBtn.count()) {
      await backBtn.click();
    } else {
      check(false, 'header back button found (fell back to full reload, which resets in-memory demo state)');
      await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(4000);
    }
    await page.waitForTimeout(1500);
    await page.getByRole('tab', { name: 'Cart' }).click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT_DIR, '5-cart.png') });
    check(await page.getByText('Your cart is empty', { exact: false }).count() === 0, 'cart is not empty after adding an item');
    check(await page.getByText('Proceed to Checkout', { exact: false }).count() > 0, 'checkout button visible in cart');

    check(consoleErrors.length === 0, `no uncaught page errors (${consoleErrors.length} found)`);
    if (consoleErrors.length) console.log(consoleErrors.map((e) => `    - ${e}`).join('\n'));

    await browser.close();
  } finally {
    cleanup();
  }

  console.log('\n' + '='.repeat(50));
  if (failures.length === 0) {
    console.log('ALL CHECKS PASSED');
    process.exit(0);
  } else {
    console.log(`${failures.length} CHECK(S) FAILED:`);
    failures.forEach((f) => console.log(`  - ${f}`));
    console.log(`Screenshots saved to ${OUT_DIR}`);
    process.exit(1);
  }
}

function waitForServer(url, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const http = require('http');
      http.get(url, (res) => { res.resume(); resolve(); })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) reject(new Error('server did not start in time'));
          else setTimeout(attempt, 2000);
        });
    };
    attempt();
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
