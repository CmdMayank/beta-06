import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { SchemesPage } from './pages/SchemesPage';
import { ScreeningPage } from './pages/ScreeningPage';
import { ResultsPage } from './pages/ResultsPage';
import { SchemeDetailsPage } from './pages/SchemeDetailsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col selection:bg-orange-200 selection:text-orange-950">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/schemes/:code" element={<SchemeDetailsPage />} />
              <Route path="/screening" element={<ScreeningPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
