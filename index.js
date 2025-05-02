import express from 'express';
import puppeteer from 'puppeteer-core';
const app = express();

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/og-proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/local/bin/chromium',
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
    //await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const metadata = await page.evaluate(() => {
      const get = (p) =>
        document.querySelector(`meta[property='og:${p}']`)?.content ||
        document.querySelector(`meta[name='og:${p}']`)?.content || '';
      return {
        title: get('title') || document.title,
        description: get('description'),
        image: get('image'),
        url: get('url') || window.location.href,
      };
    });

    await browser.close();
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: 'Puppeteer error', message: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[OGProxy] Listening on port ${port}`);
});

