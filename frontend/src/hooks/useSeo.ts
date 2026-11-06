import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  canonicalPath?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const SITE_NAME = 'ACES Global Services';

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Gestion centralisée des métadonnées SEO côté client :
 * titre, description, Open Graph, Twitter, canonique et données structurées.
 * (Complété en production par les balises d'index.html et le sitemap généré
 * par l'API.)
 */
export function useSeo({
  title,
  description,
  image,
  type = 'website',
  canonicalPath,
  jsonLd,
  noindex,
}: SeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    if (image) {
      const absolute = image.startsWith('http') ? image : `${window.location.origin}${image}`;
      upsertMeta('property', 'og:image', absolute);
      upsertMeta('name', 'twitter:image', absolute);
    }

    const canonical = `${window.location.origin}${canonicalPath ?? window.location.pathname}`;
    upsertLink('canonical', canonical);
    upsertMeta('property', 'og:url', canonical);

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seo = 'jsonld';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      if (script) script.remove();
    };
  }, [title, description, image, type, canonicalPath, jsonLd, noindex]);
}
