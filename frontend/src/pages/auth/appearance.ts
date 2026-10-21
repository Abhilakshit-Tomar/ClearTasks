/** Clerk keeps password recovery, verification, and secondary factors in its supported flow. */
export function authAppearance(dark: boolean) {
  return {
    variables: {
      colorPrimary: dark ? "#a2ceb7" : "#24634b",
      colorBackground: dark ? "#1e2421" : "#fffefa",
      colorText: dark ? "#f0eee5" : "#252c28",
      colorTextSecondary: dark ? "#a8b3ac" : "#606b63",
      colorInputBackground: dark ? "#181e1b" : "#fffefa",
      colorInputText: dark ? "#f0eee5" : "#252c28",
      colorDanger: dark ? "#f3968d" : "#a52d27",
      fontFamily: '"Manrope Variable", sans-serif',
      borderRadius: "0.75rem",
    },
    elements: {
      rootBox: "w-full",
      cardBox: "w-full shadow-none",
      card: "w-full shadow-none border-0 bg-transparent px-0",
      headerTitle: "text-2xl font-semibold",
      headerSubtitle: "text-sm leading-relaxed",
      formButtonPrimary:
        "studio-button studio-button-primary min-h-11 font-semibold normal-case text-sm shadow-none",
      formFieldInput: "min-h-11 shadow-none",
      footer: "bg-transparent",
      footerActionLink: "font-semibold",
    },
  };
}
