import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ELASTIC_URL = 'https://your-cluster-url';
const BASIC_AUTH = 'Basic ' + Buffer.from('elastic:your_password').toString('base64');

app.post('/es-proxy', async (req, res) => {
  try {
    const esRes = await fetch(`${ELASTIC_URL}/${req.body.path}`, {
      method: req.body.method || 'POST',
      headers: {
        'Authorization': BASIC_AUTH,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body.body)
    });

    const data = await esRes.json();
    res.status(esRes.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ CORS proxy running at http://localhost:${port}`);
});
