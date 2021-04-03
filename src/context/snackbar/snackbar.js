const SET_SNACKBAR = "SET_SNACKBAR";

const initialState = {
  snackbarOpen: false,
  snackbarType: "success",
  snackbarMessage: ""
};

const defaultFunc = (state = initialState, action) => {
  switch (action.type) {
    case SET_SNACKBAR:
      const { snackbarOpen, snackbarMessage, snackbarType } = action;
      return {
        ...state,
        snackbarOpen,
        snackbarType,
        snackbarMessage
      };
    default:
      return state;
  }
};

export default defaultFunc;

export const setSnackbar = (
  snackbarOpen,
  snackbarType = "success",
  snackbarMessage = ""
) => ({
  type: SET_SNACKBAR,
  snackbarOpen,
  snackbarType,
  snackbarMessage
});
