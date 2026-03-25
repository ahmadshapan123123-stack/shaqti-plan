import { useEffect } from 'react';

export const useForceRtl = () => {
  useEffect(() => {
    const html = document.documentElement;
    const currentDir = html.getAttribute('dir');
    const currentLang = html.getAttribute('lang');

    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');

    return () => {
      if (currentDir) {
        html.setAttribute('dir', currentDir);
      } else {
        html.removeAttribute('dir');
      }

      if (currentLang) {
        html.setAttribute('lang', currentLang);
      } else {
        html.removeAttribute('lang');
      }
    };
  }, []);
};
