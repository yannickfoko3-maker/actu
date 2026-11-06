import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { Loader2 } from 'lucide-react';

import Home from './pages/Home';
import About from './pages/About';
import ServicesIndex from './pages/ServicesIndex';
import ServiceDetail from './pages/ServiceDetail';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';
import NewsPage from './pages/NewsPage';
import ArticleDetail from './pages/ArticleDetail';
import Contact from './pages/Contact';
import Quote from './pages/Quote';
import DynamicPage from './pages/DynamicPage';
import NotFound from './pages/NotFound';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-ink-soft">
        <Loader2 size={26} className="animate-spin text-aces-blue" />
        <p className="text-sm">Chargement…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/qui-sommes-nous" element={<About />} />
        <Route path="/nos-activites" element={<ServicesIndex />} />
        <Route path="/nos-activites/:slug" element={<ServiceDetail />} />
        <Route path="/nos-realisations" element={<ProjectsPage />} />
        <Route path="/nos-realisations/:slug" element={<ProjectDetail />} />
        <Route path="/actualites" element={<NewsPage />} />
        <Route path="/actualites/:slug" element={<ArticleDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/devis" element={<Quote />} />
        <Route path="/:slug" element={<DynamicPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<PageLoader />}>
            <AdminApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
