import express from 'express';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const app = express();

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (_, res) => {
  res.send('✅ Puppeteer OG Preview Proxy running');
});

app.get('/og-proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const executablePath = await chromium.executablePath || '/usr/bin/chromium-browser';
    console.log('[chromium.executablePath: ' + executablePath + ' ]');

const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
});
    //const browser = await puppeteer.launch({
      //args: chromium.args,
      //executablePath,
      //headless: chromium.headless,
    //});

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const metadata = await page.evaluate(() => {
      const get = (p) =>
        document.querySelector(`meta[property='og:${p}']`)?.content ||
        document.querySelector(`meta[name='og:${p}']`)?.content || '';
      return {
        title: get('title') || document.title,
        description: get('description'),
        image: get('image'),
        url: get('url') || location.href,
      };
    });

    await browser.close();
    res.json(metadata);
  } catch (e) {
    console.error('[PuppeteerProxy] Error:', e.message);
    res.status(500).json({ error: 'Puppeteer error', message: e.message });
  }
});

export default app;

