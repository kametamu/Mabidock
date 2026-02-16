import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TrainingPage from './pages/TrainingPage';
import MoneyPage from './pages/MoneyPage';
import DailiesPage from './pages/DailiesPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/money" element={<MoneyPage />} />
        <Route path="/dailies" element={<DailiesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
