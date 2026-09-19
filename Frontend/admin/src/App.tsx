import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AdminLayout } from './layouts/AdminLayout';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminNews } from './pages/AdminNews';
import { AdminEvents } from './pages/AdminEvents';
import { AdminResults } from './pages/AdminResults';
import { AdminDocuments } from './pages/AdminDocuments';
import { AdminGallery } from './pages/AdminGallery';
import { AdminClasses } from './pages/AdminClasses';
import { AdminSettings } from './pages/AdminSettings';

export function App() {
  const basename = import.meta.env.PROD ? '/IPP/admin' : undefined;
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/news" element={<AdminNews />} />
          <Route path="/events" element={<AdminEvents />} />
          <Route path="/results" element={<AdminResults />} />
          <Route path="/documents" element={<AdminDocuments />} />
          <Route path="/gallery" element={<AdminGallery />} />
          <Route path="/classes" element={<AdminClasses />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
