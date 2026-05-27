import { useState } from "react";
import { Box, Typography, Switch, Button, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useAuth } from "../../../../contexts/authContext";
import { enableFaceID, disableFaceID } from "../../../../service/authService";

const ConfiguracionSeguridad = () => {
  const { user, token, setUser } = useAuth();
  const [faceIDEnabled, setFaceIDEnabled] = useState(user?.faceIdEnabled || false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isWebAuthnSupported = () => {
    return !!(window.navigator && window.navigator.credentials && window.navigator.credentials.get);
  };

  const handleToggle = (event) => {
    if (event.target.checked) {
      setDialogAction("enable");
      setDialogOpen(true);
      setPassword("");
      setError(null);
    } else {
      setDialogAction("disable");
      setDialogOpen(true);
      setPassword("");
      setError(null);
    }
  };

  const handleConfirm = async () => {
    if (!password) {
      setError("Ingresa tu contraseña");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (faceIDEnabled) {
        await disableFaceID(token, password);
        setFaceIDEnabled(false);
        setSuccess("Face ID desactivado correctamente");
        if (user) {
          const updatedUser = { ...user, faceIdEnabled: false };
          setUser(updatedUser);
        }
      } else {
        await enableFaceID(token, password);

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "UniTeach" },
            user: { id: new TextEncoder().encode(user.Username), name: user.Username },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -257 },
            ],
          },
        });

        setFaceIDEnabled(true);
        setSuccess("Face ID activado correctamente");
        if (user) {
          const updatedUser = { ...user, faceIdEnabled: true };
          setUser(updatedUser);
        }
      }

      setDialogOpen(false);
      setPassword("");
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPassword("");
    setError(null);
  };

  if (!isWebAuthnSupported()) {
    return (
      <Alert severity="warning">
        Tu navegador no soporta Face ID. Por favor, usa un navegador actualizado como Chrome, Edge o Safari.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Autenticación de dos factores
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography>Face ID</Typography>
        <Switch
          checked={faceIDEnabled}
          onChange={handleToggle}
          disabled={loading}
        />
        <Typography variant="body2" color={faceIDEnabled ? "success.main" : "text.secondary"}>
          {faceIDEnabled ? "Activo" : "Inactivo"}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary">
        Activa Face ID para agregar una capa adicional de seguridad a tu cuenta.
        Después de iniciar sesión con tu contraseña, se te pedirá confirmar tu identidad con Face ID.
      </Typography>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === "enable" ? "Activar Face ID" : "Desactivar Face ID"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Para {dialogAction === "enable" ? "activar" : "desactivar"} Face ID, ingresa tu contraseña:
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleConfirm} variant="contained" disabled={loading}>
            {loading ? "Procesando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConfiguracionSeguridad;