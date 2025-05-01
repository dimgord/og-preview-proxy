# og-preview-proxy

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A simple Node.js server to fetch OpenGraph metadata (title, description, image) from any public webpage and return it as JSON.  
Designed for use with client-side preview renderers in forums, blogs, and messaging platforms.

## 🚀 Features

- Extracts `og:title`, `og:description`, `og:image`, and `og:url`
- Returns metadata as JSON
- CORS-enabled for frontend integrations
- Lightweight and easy to deploy

## 📦 Installation

```bash
git clone https://github.com/yourusername/og-preview-proxy.git
cd og-preview-proxy
npm install
npm start
```

## 🔌 API

### GET `/og-proxy?url=<target_url>`

Returns Open Graph metadata for the given URL.

#### Example:
```bash
curl "http://localhost:3000/og-proxy?url=https://example.com"
```

#### Response:
```json
{
  "title": "Example Domain",
  "description": "This domain is for use in illustrative examples...",
  "image": "https://example.com/image.jpg",
  "url": "https://example.com"
}
```

## 📝 License

This project is licensed under the [MIT License](LICENSE).


## ☁️ Deploying on Vercel

This project can be deployed instantly on [Vercel](https://vercel.com/):

1. Fork or clone this repository
2. Push it to your GitHub account
3. Go to [vercel.com](https://vercel.com), create an account if needed
4. Click **“New Project”**, import the GitHub repo
5. Vercel will auto-detect the `vercel.json` and deploy the API

After deployment, your endpoint will look like:

```
https://your-vercel-app-name.vercel.app/og-proxy?url=https://example.com
```

## 🧩 Example: Client Usage Snippet (jQuery)

```javascript
$(function () {
  const links = $('a[href^="http"]');

  links.each(function () {
    const url = $(this).attr('href');

    $.getJSON(`https://your-vercel-app-name.vercel.app/og-proxy?url=${encodeURIComponent(url)}`, function (data) {
      if (!data.title) return;

      const preview = `
        <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;">
          <a href="${data.url}" target="_blank" style="font-weight: bold; font-size: 18px;">${data.title}</a>
          <p>${data.description}</p>
          ${data.image ? `<img src="${data.image}" style="max-width: 100%; height: auto;">` : ''}
        </div>
      `;

      $(links).after(preview);
    });
  });
});
```

Make sure to replace `your-vercel-app-name` with your actual deployment name.
