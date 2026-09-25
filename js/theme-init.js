'use strict';

// Applied synchronously before styles or body content can paint.
(() => {
  let theme = 'light';
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch { /* Storage is optional. */ }
  document.documentElement.dataset.theme = theme;
})();
