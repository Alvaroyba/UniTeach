import { useEffect, createContext, useContext, useReducer } from "react";
import { authReducer } from "../store/authReducer";
import { handleLogout as handleLogoutService } from "../service/authService";

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  faceIDPending: false,
  passwordVerified: false,
  handleLogin: () => {},
  handleLogout: () => {},
  setUser: () => {},
  setFaceIDPending: () => {},
  setPasswordVerified: () => {},
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    faceIDPending: false,
    passwordVerified: false,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = sessionStorage.getItem("authData");
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          dispatch({ type: "INITIALIZE", payload: authData });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        sessionStorage.removeItem("authData");
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = (authData) => {
    sessionStorage.setItem("authData", JSON.stringify(authData));
    dispatch({ type: "LOGIN", payload: authData });
  };

  const handleLogout = async () => {
    try {
      if (state.token) {
        await handleLogoutService(state.token);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      sessionStorage.removeItem("authData");
      dispatch({ type: "LOGOUT" });
    }
  };

  const updateUser = (userData) => {
    const authData = JSON.parse(sessionStorage.getItem("authData"));
    const newAuthData = { ...authData, user: userData };
    sessionStorage.setItem("authData", JSON.stringify(newAuthData));
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const setFaceIDPending = (pending) => {
    dispatch({ type: "SET_FACE_ID_PENDING", payload: pending });
  };

  const setPasswordVerified = (verified) => {
    dispatch({ type: "SET_PASSWORD_VERIFIED", payload: verified });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        handleLogin,
        handleLogout,
        setUser: updateUser,
        setFaceIDPending,
        setPasswordVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
