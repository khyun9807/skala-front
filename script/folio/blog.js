/* ─────────────────────────────────────────────────────────────
   script/folio/blog.js — blog.html 배선
   TesseraJS 블로그 기능(IndexedDB)으로 글 목록·상세·조회수·좋아요·북마크를 구동.
   글 상세는 folio 모달로 표시, 카테고리는 aur-badge(aurora)로.
   ───────────────────────────────────────────────────────────── */
import './toast.js';
import { initPage } from './page.js';
import { showToast } from '../../tessera-js/js/features/notifications.js';
import { apiClient } from '../../tessera-js/js/network/api-client.js';
import * as blog from '../../tessera-js/js/features/blog.js';
import { OBJECT_STORES } from '../../tessera-js/js/config/constants.js';
import { reseedIfStale } from './reseed.js';

initPage();

const dialog = document.getElementById('post-modal');
const CAT = { frontend: '프론트엔드', travel: '여행', backend: '백엔드', devops: 'DevOps', design: '디자인', career: '커리어', database: '데이터베이스', project: '프로젝트', game: '게임' };

async function fetchJSON(path) {
  const { data } = await apiClient.get(path, { cache: { enabled: true, ttl: 5 * 60_000 } });
  return data;
}
const fmtDate = (d) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
const excerpt = (md = '') => md.replace(/[#>*`_[\]-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 110) + '…';
const meta = (p) => `${p.author} · ${fmtDate(p.publishedAt || p.createdAt)} · 조회 ${p.viewCount ?? 0} · ♡ ${p.likeCount ?? 0}`;

/* ── 미니 마크다운 렌더러 (외부 라이브러리 금지 → 직접 구현) ──
   지원: #~#### 제목 · **굵게** · `코드` · 목록(-,1.) · > 인용 · ``` 코드블록 · | 표 |
   innerHTML을 쓰지 않고 DOM 노드로만 조립한다(안전). */
function renderInline(text, el) {
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) el.appendChild(document.createTextNode(text.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith('**')) {
      const b = document.createElement('strong'); b.textContent = tok.slice(2, -2); el.appendChild(b);
    } else {
      const c = document.createElement('code'); c.textContent = tok.slice(1, -1); el.appendChild(c);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) el.appendChild(document.createTextNode(text.slice(last)));
}

function renderMarkdown(md, root) {
  root.textContent = '';
  const lines = String(md ?? '').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith('```')) {                       // 코드블록
      i++;
      const buf = [];
      while (i < lines.length && !lines[i].startsWith('```')) { buf.push(lines[i]); i++; }
      i++;
      const pre = document.createElement('pre'); const code = document.createElement('code');
      code.textContent = buf.join('\n'); pre.appendChild(code); root.appendChild(pre); continue;
    }
    if (/^#{1,4}\s/.test(line)) {                        // 제목 (h1→h2로 한 단계 낮춤: 모달 제목이 이미 h3)
      const level = line.match(/^#+/)[0].length;
      const h = document.createElement('h' + Math.min(level + 1, 4));
      renderInline(line.replace(/^#+\s/, ''), h); root.appendChild(h); i++; continue;
    }
    if (line.startsWith('> ')) {                          // 인용
      const q = document.createElement('blockquote'); const p = document.createElement('p');
      renderInline(line.slice(2), p); q.appendChild(p); root.appendChild(q); i++; continue;
    }
    if (line.startsWith('|')) {                           // 표
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) { rows.push(lines[i]); i++; }
      const table = document.createElement('table');
      let head = true;
      rows.forEach((r) => {
        const cells = r.split('|').slice(1, -1).map((c) => c.trim());
        if (cells.every((c) => /^:?-{2,}:?$/.test(c))) { head = false; return; } // 구분선
        const tr = document.createElement('tr');
        cells.forEach((c) => { const td = document.createElement(head ? 'th' : 'td'); renderInline(c, td); tr.appendChild(td); });
        table.appendChild(tr);
        if (head) head = true;
      });
      root.appendChild(table); continue;
    }
    if (/^[-*]\s/.test(line)) {                           // 순서 없는 목록
      const ul = document.createElement('ul');
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        const li = document.createElement('li'); renderInline(lines[i].replace(/^[-*]\s/, ''), li); ul.appendChild(li); i++;
      }
      root.appendChild(ul); continue;
    }
    if (/^\d+\.\s/.test(line)) {                          // 순서 있는 목록
      const ol = document.createElement('ol');
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const li = document.createElement('li'); renderInline(lines[i].replace(/^\d+\.\s/, ''), li); ol.appendChild(li); i++;
      }
      root.appendChild(ol); continue;
    }
    const buf = [];                                       // 문단(연속 줄 합치기)
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|>\s|\||```|[-*]\s|\d+\.\s)/.test(lines[i])) { buf.push(lines[i]); i++; }
    const p = document.createElement('p'); renderInline(buf.join(' '), p); root.appendChild(p);
  }
}

/** 글 하단 이미지·영상 갤러리 (영상은 poster + preload=none) */
function renderGallery(images) {
  const g = document.getElementById('post-gallery');
  g.textContent = '';
  (images ?? []).forEach((item) => {
    const fig = document.createElement('figure');
    if (item.type === 'video') {
      const v = document.createElement('video');
      v.controls = true; v.preload = 'none'; v.playsInline = true;
      if (item.poster) v.poster = item.poster;
      const s = document.createElement('source');
      s.src = item.src; s.type = item.src.endsWith('.webm') ? 'video/webm' : 'video/mp4';
      v.appendChild(s);
      fig.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = item.src; img.alt = item.caption ?? ''; img.loading = 'lazy';
      fig.appendChild(img);
    }
    if (item.caption) { const cap = document.createElement('figcaption'); cap.textContent = item.caption; fig.appendChild(cap); }
    g.appendChild(fig);
  });
}

function renderList(posts) {
  const list = document.getElementById('blog-list');
  list.textContent = '';
  if (!posts.length) { const e = document.createElement('p'); e.style.opacity = '.5'; e.textContent = '글이 없습니다.'; list.appendChild(e); return; }
  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'folio-block folio-block--click';
    card.tabIndex = 0; card.dataset.cursor = '읽기';
    const badge = document.createElement('span'); badge.className = 'aur-badge'; badge.textContent = CAT[post.category] || post.category;
    const h = document.createElement('h3'); h.textContent = post.title;
    const m = document.createElement('span'); m.className = 'folio-block__meta'; m.textContent = meta(post);
    const p = document.createElement('p'); p.style.cssText = 'font-size:13px;opacity:.7;line-height:1.6'; p.textContent = excerpt(post.content);
    if (post.cover) {                       // 목록 카드 썸네일
      const thumb = document.createElement('img');
      thumb.className = 'blog-thumb'; thumb.src = post.cover; thumb.alt = ''; thumb.loading = 'lazy';
      card.appendChild(thumb);
    }
    card.append(badge, h, m, p);
    card.addEventListener('click', () => openPost(post.id));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') openPost(post.id); });
    list.appendChild(card);
  });
}

async function openPost(id) {
  await blog.incrementViewCount(id);
  const post = await blog.getPostById(id);
  if (!post) return;
  document.getElementById('post-cat').textContent = CAT[post.category] || post.category;
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-meta').textContent = meta(post);

  const cover = document.getElementById('post-cover');
  if (post.cover) { cover.src = post.cover; cover.alt = post.title; cover.hidden = false; }
  else { cover.hidden = true; cover.removeAttribute('src'); }

  renderMarkdown(post.content, document.getElementById('post-content'));
  renderGallery(post.images);

  const likeBtn = document.getElementById('post-like');
  likeBtn.textContent = `♡ 좋아요 ${post.likeCount ?? 0}`;
  likeBtn.onclick = async () => {
    await blog.toggleLike(id);
    const p = await blog.getPostById(id);
    likeBtn.textContent = `♥ 좋아요 ${p.likeCount ?? 0}`;
    document.getElementById('post-meta').textContent = meta(p);
  };

  const bmBtn = document.getElementById('post-bookmark');
  const syncBm = () => { bmBtn.textContent = blog.isBookmarked(id) ? '🔖 북마크됨' : '🔖 북마크'; };
  syncBm();
  bmBtn.onclick = () => {
    blog.toggleBookmark(id);
    syncBm();
    showToast(blog.isBookmarked(id) ? '북마크에 저장했습니다.' : '북마크를 해제했습니다.', { type: 'success' });
  };

  dialog.showModal();
}

dialog.querySelector('[data-modal-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

(async function init() {
  await reseedIfStale(OBJECT_STORES.BLOG_POSTS); // 시드 버전이 바뀌었으면 옛 데모 글을 비움
  await blog.seedPostsIfEmpty(() => fetchJSON('../tessera-js/data/blog-posts.json'));
  const posts = (await blog.getAllPosts())
    .filter((p) => (p.status ?? 'published') === 'published')
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
  renderList(posts);
})();
