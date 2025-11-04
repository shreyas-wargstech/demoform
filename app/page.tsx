"use client";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import DynamicForm from "./_components/DynamicForm/dynamicForm";

const theme = createTheme({
  palette: {
    primary: {
      main: "#7c3aed", // Purple color matching your design
      light: "#a855f7",
      dark: "#5b21b6",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          "&:before": {
            display: "none",
          },
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          "&.Mui-expanded": {
            margin: "16px 0",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "all 0.2s ease-in-out",
        },
      },
    },
  },
});

const MultiStepFormPage: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DynamicForm />
    </ThemeProvider>
  );
};

export default MultiStepFormPage;