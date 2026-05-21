const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔒 Headers للحماية
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
  });
});

// 🔧 function لتنقية HTML (بشكل خفيف)
function sanitizeHtml(html) {

  // حذف scripts كاملين
  html = html.replace(
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    ''
  );

  // حذف iframes
  html = html.replace(
    /<iframe><\/iframe>/gi,
    ''
  );

  // حذف popup functions
  html = html.replace(
    /window\.open/gi,
    ''
  );

  // حذف redirects
  html = html.replace(
    /location\.href/gi,
    ''
  );

  // حذف onclick
  html = html.replace(
    /onclick=/gi,
    'data-click='
  );

  // حذف target blank
  html = html.replace(
    /target="_blank"/gi,
    ''
  );

  // حذف domains مشهورة ديال ads
  const blocked = [
    'doubleclick.net',
    'googlesyndication.com',
    'adsterra',
    'popads',
    'onclickads',
    'exoclick'
  ];

  blocked.forEach(domain => {

    const regex = new RegExp(domain, 'gi');

    html = html.replace(regex, '');

  });

  return html;
}

async function fetchEmbed(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  let html = await response.text();

  // 🔧 sanitize بسيط
  html = sanitizeHtml(html);

  return html;
}

app.get('/embed/movie/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const html = await fetchEmbed(
      `https://vidsrc.to/embed/movie/${id}`
    );

    res.send(html);
  } catch (err) {
    res.status(500).send('Error fetching movie');
  }
});

app.get('/embed/tv/:id/:season/:episode', async (req, res) => {
  try {
    const { id, season, episode } = req.params;

    const html = await fetchEmbed(
      `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
    );

    res.send(html);
  } catch (err) {
    res.status(500).send('Error fetching TV episode');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
