import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Dashboard from "./component/Dashboard";
import ProductDetail from "./component/ProductDetail";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </HashRouter>
  );
}
