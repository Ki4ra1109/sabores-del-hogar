import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../views/Home/Home";
import Catalogo from "../views/Catalogo/Catalogo";
import Login from "../views/Login/Login";
import UserNormal from "../views/Users/Normal/UserNormal";
import UserAdmin from "../views/Users/Admin/UserAdmin";

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
        </Routes>
      </main>
    </Router>
  );
}