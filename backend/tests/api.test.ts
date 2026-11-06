/**
 * Tests d'intégration de l'API ACES Global Services.
 *
 * Ces tests s'exécutent sur l'adaptateur `memory` (magasin JSON temporaire) :
 * ils ne nécessitent ni MySQL ni serveur SMTP. Le parcours complet est couvert :
 * contenus publics, formulaires, authentification, permissions, CRUD admin.
 *
 *   npm run test:api
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

const dataFile = path.join(os.tmpdir(), `aces-test-${process.pid}.json`);

process.env.NODE_ENV = 'test';
process.env.DATA_ADAPTER = 'memory';
process.env.DATA_FILE = dataFile;
process.env.JWT_SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
process.env.DEMO_REQUESTS = 'false';
process.env.RATE_LIMIT_MAX = '10000';
process.env.RATE_LIMIT_FORM_MAX = '10000';
process.env.SEED_ADMIN_EMAIL = 'admin@aces-globalservices.com';
process.env.SEED_ADMIN_PASSWORD = 'AcesAdmin2025!';

let app: Express;
let token = '';

const auth = () => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  const { createApp } = await import('../src/app');
  app = createApp();

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD });

  expect(login.status).toBe(200);
  token = login.body.data.token;
});

afterAll(() => {
  if (fs.existsSync(dataFile)) fs.rmSync(dataFile, { force: true });
});

describe('Santé et contenus publics', () => {
  it('expose un point de santé', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('renvoie la configuration du site', async () => {
    const response = await request(app).get('/api/public/site');
    expect(response.status).toBe(200);
    expect(response.body.data.settings['company.name']).toBe('ACES Global Services');
    expect(response.body.data.settings['company.whatsapp']).toBe('242065390297');
    // Le bootstrap expose la navigation dérivée des prestations publiées + le carrousel.
    expect(response.body.data.navigation).toHaveLength(11);
    expect(response.body.data.slides.length).toBeGreaterThan(0);
  });

  it('ne présente jamais la marque « CONGO »', async () => {
    const response = await request(app).get('/api/public/site');
    expect(JSON.stringify(response.body)).not.toMatch(/congo/i);
  });

  it('liste les prestations publiées', async () => {
    const response = await request(app).get('/api/public/services');
    expect(response.status).toBe(200);
    const slugs = response.body.data.map((service: { slug: string }) => service.slug);
    expect(slugs).toContain('cloture-electrique');
    expect(slugs).toContain('videosurveillance');
    expect(slugs).toContain('geolocalisation-gps');
  });

  it('renvoie le détail d’une prestation avec ses sections', async () => {
    const response = await request(app).get('/api/public/services/cloture-electrique');
    expect(response.status).toBe(200);
    expect(response.body.data.title).toMatch(/clôture/i);
    expect(Array.isArray(response.body.data.faqs)).toBe(true);
    expect(response.body.data.faqs.length).toBeGreaterThan(0);
    expect(Array.isArray(response.body.data.toc)).toBe(true);
  });

  it('renvoie 404 pour une prestation inconnue', async () => {
    const response = await request(app).get('/api/public/services/prestation-inexistante');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('filtre les articles par catégorie et pagine', async () => {
    const response = await request(app).get('/api/public/articles?limit=2&page=1');
    expect(response.status).toBe(200);
    expect(response.body.data.items.length).toBeLessThanOrEqual(2);
    expect(response.body.data.pagination.page).toBe(1);
    expect(response.body.data.pagination.total).toBeGreaterThan(0);
  });

  it('expose les données du sitemap', async () => {
    const response = await request(app).get('/api/public/sitemap-data');
    expect(response.status).toBe(200);
    expect(response.body.data.services.length).toBe(11);
  });
});

describe('Formulaires publics', () => {
  it('enregistre un message de contact valide', async () => {
    const response = await request(app).post('/api/public/messages').send({
      name: 'Jean Test',
      email: 'jean.test@example.com',
      phone: '+236 70 00 00 00',
      subject: 'Demande d’information',
      message: 'Bonjour, je souhaite des informations sur la vidéosurveillance.',
      consent: true,
    });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('refuse un message invalide avec le détail des champs', async () => {
    const response = await request(app).post('/api/public/messages').send({
      name: 'A',
      email: 'adresse-invalide',
      phone: '',
      subject: '',
      message: 'court',
      consent: false,
    });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.details).toBeTruthy();
  });

  it('enregistre une demande de devis et la rend visible en administration', async () => {
    const response = await request(app).post('/api/public/quotes').send({
      name: 'Société Test',
      company: 'Test SARL',
      email: 'contact@test-sarl.cf',
      phone: '+236 72 00 00 00',
      city: 'Bangui',
      serviceSlug: 'videosurveillance',
      serviceTitle: 'Vidéosurveillance',
      projectDescription: 'Équipement de 8 caméras pour un entrepôt de 400 m².',
      budget: '1 000 000 – 3 000 000 FCFA',
      preferredContact: 'whatsapp',
      consent: true,
    });
    expect(response.status).toBe(201);
    expect(response.body.data.id).toBeTruthy();

    const list = await request(app).get('/api/admin/quotes').set(auth());
    expect(list.status).toBe(200);
    const stored = list.body.data.items.find((quote: { name: string }) => quote.name === 'Société Test');
    expect(stored).toBeTruthy();
    expect(stored.status).toBe('NEW');
    expect(stored.serviceTitle).toBe('Vidéosurveillance');
  });

  it('refuse une demande de devis sans consentement', async () => {
    const response = await request(app).post('/api/public/quotes').send({
      name: 'Sans Consentement',
      email: 'sans@example.com',
      phone: '+236 75 00 00 00',
      city: 'Bangui',
      serviceTitle: 'Contrôle d’accès',
      projectDescription: 'Test de refus du consentement obligatoire.',
      preferredContact: 'phone',
      consent: false,
    });
    expect(response.status).toBe(400);
  });
});

describe('Authentification et permissions', () => {
  it('refuse un mot de passe incorrect', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@aces-globalservices.com', password: 'mauvais-mot-de-passe' });
    expect(response.status).toBe(401);
  });

  it('refuse l’accès à l’administration sans jeton', async () => {
    const response = await request(app).get('/api/admin/stats');
    expect(response.status).toBe(401);
  });

  it('renvoie le profil de l’administrateur connecté', async () => {
    const response = await request(app).get('/api/auth/me').set(auth());
    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('admin@aces-globalservices.com');
    expect(response.body.data.permissions).toContain('*');
  });

  it('fournit des statistiques calculées depuis la base', async () => {
    const response = await request(app).get('/api/admin/stats').set(auth());
    expect(response.status).toBe(200);
    expect(response.body.data.counts.services.total).toBe(11);
    expect(response.body.data.counts.quotes.total).toBeGreaterThan(0);
    expect(response.body.data.charts.quotesPerMonth).toHaveLength(6);
  });
});

describe('Administration des contenus', () => {
  let serviceId = '';

  it('crée une prestation', async () => {
    const response = await request(app)
      .post('/api/admin/services')
      .set(auth())
      .send({
        slug: 'test-prestation-api',
        title: 'Prestation de test',
        tagline: 'Vérification automatisée',
        shortDescription: 'Prestation créée par la suite de tests.',
        description: '<p>Contenu de test.</p>',
        icon: 'shield',
        heroImage: '/assets/images/hero/hero-1.jpg',
        coverImage: '/assets/images/hero/hero-1.jpg',
        benefits: ['Avantage 1'],
        features: [{ title: 'Fonction', description: 'Description' }],
        applications: ['Site test'],
        process: [{ title: 'Étape', description: 'Description' }],
        equipment: ['Équipement'],
        faqs: [{ question: 'Question ?', answer: 'Réponse.' }],
        images: [],
        order: 99,
        isPublished: true,
      });

    expect(response.status).toBe(201);
    serviceId = response.body.data.id;
    expect(serviceId).toBeTruthy();
  });

  it('modifie puis dépublie la prestation', async () => {
    // PUT remplace la ressource : le client renvoie l'objet complet.
    const payload = {
      slug: 'test-prestation-api',
      title: 'Prestation de test modifiée',
      tagline: 'Vérification automatisée',
      shortDescription: 'Prestation créée par la suite de tests.',
      description: '<p>Contenu de test mis à jour.</p>',
      icon: 'shield',
      heroImage: '/assets/images/hero/hero-1.jpg',
      coverImage: '/assets/images/hero/hero-1.jpg',
      benefits: ['Avantage 1'],
      features: [{ title: 'Fonction', description: 'Description' }],
      applications: ['Site test'],
      process: [{ title: 'Étape', description: 'Description' }],
      equipment: ['Équipement'],
      faqs: [{ question: 'Question ?', answer: 'Réponse.' }],
      images: [],
      order: 99,
      isPublished: true,
    };
    const update = await request(app).put(`/api/admin/services/${serviceId}`).set(auth()).send(payload);
    expect(update.status).toBe(200);
    expect(update.body.data.title).toBe('Prestation de test modifiée');

    const publish = await request(app).patch(`/api/admin/services/${serviceId}/publish`).set(auth());
    expect(publish.status).toBe(200);
    expect(publish.body.data.isPublished).toBe(false);
  });

  it('supprime la prestation de test', async () => {
    const response = await request(app).delete(`/api/admin/services/${serviceId}`).set(auth());
    expect(response.status).toBe(200);

    const missing = await request(app).get('/api/public/services/test-prestation-api');
    expect(missing.status).toBe(404);
  });

  it('modifie un paramètre du site et le reflète publiquement', async () => {
    const response = await request(app)
      .put('/api/admin/settings')
      .set(auth())
      .send({ 'company.phone2': '+236 70 11 22 33' });
    expect(response.status).toBe(200);

    const site = await request(app).get('/api/public/site');
    expect(site.body.data.settings['company.phone2']).toBe('+236 70 11 22 33');
  });

  it('exporte les demandes de devis en CSV', async () => {
    const response = await request(app).get('/api/admin/quotes/export').set(auth());
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/csv/);
    expect(response.text.split('\n')[0]).toMatch(/Nom/i);
  });

  it('journalise les actions d’administration', async () => {
    const response = await request(app).get('/api/admin/activity-logs?limit=5').set(auth());
    expect(response.status).toBe(200);
    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.items[0].action).toBeTruthy();
  });
});
