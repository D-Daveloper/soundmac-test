export const defaultContext = {
  layoutHeaderMessage: "",
  setLayoutHeaderMessage: () => {},
  openUpgradePopUp: false,
  setOpenUpgradePopUp: () => {},
  isPremium: false,
  header: {
    title: "",
    showBackButton: false,
    onBack: undefined,
  },
  setHeader: (_header: {
    title: string;
    showBackButton: boolean;
    onBack?: () => void;
  }) => {},
  showGraceReminder: false,
  setShowGraceReminder: () => {},

  dismissGraceReminder: () => {},
  // getUser: () => { },
  // hamburgerOpen: false,
  // logOut: () => { },
  // handleAPIError: () => { },
  // token: null
};
