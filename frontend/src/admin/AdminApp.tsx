import { Route, Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServicesList from './pages/ServicesList';
import ServiceEditor from './pages/ServiceEditor';
import HeroManager from './pages/HeroManager';
import PagesList from './pages/PagesList';
import PageEditor from './pages/PageEditor';
import ProjectsList from './pages/ProjectsList';
import ProjectEditor from './pages/ProjectEditor';
import ArticlesList from './pages/ArticlesList';
import ArticleEditor from './pages/ArticleEditor';
import MediaPage from './pages/MediaPage';
import TestimonialsPage from './pages/TestimonialsPage';
import MessagesPage from './pages/MessagesPage';
import QuotesPage from './pages/QuotesPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import ActivityPage from './pages/ActivityPage';
import ProfilePage from './pages/ProfilePage';
import { Spinner } from './components/ui';

export default function AdminApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-ink-soft">
          <Spinner />
          <p className="text-sm">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  if (!user) return <AdminLogin />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="prestations" element={<ServicesList />} />
        <Route path="prestations/nouvelle" element={<ServiceEditor />} />
        <Route path="prestations/:id" element={<ServiceEditor />} />
        <Route path="carrousel" element={<HeroManager />} />
        <Route path="pages" element={<PagesList />} />
        <Route path="pages/:id" element={<PageEditor />} />
        <Route path="realisations" element={<ProjectsList />} />
        <Route path="realisations/nouvelle" element={<ProjectEditor />} />
        <Route path="realisations/:id" element={<ProjectEditor />} />
        <Route path="actualites" element={<ArticlesList />} />
        <Route path="actualites/nouvelle" element={<ArticleEditor />} />
        <Route path="actualites/:id" element={<ArticleEditor />} />
        <Route path="mediatheque" element={<MediaPage />} />
        <Route path="temoignages" element={<TestimonialsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="devis" element={<QuotesPage />} />
        <Route path="parametres" element={<SettingsPage />} />
        <Route path="utilisateurs" element={<UsersPage />} />
        <Route path="journal" element={<ActivityPage />} />
        <Route path="profil" element={<ProfilePage />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
