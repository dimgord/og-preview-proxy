import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.send('👋 OG Preview Proxy is running!');
});

app.get('/og-proxy', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    console.warn('[OGProxy] Missing "url" query param');
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    console.log(`[OGProxy] Fetching: ${url}`);

    const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://google.com'
        },
      timeout: 7000
    });

    if (response.status >= 400) {
      console.error(`[OGProxy] Target returned HTTP ${response.status}`);
      return res.status(502).json({ error: `Bad response from target: ${response.status}` });
    }

    const html = response.data;
    const $ = cheerio.load(html);

    const getMeta = (name) =>
      $(`meta[property='og:${name}']`).attr('content') ||
      $(`meta[name='og:${name}']`).attr('content') ||
      '';

    const data = {
      title: getMeta('title') || $('title').first().text(),
      description: getMeta('description'),
      image: getMeta('image'),
      url: getMeta('url') || url
    };

    console.log('[OGProxy] Metadata extracted:', data);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (error) {
    console.error('[OGProxy] Error fetching:', url);
    console.error('Details:', error.message, error.code || '');
    res.status(500).json({ error: 'Failed to fetch OG data', message: error.message });
  }
});

app.listen(port, () => {
  console.log(`[OGProxy] Server is running on port ${port}`);
});
