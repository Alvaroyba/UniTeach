import { API_URL } from "../config/constans";
import axios from "axios";

export const loginUser = async (credentials) => {
  try {
    const { data } = await axios.post(`${API_URL}/users/login`, credentials);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error de autenticación");
  }
};

export const registerUser = async (userData) => {
  try {
    const { data } = await axios.post(`${API_URL}/users/signup`, userData);
    return data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Error en el registro";
    const errorObj = new Error(errorMessage);

    errorObj.errors = {};

    if (errorMessage.includes("DNI")) {
      errorObj.errors.DNI = "Ya hay un usuario con ese DNI";
    }
    if (errorMessage.includes("Legajo")) {
      errorObj.errors.Legajo = "Ya hay un usuario con ese legajo";
    }
    if (errorMessage.includes("Mail")) {
      errorObj.errors.Mail = "Ya hay una cuenta con ese mail";
    }
    if (errorMessage.includes("Username")) {
      errorObj.errors.Username = "Este usuario ya esta en uso";
    }

    throw errorObj;
  }
};

export const handleLogout = async (token) => {
  try {
    await axios.post(`${API_URL}/users/logout`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return false;
  }
};

export const checkFaceIDStatus = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/users/2fa/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al verificar estado de Face ID");
  }
};

export const enableFaceID = async (token, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/2fa/enable`,
      { password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al activar Face ID");
  }
};

export const disableFaceID = async (token, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/2fa/disable`,
      { password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al desactivar Face ID");
  }
};

export const verifyFaceIDAssertion = async (token, assertion) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/2fa/verify`,
      { assertion },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al verificar Face ID");
  }
};
