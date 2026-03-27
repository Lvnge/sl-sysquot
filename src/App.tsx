import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuoteList from "./pages/QuoteList";
import NewQuote from "./pages/NewQuote";
import Catalog from "./pages/Catalog";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuoteList />} />
        <Route path="/new" element={<NewQuote />} />
        <Route path="/edit/:id" element={<NewQuote />} />
        <Route path="/catalog" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  );
}
