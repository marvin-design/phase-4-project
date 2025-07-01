import React from "react";
import { useAuth } from "./hooks/useAuth";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const {
    isAuthenticated,
    user,
    authData,
    setAuthData,
    isRegisterMode,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    toggleMode,
  } = useAuth();

  return (
    <div className='app'>
      {!isAuthenticated ? (
        <AuthForm
          isRegisterMode={isRegisterMode}
          authData={authData}
          setAuthData={setAuthData}
          loading={loading}
          error={error}
          onSubmit={isRegisterMode ? handleRegister : handleLogin}
          onToggleMode={toggleMode}
        />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
