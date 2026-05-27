export const authReducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        user: action.payload?.user || null,
        token: action.payload?.token || null,
        isAuthenticated: !!action.payload?.token,
        loading: false,
      };
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_FACE_ID_PENDING":
      return {
        ...state,
        faceIDPending: action.payload,
      };
    case "SET_PASSWORD_VERIFIED":
      return {
        ...state,
        passwordVerified: action.payload,
      };
    default:
      return state;
  }
};
