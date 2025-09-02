
import { Navigate, Outlet } from "react-router-dom";

const ADMIN_PATH = "/UserAdmin";
const USER_PATH  = "/UserNormal";

export default function ProtectedRoute({ allowedRoles }) {
  let user = null;
  try {
    const raw = localStorage.getItem("sdh_user");
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  if (!user) return <Navigate to="/" replace />;

  const role = String(user?.rol || "").toLowerCase();
  const allowed = allowedRoles?.map(r => String(r).toLowerCase());

  if (allowed && !allowed.includes(role)) {
    return <Navigate to={role === "admin" ? ADMIN_PATH : USER_PATH} replace />;
  }

  return <Outlet />;
}
