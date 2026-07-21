import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientApp from './pages/PatientApp';
import StaffApp from './pages/StaffApp';
import Landing from './pages/Landing';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/patient/*" element={<PatientApp />} />
          <Route path="/staff/*" element={<StaffApp />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
