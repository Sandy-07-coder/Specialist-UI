import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/i18n";

/**
 * A compact language-switcher dropdown.
 * Renders as a borderless select with a globe icon prefix.
 * Language preference is persisted to localStorage via i18next-browser-languagedetector.
 */
export function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
      <label htmlFor="language-switcher" className="sr-only">
        {t("languageSwitcher.label")}
      </label>
      <select
        id="language-switcher"
        value={i18n.language?.split("-")[0]}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="
          bg-transparent text-sm text-foreground
          border border-border rounded-lg
          px-2 py-1 pr-6
          focus:outline-none focus:ring-2 focus:ring-primary
          cursor-pointer hover:border-primary/60
          transition-colors
          appearance-none
        "
        style={{ backgroundImage: "none" }}
        aria-label={t("languageSwitcher.label")}
      >
        {SUPPORTED_LANGUAGES.map(({ code, nativeLabel }) => (
          <option key={code} value={code}>
            {nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
