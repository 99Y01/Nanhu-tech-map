import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MapPageNew from './pages/MapPageNew';
import ListPage from './pages/ListPage';
import SubmitPage from './pages/SubmitPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MapPageNew />} />
          <Route path="list" element={<ListPage />} />
          <Route path="submit" element={<SubmitPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
