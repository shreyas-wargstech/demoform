import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./slices/formSlice";
import authReducer from "./slices/authSlice";
import ccmpFormReducer from "./slices/ccmpSlice";
import NOCFormReducer from "./slices/nocSlice";
import NOCMMCFormReducer from "./slices/nocMMCSlice";
import NOCPharmFormReducer from "./slices/nocPharmSlice";
import renewalRestorReducer from "./slices/renewalRestorSlice";
import icardFormReducer from "./slices/icardSlice";
import permregFormReducer from "./slices/permregSlice";
export const store = configureStore({
  reducer: {
    applicationForm: formReducer,
    auth: authReducer,
    ccmpForm: ccmpFormReducer,
    NOCForm: NOCFormReducer,
    NOCMMCForm: NOCMMCFormReducer,
    NOCPharmForm: NOCPharmFormReducer,
    renewalRestorForm: renewalRestorReducer,
    ICARDForm: icardFormReducer,
    PERMREGForm: permregFormReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          "form/updateDocument",
          "form/submitDocuments/pending",
          "form/submitDocuments/fulfilled",
          "form/submitDocuments/rejected",
          "persist/PERSIST",
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ["payload.file", "payload.documents"],
        // Ignore these paths in the state
        ignoredPaths: ["applicationForm.documents"],
      },
    }),
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
