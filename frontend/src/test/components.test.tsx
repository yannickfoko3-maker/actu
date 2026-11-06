import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Accordion } from '../components/ui/Accordion';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { WhatsAppFab } from '../components/site/WhatsAppFab';
import { SiteProvider } from '../contexts/SiteContext';

const FAQ = [
  { question: 'Quel est le délai d’installation ?', answer: 'Deux à cinq jours selon le site.' },
  { question: 'Proposez-vous la maintenance ?', answer: 'Oui, un contrat annuel est disponible.' },
];

describe('Accordion', () => {
  it('affiche les questions et ouvre la première par défaut', () => {
    render(<Accordion items={FAQ} />);
    expect(screen.getByText(FAQ[0].question)).toBeInTheDocument();
    expect(screen.getByText(FAQ[0].answer)).toBeInTheDocument();
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-expanded', 'true');
  });

  it('bascule l’ouverture au clic et reste accessible', async () => {
    const user = userEvent.setup();
    render(<Accordion items={FAQ} defaultOpen={null} />);
    const buttons = screen.getAllByRole('button');

    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
    await user.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(FAQ[1].answer)).toBeInTheDocument();

    await user.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('ServiceIcon', () => {
  it('affiche une icône pour chaque code connu', () => {
    const { container } = render(<ServiceIcon name="cctv" size={24} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('utilise une icône de secours pour un code inconnu', () => {
    const { container } = render(<ServiceIcon name="inconnu" size={24} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});

describe('WhatsAppFab', () => {
  const renderWithProvider = (ui: ReactNode) => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    // Le bootstrap échoue volontairement : les valeurs de secours doivent rester correctes.
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('réseau indisponible')))
    );

    return render(
      <QueryClientProvider client={client}>
        <SiteProvider>{ui}</SiteProvider>
      </QueryClientProvider>
    );
  };

  it('expose le numéro WhatsApp et le numéro d’appel officiels', async () => {
    const user = userEvent.setup();
    renderWithProvider(<WhatsAppFab />);

    await user.click(screen.getByRole('button', { name: /ouvrir les options de contact/i }));

    const whatsappLink = screen.getByRole('link', { name: /discuter sur whatsapp/i });
    expect(whatsappLink).toHaveAttribute('href');
    expect(whatsappLink.getAttribute('href')).toContain('https://wa.me/242065390297');

    const callLink = screen.getByRole('link', { name: /appeler/i });
    expect(callLink).toHaveAttribute('href', 'tel:+242065390297');
    expect(callLink).toHaveTextContent('+242 06 539 0297');
  });
});
