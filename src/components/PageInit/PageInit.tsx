'use client';

import { useEffect } from 'react';

interface Props {
  page: 'home' | 'detail' | 'authors' | 'author';
  cover?: 'overlay';
}

function PageInit({ page, cover }: Props) {
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute('data-page', page);
    if (cover) r.setAttribute('data-cover', cover);
    else r.removeAttribute('data-cover');
  }, [page, cover]);
  return null;
}

export default PageInit;
