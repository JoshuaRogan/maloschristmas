import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import WinnerImagesGallery from './components/WinnerImagesGallery';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const rootEl = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/winner-images" element={<WinnerImagesGallery />} />
    </Routes>
  </BrowserRouter>,
  rootEl,
);

serviceWorker.unregister();
