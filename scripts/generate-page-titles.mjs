import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { getPageMetadata, pageTitles } from '../src/data/pageTitles.js';

const dist = new URL('../dist/', import.meta.url);
const template = await readFile(new URL('index.html', dist), 'utf8');

// 회사 정보·연관 채널 구조화 데이터는 메인 페이지에만 둔다 (네이버 가이드: 루트 페이지에 기입)
const stripHomeOnly = (html) => html
  .replace(/\s*<!--[^>]*구조화 데이터[^>]*-->/, '')
  .replace(/\s*<script type="application\/ld\+json" data-page="home">[\s\S]*?<\/script>/g, '');

for (const [path, title] of Object.entries(pageTitles)) {
  if (path === '/') continue;
  const directory = new URL(`${path.slice(1)}/`, dist);
  await mkdir(directory, { recursive: true });
  let html = stripHomeOnly(template)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*("\s*\/?>)/, `$1${title}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, `$1https://www.idhair.com${path}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, `$1https://www.idhair.com${path}$2`);
  const metadata = getPageMetadata(path);
  if (metadata) {
    html = html
      .replace(/(<html\s+lang=")[^"]*(")/, `$1${metadata.language}$2`)
      .replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${metadata.description}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*("\s*\/?>)/, `$1${metadata.description}$2`)
      .replace(/(<meta property="og:site_name" content=")[^"]*("\s*\/?>)/, `$1${metadata.siteName}$2`);
  }
  await writeFile(new URL('index.html', directory), html);
}

// 매거진 글 등 목록에 없는 주소가 받는 HTML (vercel.json 마지막 rewrite).
// 메인 페이지의 canonical 이 붙으면 글 페이지가 메인의 중복으로 처리되므로 뺀다.
const fallback = stripHomeOnly(template)
  .replace(/\s*<link rel="canonical" href="[^"]*"\s*\/?>/, '');
await writeFile(new URL('app.html', dist), fallback);

console.log('Generated page HTML with header-based titles.');
