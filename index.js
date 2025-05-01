import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const app = express();
const port = process.env.PORT || 3000;

app.get('/og-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url');

  try {
        const response = await axios.get(url, {
           headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
           },
           timeout: 7000
        });
    response.setHeader('Access-Control-Allow-Origin', '*');
    const $ = cheerio.load(response.data);

    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDescription = $('meta[property="og:description"]').attr('content') || '';
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const ogUrl = $('meta[property="og:url"]').attr('content') || url;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
      url: ogUrl,
    });
  } catch (error) {
    console.error('[OGProxy] Error fetching:', url, error.message);
    res.status(500).send('Error fetching or parsing OG data');
  }
});

app.get('/', (req, res) => {
  res.send('OG Preview Server is running');
});

app.listen(port, () => {
  console.log(`OG Proxy running at http://localhost:${port}`);
});

