import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuoteList from "./pages/QuoteList";
import NewQuote from "./pages/NewQuote";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <QuoteList />
            </PrivateRoute>
          }
        />
        <Route
          path="/new"
          element={
            <PrivateRoute>
              <NewQuote />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <NewQuote />
            </PrivateRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <PrivateRoute>
              <Catalog />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
