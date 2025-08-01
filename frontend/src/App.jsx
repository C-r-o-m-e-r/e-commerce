// src/App.jsx (Правильна версія)

import { Routes, Route } from 'react-router-dom'; // Видалено імпорт BrowserRouter
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css'; // Додаємо імпорт стилів для App, якщо він потрібен

function App() {
  return (
    // Видалено обгортку <BrowserRouter>
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;