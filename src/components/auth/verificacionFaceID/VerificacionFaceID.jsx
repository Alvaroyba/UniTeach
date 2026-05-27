import { useState } from "react";
import { Box, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext";
import { verifyFaceIDAssertion } from "../../../service/authService";

const createChallenge = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return array;
};

const verifyFaceID = async (username) => {
  const challenge = createChallenge();

  const credential = await navigator.credentials.get({
    publicKey: {
      challenge,
      rp: { name: "UniTeach" },
      user: { id: new TextEncoder().encode(username), name: username },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { userVerification: "required" },
    },
  });

  return credential;
};

const VerificacionFaceID = () => {
  const { token, user, setFaceIDPending, handleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const handleVerify = async () => {
    if (attempts >= MAX_ATTEMPTS) {
      setError("Demasiados intentos. Usa tu contraseña para iniciar sesión.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const credential = await verifyFaceID(user.Username);

      const assertionData = {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        response: {
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
        },
      };

      await verifyFaceIDAssertion(token, assertionData);

      setFaceIDPending(false);
      handleLogin({ token, user });
      navigate("/app/home");
    } catch (err) {
      setAttempts((prev) => prev + 1);
      setError(err.message || "Verificación de Face ID fallida. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFallback = () => {
    setFaceIDPending(false);
    handleLogin({ token, user });
    navigate("/app/home");
  };

  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Verificación de identidad
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Confirma tu identidad con Face ID para completar el inicio de sesión
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={handleVerify}
          >
            Confirmar con Face ID
          </Button>
        )}
      </Box>

      {attempts > 0 && attempts < MAX_ATTEMPTS && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Intentos restantes: {MAX_ATTEMPTS - attempts}
        </Typography>
      )}

      <Button
        variant="outlined"
        onClick={handleFallback}
        sx={{ mt: 2 }}
      >
        Omitir y usar contraseña
      </Button>
    </Box>
  );
};

export default VerificacionFaceID;