import { useEffect } from 'react';
import type { AppConfig } from '../types';

export function useAnalytics(config: AppConfig) {
  useEffect(() => {
    // Google Analytics Injection
    if (config.gaId && /^[a-zA-Z0-9-]+$/.test(config.gaId)) {
      if (!document.getElementById('ga-script')) {
        const script = document.createElement('script');
        script.id = 'ga-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.gaId}`;
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'ga-inline';
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${config.gaId}');
        `;
        document.head.appendChild(inlineScript);
      }
    }

    // Umami Analytics Injection
    if (config.umamiId && /^[a-zA-Z0-9-]+$/.test(config.umamiId)) {
      if (!document.getElementById('umami-script')) {
        const script = document.createElement('script');
        script.id = 'umami-script';
        script.async = true;
        script.defer = true;
        script.dataset.websiteId = config.umamiId;

        // Default to Umami Cloud
        let srcUrl = 'https://cloud.umami.is/script.js';
        
        // Evaluate self-hosted URL override with strict Regex
        // Allows http/https, domain or IP, optional port, and optional path
        if (config.umamiUrl) {
          const urlRegex = /^https?:\/\/[a-zA-Z0-9.-]+(:\d{1,5})?(\/.*)?$/;
          if (urlRegex.test(config.umamiUrl)) {
            srcUrl = config.umamiUrl;
          } else {
            console.warn('Invalid Umami URL provided. Falling back to default cloud URL to prevent injection.');
          }
        }
        
        script.src = srcUrl;
        document.head.appendChild(script);
      }
    }
  }, [config.gaId, config.umamiId, config.umamiUrl]);
}