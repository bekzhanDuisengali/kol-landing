import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import fetch from 'node-fetch';
import getRawBody from 'raw-body';

const {
  TG_TOKEN,
  WEBHOOK_SECRET = 'AVIVA_WEBHOOK_SECRET',
  CHANNEL_ID,
  PORT = 8080,
} = process.env;

if (!TG_TOKEN) {
  console.error('TG_TOKEN is not set');
  process.exit(1);
}

const app = express();

// Telegram присылает JSON — берём «сырое» тело и парсим сами
app.use(async (req, _res, next) => {
  if (req.method === 'POST' && (req.headers['content-type'] || '').includes('application/json')) {
    try {
      const raw = await getRawBody(req);
      req.rawBody = raw.toString('utf8');
      req.body = JSON.parse(req.rawBody || '{}');
    } catch {
      req.body = {};
    }
  }
  next();
});
app.use(morgan('dev'));

const ROOT = path.resolve();                   // корень проекта KOL-LANDING
const STATIC_ROOT = ROOT;                      // статику отдаём прямо из корня
const AVIVA_DIR = path.join(ROOT, 'assets', 'aviva');
const VIDEOS_DIR = path.join(AVIVA_DIR, 'videos');
const VIDEOS_JSON = path.join(AVIVA_DIR, 'videos.json');

fs.mkdirSync(VIDEOS_DIR, { recursive: true });
if (!fs.existsSync(VIDEOS_JSON)) fs.writeFileSync(VIDEOS_JSON, '[]', 'utf8');

const AVIVA_RE = /\bAVIVA\b[\s#-]*?(\d+)/i;

function parseAvivaNumber(text = '') {
  const m = AVIVA_RE.exec(text);
  return m ? parseInt(m[1], 10) : null;
}

async function tgApi(method, params = {}) {
  const url = new URL(`https://api.telegram.org/bot${TG_TOKEN}/${method}`);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
  const r = await fetch(url);
  if (!r.ok) throw new Error(`TG ${method} ${r.status}`);
  return r.json();
}

async function tgGetFile(file_id) {
  const data = await tgApi('getFile', { file_id });
  const file_path = data?.result?.file_path;
  if (!file_path) throw new Error('No file_path');
  const fileUrl = `https://api.telegram.org/file/bot${TG_TOKEN}/${file_path}`;
  const resp = await fetch(fileUrl);
  if (!resp.ok) throw new Error(`Download ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  return { file_path, buf };
}

function sanitize(name) {
  return name.replace(/[^\w.\-#]/g, '_');
}

function loadList() {
  try { return JSON.parse(fs.readFileSync(VIDEOS_JSON, 'utf8')); }
  catch { return []; }
}
function saveList(items) {
  items.sort((a, b) => {
    const na = a.number ?? -1, nb = b.number ?? -1;
    if (nb !== na) return nb - na;
    return (b.posted_at || '').localeCompare(a.posted_at || '');
  });
  fs.writeFileSync(VIDEOS_JSON, JSON.stringify(items, null, 2), 'utf8');
}

// Webhook от Telegram
app.post(`/tg/${WEBHOOK_SECRET}`, async (req, res) => {
  try {
    const upd = req.body || {};
    const post = upd.channel_post || upd.edited_channel_post;
    if (!post) return res.send('ok');

    // фильтр по каналу (рекомендуется)
    if (CHANNEL_ID && String(post.chat?.id) !== String(CHANNEL_ID)) return res.send('ok');

    const caption = post.caption || post.text || '';
    const number = parseAvivaNumber(caption);
    const video = post.video;
    const doc = post.document;
    const isVideoDoc = doc && String(doc.mime_type || '').startsWith('video/');

    if (!video && !isVideoDoc) return res.send('ok');

    const file_id = (video || doc).file_id;

    const { file_path, buf } = await tgGetFile(file_id);
    const ext = path.extname(file_path) || '.mp4';
    const base = number != null ? `AVIVA_${number}` : `AVIVA_${Date.now()}`;
    const filename = sanitize(base + ext);
    const savePath = path.join(VIDEOS_DIR, filename);

    if (!fs.existsSync(savePath)) {
      fs.writeFileSync(savePath, buf);
      console.log('Saved:', filename);
    } else {
      console.log('Exists, skip:', filename);
    }

    // обновляем список
    const list = loadList();
    const localUrl = `/assets/aviva/videos/${filename}`;

    const payload = {
        title: caption.trim() || base,
        url: localUrl,
        number,
        posted_at: new Date().toISOString(),
        message_id: post.message_id,          // <— запомним id сообщения
        file_unique_id: (video || doc)?.file_unique_id || null
    };
    const idx = list.findIndex(x => x.url === localUrl);
    if (idx >= 0) list[idx] = { ...list[idx], ...payload }; else list.push(payload);
    saveList(list);

    res.send('ok');
  } catch (e) {
    console.error('Webhook error:', e);
    // Возвращаем 200, чтобы Telegram не спамил ретраями
    res.status(200).send('ok');
  }
});

// healthcheck
app.get('/healthz', (_req, res) => res.send('ok'));

// отдаём статику прямо из текущего проекта
app.use(express.static(STATIC_ROOT, { maxAge: '1h', index: 'index.html' }));

app.listen(PORT, () => console.log(`Server on :${PORT}`));