import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../views/Home/Home";
import Catalogo from "../views/Catalogo/Catalogo";
import Login from "../views/Login/Login";
import UserNormal from "../views/Users/Normal/UserNormal";
import UserAdmin from "../views/Users/Admin/UserAdmin";
import Nosotros from "../views/Nosotros/Nosotros";

export default function AppRouter() {
  return (
    <Router>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Catalogo" element={<Catalogo />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/UserNormal" element={<UserNormal />}/>
          <Route path="/UserAdmin" element={<UserAdmin />}/>
          <Route path="/nosotros" element={<Nosotros />} />
        </Routes>
      </main>
    </Router>
  );
}