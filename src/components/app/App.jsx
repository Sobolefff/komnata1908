import About from '../about/About';
import Drinks from '../drinks/Drinks';
import Header from '../header/Header';
import Secret from '../secret/Secret';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import FeedbackForm from '../feedback-form/FeedbackForm';
import Thanks from '../thanks/Thanks'
import Footer from '../footer/Footer';
import MediaQuery from 'react-responsive';
import AdminPage from '../admin/AdminPage';
import { SiteConfigProvider } from '../../context/SiteConfigContext';

function MainLayout() {
  return (
    <>
      <Header />
      <About />
      <Drinks />
      <MediaQuery minWidth={550}>
        <Secret />
      </MediaQuery>
      <Outlet />
      <MediaQuery maxWidth={549}>
        <Secret />
      </MediaQuery>
      <Footer />
    </>
  );
}

function App() {
  return (
    <SiteConfigProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route exact path="/" element={<FeedbackForm />} />
            <Route exact path="/thanks" element={<Thanks />} />
          </Route>
          <Route exact path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </SiteConfigProvider>
  );
}

export default App;
