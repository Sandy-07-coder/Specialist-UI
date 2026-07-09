import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/i18n";

/**
 * A compact language-switcher dropdown.
 * Uses CSS custom properties (bg-card, text-foreground, border-border) so it
 * correctly adapts to both light and dark themes — native <select> elements
 * ignore Tailwind's bg-transparent in dark mode because the browser forces its
 * own OS-level background on the popup.
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
        aria-label={t("languageSwitcher.label")}
        className="
          text-sm font-medium
          bg-card text-foreground
          border border-border rounded-lg
          px-2 py-1
          focus:outline-none focus:ring-2 focus:ring-primary
          cursor-pointer hover:border-primary/60
          transition-colors
        "
      >
        {SUPPORTED_LANGUAGES.map(({ code, nativeLabel }) => (
          <option
            key={code}
            value={code}
            className="bg-card text-foreground"
          >
            {nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
