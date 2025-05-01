import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send('👋 Puppeteer OG Preview Proxy is running!');
});

app.get('/og-proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    console.log('[PuppeteerProxy] Launching browser...');
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const metadata = await page.evaluate(() => {
      const getMeta = (prop) =>
        document.querySelector(`meta[property='og:${prop}']`)?.content ||
        document.querySelector(`meta[name='og:${prop}']`)?.content || '';

      return {
        title: getMeta('title') || document.title,
        description: getMeta('description'),
        image: getMeta('image'),
        url: getMeta('url') || window.location.href
      };
    });

    await browser.close();
    console.log('[PuppeteerProxy] Extracted metadata:', metadata);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(metadata);

  } catch (err) {
    console.error('[PuppeteerProxy] Error:', err.message);
    res.status(500).json({ error: 'Puppeteer error', message: err.message });
  }
});

app.listen(port, () => {
  console.log(`[PuppeteerProxy] Server is running on port ${port}`);
});
