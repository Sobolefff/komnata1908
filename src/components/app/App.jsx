import About from '../about/About';
import Drinks from '../drinks/Drinks';
import Header from '../header/Header';
import Secret from '../secret/Secret';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FeedbackForm from '../feedback-form/FeedbackForm';
import Thanks from '../thanks/Thanks'
import Footer from '../footer/Footer';
import MediaQuery from 'react-responsive';

function App() {
  return (
    <>
      <Header />
      <About />
      <Drinks />
      <MediaQuery minWidth={550}>
        <Secret />
      </MediaQuery>
      <Router>
      <Routes>
        <Route exact path="/" element={<FeedbackForm/>} />
        <Route exact path="/thanks" element={<Thanks />} />
      </Routes>
      </Router>
      <MediaQuery maxWidth={549}>
        <Secret />
      </MediaQuery>
      <Footer />
    </>
  );
}

export default App;
