import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import SolanaAuth from "./Auth";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SolanaAuth />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
