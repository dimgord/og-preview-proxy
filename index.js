import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Allow all origins (or configure as needed)

app.get('/og-proxy', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

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

        res.json(data);
  } catch (error) {
    console.error('[OGProxy] Error fetching:', url, error.message);
    res.status(500).json({ error: 'Failed to fetch OG data' });
  }
});

app.listen(port, () => {
  console.log(`[OGProxy] Server is running on port ${port}`);
});
