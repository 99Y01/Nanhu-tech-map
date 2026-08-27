import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MapPageNew from './pages/MapPageNew';
import ListPage from './pages/ListPage';
import SubmitPage from './pages/SubmitPage';
import ExplorePage from './pages/ExplorePage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="map" element={<MapPageNew />} />
          <Route path="list" element={<ListPage />} />
          <Route path="submit" element={<SubmitPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
