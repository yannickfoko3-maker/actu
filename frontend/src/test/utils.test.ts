import { describe, expect, it } from 'vitest';
import {
  formatDateTime,
  formatFileSize,
  initials,
  shortExcerpt,
  slugify,
  telUrl,
  whatsappUrl,
} from '../utils';

describe('slugify', () => {
  it('supprime les accents et normalise les séparateurs', () => {
    expect(slugify('Clôture électrique')).toBe('cloture-electrique');
    expect(slugify('Panneaux solaires & énergie')).toBe('panneaux-solaires-energie');
  });

  it('produit un slug valide pour les URLs', () => {
    expect(slugify('  Vidéosurveillance   IP  ')).toBe('videosurveillance-ip');
    expect(slugify('')).toBe('');
  });
});

describe('liens de contact', () => {
  it('construit un lien WhatsApp avec message pré-rempli', () => {
    const url = whatsappUrl('242065390297', 'Bonjour ACES');
    expect(url).toBe('https://wa.me/242065390297?text=Bonjour%20ACES');
  });

  it('nettoie les caractères non numériques du numéro', () => {
    expect(whatsappUrl('+242 06 539 0297')).toBe('https://wa.me/242065390297');
  });

  it('construit un lien téléphonique', () => {
    expect(telUrl('+242 06 539 0297')).toBe('tel:+242065390297');
  });
});

describe('formatage', () => {
  it('formate les tailles de fichiers', () => {
    expect(formatFileSize(0)).toBe('—');
    expect(formatFileSize(1024)).toBe('1 Ko');
    expect(formatFileSize(1536 * 1024)).toBe('1,5 Mo');
  });

  it('retourne un tiret pour une date absente', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
  });

  it('formate une date en français', () => {
    const formatted = formatDateTime('2026-02-10T09:30:00.000Z');
    expect(formatted).toMatch(/2026/);
    expect(formatted).toMatch(/09:30|10:30/);
  });

  it('extrait des initiales', () => {
    expect(initials('Administrateur ACES')).toBe('AA');
    expect(initials('Jean')).toBe('J');
  });

  it('tronque le HTML sans balises', () => {
    const excerpt = shortExcerpt('<p>Bonjour <strong>ACES</strong>, ceci est un test.</p>', 20);
    expect(excerpt).not.toContain('<');
    expect(excerpt.length).toBeLessThanOrEqual(21);
  });
});
