import React from "react";

const AuthForm = ({
  isRegisterMode,
  authData,
  setAuthData,
  loading,
  error,
  onSubmit,
  onToggleMode,
}) => {
  return (
    <div className='login-container'>
      <div className='login-form'>
        <h2>{isRegisterMode ? "Register" : "Login"}</h2>
        <p>
          {isRegisterMode
            ? "Create a new account."
            : "Please enter your credentials."}
        </p>

        <form onSubmit={onSubmit}>
          <div className='form-group'>
            <label>Email:</label>
            <input
              type='email'
              value={authData.email}
              onChange={(e) =>
                setAuthData({ ...authData, email: e.target.value })
              }
              required
            />
          </div>

          <div className='form-group'>
            <label>Password:</label>
            <input
              type='password'
              value={authData.password}
              onChange={(e) =>
                setAuthData({ ...authData, password: e.target.value })
              }
              required
            />
            {isRegisterMode && (
              <small style={{ color: "#666", fontSize: "12px" }}>
                Password must be at least 6 characters long
              </small>
            )}
          </div>

          <button type='submit' disabled={loading}>
            {loading
              ? isRegisterMode
                ? "Creating Account..."
                : "Logging in..."
              : isRegisterMode
              ? "Create Account"
              : "Login"}
          </button>

          {error && <div className='error'>{error}</div>}

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <button
              type='button'
              onClick={onToggleMode}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
              }}>
              {isRegisterMode
                ? "Already have an account? Login here"
                : "Don't have an account? Register here"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
