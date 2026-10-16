export const pageTitles = {
  '/': '아이디헤어 | id HAIR',
  '/en': 'id HAIR | 아이디헤어',
  '/about': 'ABOUT id HAIR | 아이디헤어',
  '/academy': 'id ACADEMY | 아이디헤어',
  '/careers': 'CAREERS | 아이디헤어',
  '/salon': 'SALON | 아이디헤어',
  '/magazine': 'id MAGAZINE | 아이디헤어',
  '/magazine/our-picks': 'id MAGAZINE | 아이디헤어',
  '/magazine/id-news': 'id NEWS | 아이디헤어',
  '/magazine/id-event': 'id EVENT | 아이디헤어',
  '/magazine/id-family': 'id FAMILY | 아이디헤어',
  '/magazine/id-gallery': 'id GALLERY | 아이디헤어',
  '/magazine/id-play': 'id PLAY | 아이디헤어',
};

Object.entries(pageTitles).forEach(([path, title]) => {
  if (path !== '/' && !path.startsWith('/en')) pageTitles['/en' + path] = title;
});

export const defaultPageMetadata = {
  description: '트렌드를 이끄는 프리미엄 헤어 살롱, id HAIR',
  siteName: '아이디헤어',
  language: 'ko',
};

export const localizedPageMetadata = {
  '/en/careers': {
    title: 'CAREERS | id HAIR',
    description: 'Grow with id HAIR. Explore our roles, training opportunities, hiring process and recruitment FAQs.',
    siteName: 'id HAIR',
    language: 'en',
  },
  '/en/academy': {
    title: 'id ACADEMY | id HAIR',
    description: 'Discover id HAIR Academy’s professional hair education, hands-on curriculum, expert instructors and student stories.',
    siteName: 'id HAIR',
    language: 'en',
  },
  '/en/about': {
    title: 'ABOUT id HAIR | id HAIR',
    description: 'A trendsetting premium hair salon, id HAIR',
    siteName: 'id HAIR',
    language: 'en',
  },
};

Object.entries(localizedPageMetadata).forEach(([path, metadata]) => {
  pageTitles[path] = metadata.title;
});

export function getPageMetadata(pathname) {
  return localizedPageMetadata[pathname.replace(/\/$/, '') || '/'] || null;
}

export const notFoundTitles = {
  ko: '페이지를 찾을 수 없습니다 | 아이디헤어',
  en: 'Page not found | 아이디헤어',
};

export function getPageTitle(pathname) {
  const localizedMetadata = getPageMetadata(pathname);
  if (localizedMetadata) return localizedMetadata.title;
  const path = pathname.replace(/^\/en(?=\/|$)/, '').replace(/\/$/, '') || '/';
  return pageTitles[path] ||
    (path.startsWith('/magazine/') ? pageTitles[path.split('/').slice(0, 3).join('/')] || 'id MAGAZINE | 아이디헤어' : '아이디헤어');
}
