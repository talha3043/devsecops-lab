const { execFile } = require('child_process');
const express = require('express');
const config = require('./config');

function createApp() {
  const app = express();
  app.use(express.json());

  const settings = { theme: 'light', language: 'en' };

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/info', (req, res) => {
    res.json({ service: 'task-api', paymentKeyConfigured: Boolean(config.paymentApiKey) });
  });

  // Looks up a host name safely without a shell
  app.get('/resolve', (req, res) => {
    const host = String(req.query.host || '');
    if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
      return res.status(400).json({ error: 'Invalid host.' });
    }
    execFile('nslookup', [host], (error, stdout) => {
      if (error) {
        return res.status(404).json({ error: 'Host not found.' });
      }
      res.type('text/plain').send(stdout);
    });
  });

  // Adds two numbers safely without eval()
  app.get('/calc', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return res.status(400).json({ error: 'Invalid numbers.' });
    }
    res.json({ result: a + b });
  });

  // Updates only allowlisted settings safely
  app.post('/settings', (req, res) => {
    const { theme, language } = req.body || {};
    if (typeof theme === 'string') {
      settings.theme = theme;
    }
    if (typeof language === 'string') {
      settings.language = language;
    }
    res.json(settings);
  });

  return app;
}

module.exports = { createApp };
