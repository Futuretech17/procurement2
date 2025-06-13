import { Navigate } from 'react-router-dom';

// roleAllowed can be a string or an array of roles allowed to access the route
function RoleProtectedRoute({ user, roleAllowed, children }) {
  if (!user) {
    // Not logged in: redirect to login
    return <Navigate to="/login" replace />;
  }

  // Support either a single role string or array of roles
  const roles = Array.isArray(roleAllowed) ? roleAllowed : [roleAllowed];

  if (!roles.includes(user.role)) {
    // User logged in but role not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized: render child components (the protected page)
  return children;
}

export default RoleProtectedRoute;
