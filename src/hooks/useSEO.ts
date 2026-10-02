import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

const DEFAULT_TITLE = 'Akshit Joshi (Akshit) — AI/ML Engineer | AI & Computer Vision Engineer';
const DEFAULT_DESC = 'Akshit Joshi (Akshit) is a leading AI/ML Engineer and Artificial Intelligence developer specializing in computer vision, LLMs, VLMs, and production AI systems.';
const DEFAULT_KEYWORDS = 'Akshit, Akshit Joshi, Joshi, Joshi Akshit, AI Engineer, AI/ML Engineer, AI, Artificial Intelligence, Machine Learning Engineer, Computer Vision, Deep Learning, ONNX, CUDA, LLM, VLM, Portfolio';
const DEFAULT_CANONICAL = 'https://akshitjoshi.com';

export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl = DEFAULT_CANONICAL,
  ogImage = 'https://akshitjoshi.com/images/portrait-akshit.jpg',
}: SEOProps = {}) {
  useEffect(() => {
    // Update Title
    document.title = title;

    // Helper to update or create meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', name);
        } else {
          el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:image', ogImage, true);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
  }, [title, description, keywords, canonicalUrl, ogImage]);
}
