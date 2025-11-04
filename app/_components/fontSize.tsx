"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type FontSize = "small" | "normal" | "large";

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined,
);

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider");
  }
  return context;
};

interface FontSizeProviderProps {
  children: ReactNode;
}

export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({
  children,
}) => {
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");

  // Function to apply font size to document body
  const applyFontSize = (size: FontSize) => {
    const body = document.body;
    // Remove existing font size classes
    body.classList.remove(
      "font-size-small",
      "font-size-normal",
      "font-size-large",
    );
    // Add new font size class
    body.classList.add(`font-size-${size}`);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    applyFontSize(size);
    localStorage.setItem("fontSize", size);
  };

  const increaseFontSize = () => {
    const newSize =
      fontSize === "small"
        ? "normal"
        : fontSize === "normal"
          ? "large"
          : "large";
    setFontSize(newSize);
  };

  const decreaseFontSize = () => {
    const newSize =
      fontSize === "large"
        ? "normal"
        : fontSize === "normal"
          ? "small"
          : "small";
    setFontSize(newSize);
  };

  const resetFontSize = () => {
    setFontSize("normal");
  };

  // Load saved font size on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSize") as FontSize | null;
    if (savedFontSize && ["small", "normal", "large"].includes(savedFontSize)) {
      setFontSizeState(savedFontSize);
      applyFontSize(savedFontSize);
    }
  }, []);

  const value: FontSizeContextType = {
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};
