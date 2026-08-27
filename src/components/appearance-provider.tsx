import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppearanceMode = "system" | "light" | "dark";
export type AppearancePalette = "sepia" | "mono" | "blue";

export type AppearancePreferences = {
  mode: AppearanceMode;
  palette: AppearancePalette;
};

type AppearanceContextValue = AppearancePreferences & {
  resolvedMode: "light" | "dark";
  setMode: (mode: AppearanceMode) => void;
  setPalette: (palette: AppearancePalette) => void;
};

const APPEARANCE_STORAGE_KEY = "secret-vault-appearance";
const DEFAULT_APPEARANCE: AppearancePreferences = {
  mode: "system",
  palette: "sepia",
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function isMode(value: unknown): value is AppearanceMode {
  return value === "system" || value === "light" || value === "dark";
}

function isPalette(value: unknown): value is AppearancePalette {
  return value === "sepia" || value === "mono" || value === "blue";
}

function readAppearance(): AppearancePreferences {
  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    const parsed = JSON.parse(raw) as Partial<AppearancePreferences>;
    return {
      mode: isMode(parsed.mode) ? parsed.mode : DEFAULT_APPEARANCE.mode,
      palette: isPalette(parsed.palette)
        ? parsed.palette
        : DEFAULT_APPEARANCE.palette,
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

function getSystemMode(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<AppearancePreferences>(readAppearance);
  const resolvedMode = appearance.mode === "system" ? getSystemMode() : appearance.mode;

  const updateAppearance = useCallback(
    (update: (current: AppearancePreferences) => AppearancePreferences) => {
      setAppearance((current) => {
        const next = update(current);
        window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const setMode = useCallback(
    (mode: AppearanceMode) => {
      updateAppearance((current) => ({ ...current, mode }));
    },
    [updateAppearance],
  );

  const setPalette = useCallback(
    (palette: AppearancePalette) => {
      updateAppearance((current) => ({ ...current, palette }));
    },
    [updateAppearance],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.palette = appearance.palette;
    root.classList.toggle("dark", resolvedMode === "dark");
    root.style.colorScheme = resolvedMode;
  }, [appearance.palette, resolvedMode]);

  useEffect(() => {
    if (appearance.mode !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setAppearance((current) => ({ ...current }));
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [appearance.mode]);

  const value = useMemo(
    () => ({ ...appearance, resolvedMode, setMode, setPalette }),
    [appearance, resolvedMode, setMode, setPalette],
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return context;
}
