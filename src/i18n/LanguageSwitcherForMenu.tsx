import { useTranslation } from "react-i18next";
import { useI18n as useCustomerI18n } from "@/i18n"; // Customer's custom i18n (for their own components)
import { SelectGray, SelectBeside } from "@tnbt/react-favorit-style";
import { icons } from "@/components/ui/icons/Icons";
import { useMainMenuStore } from "@/zustand/mainMenuCollapsed";
const LanguageSwitcherForMenu = () => {
  // Use react-i18next for package components
  const { i18n } = useTranslation();
  const { menuCollapsed } = useMainMenuStore();
  // Use customer's i18n for their own components
  const { setLocale: setCustomerLocale, t } = useCustomerI18n();

  const languageOptions = [
    { key: "en", label: t("language.english"), icon: icons["flag_rectangle"]["us"] },
    { key: "vi", label: t("language.vietnamese"), icon: icons["flag_rectangle"]["vn"] },
  ];

  const languageOptions_ForCollapsed = [
    { key: "en", label: t("language.english"), icon: icons["flag_rectangle"]["us"] },
    { key: "vi", label: t("language.vietnamese"), icon: icons["flag_rectangle"]["vn"] },
  ];

  const handleChange = (newLocale: string) => {
    // Update react-i18next (for package components)
    i18n.changeLanguage(newLocale);
    // Update customer's i18n (for their own components)
    setCustomerLocale(newLocale as "en" | "vi");
  };

  return (
    <div className="flex items-center justify-center">
      {!menuCollapsed && (
        <SelectBeside
          value={i18n.language}
          onChange={handleChange}
          options={languageOptions}
          size="sm"
          isUsePlaceHolder={false}
          isShowDropdownIcon={false}
          className="flex-1"
          buttonClassName="px-1! border-0 w-full bg-white"
        />
      )}
      {menuCollapsed && (
        <SelectBeside
          value={i18n.language}
          onChange={handleChange}
          options={languageOptions_ForCollapsed}
          size="sm"
          isUsePlaceHolder={false}
          buttonClassName="px-1! border-0 w-full bg-white"
          isShowDropdownIcon={false}
          lableHidden={true}
        />
      )}
    </div>
  );
};

export default LanguageSwitcherForMenu;
