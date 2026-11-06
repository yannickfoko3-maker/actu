import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, queryKeys } from '../services/api';
import type { HeroSlide, ServiceSummary, Settings } from '../types';
import { telUrl, whatsappUrl } from '../utils';

interface SiteBootstrap {
  settings: Settings;
  slides: HeroSlide[];
  navigation: ServiceSummary[];
}

interface SiteContextValue {
  settings: Settings;
  slides: HeroSlide[];
  navigation: ServiceSummary[];
  isLoading: boolean;
  setting: (key: string, fallback?: string) => string;
  phone: string;
  email: string;
  whatsapp: (message?: string) => string;
  call: () => string;
  refresh: () => void;
}

const FALLBACK_SETTINGS: Settings = {
  'company.name': 'ACES Global Services',
  'company.legalName': 'ACES Global Services',
  'company.tagline': 'Votre sécurité, notre priorité !',
  'company.baseline': 'Automatisation – Communication – Énergie et Sécurité',
  'company.phone': '+242 06 539 0297',
  'company.phoneHref': '+242065390297',
  'company.email': 'aces.globalservices@gmail.com',
  'company.whatsapp': '242065390297',
  'company.address': 'N°12 Rue Koudéka, Batignolles – La Frontière',
  'company.city': 'Bangui',
  'company.country': 'République Centrafricaine',
  'company.hours': 'Lundi – Samedi : 08h00 – 18h00',
  'company.whatsappMessage':
    'Bonjour ACES Global Services, je souhaite obtenir des informations sur vos prestations et demander un devis.',
  'brand.logo': '/assets/brand/aces-logo.jpg',
  'seo.siteName': 'ACES Global Services',
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.site,
    queryFn: () => api.get<SiteBootstrap>('/public/site'),
    staleTime: 60_000,
  });

  const settings = useMemo(() => ({ ...FALLBACK_SETTINGS, ...(data?.settings ?? {}) }), [data]);

  const setting = useCallback(
    (key: string, fallback = '') => settings[key] ?? FALLBACK_SETTINGS[key] ?? fallback,
    [settings]
  );

  const value = useMemo<SiteContextValue>(() => {
    const phone = settings['company.phone'] || FALLBACK_SETTINGS['company.phone'];
    const email = settings['company.email'] || FALLBACK_SETTINGS['company.email'];
    const number = settings['company.whatsapp'] || FALLBACK_SETTINGS['company.whatsapp'];
    const defaultMessage =
      settings['company.whatsappMessage'] || FALLBACK_SETTINGS['company.whatsappMessage'];

    return {
      settings,
      slides: data?.slides ?? [],
      navigation: data?.navigation ?? [],
      isLoading,
      setting,
      phone,
      email,
      whatsapp: (message?: string) => whatsappUrl(number, message ?? defaultMessage),
      call: () => telUrl(settings['company.phoneHref'] || phone),
      refresh: () => void refetch(),
    };
  }, [data, isLoading, setting, settings, refetch]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite doit être utilisé dans un SiteProvider.');
  return context;
}
