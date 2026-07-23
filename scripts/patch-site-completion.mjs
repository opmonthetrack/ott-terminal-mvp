import fs from "node:fs";

const appPath = "src/App.tsx";
let app = fs.readFileSync(appPath, "utf8");

function replaceOnce(source, search, replacement, label) {
  const first = source.indexOf(search);
  if (first < 0) throw new Error(`Patch anchor not found: ${label}`);
  if (source.indexOf(search, first + search.length) >= 0) {
    throw new Error(`Patch anchor is not unique: ${label}`);
  }
  return source.replace(search, replacement);
}

if (!app.includes('id: "ottintelligence",\n          label: "OTT Intelligence"')) {
  const newsAnchor = `        {
          id: "news",
          label: isEnglish ? "Newsroom" : "Nieuwsruimte",
          description: isEnglish
            ? "Turn verified information into content."
            : "Zet geverifieerde informatie om in content.",
        },
        {
          id: "roadmap",`;

  const newsWithIntelligence = `        {
          id: "news",
          label: isEnglish ? "Newsroom" : "Nieuwsruimte",
          description: isEnglish
            ? "Turn verified information into content."
            : "Zet geverifieerde informatie om in content.",
        },
        {
          id: "ottintelligence",
          label: "OTT Intelligence",
          description: isEnglish
            ? "Follow the terminal's verified research and operational signals."
            : "Volg geverifieerd onderzoek en operationele signalen van de terminal.",
        },
        {
          id: "roadmap",`;

  app = replaceOnce(app, newsAnchor, newsWithIntelligence, "public OTT Intelligence menu item");
}

app = app.replace('        { id: "ottintelligence", label: "OTT Intelligence" },\n', "");

if (!app.includes("function getInitialActiveTab()")) {
  const routeAnchor = `function getAllRouteItems(language: TerminalLanguage): MenuItem[] {
  return [...getCoreMenuGroups(language), ...getFounderMenuGroups(language)].flatMap(
    (group) => group.items,
  );
}

function getPrimaryNavigation`;

  const routeReplacement = `function getAllRouteItems(language: TerminalLanguage): MenuItem[] {
  return [...getCoreMenuGroups(language), ...getFounderMenuGroups(language)].flatMap(
    (group) => group.items,
  );
}

function getInitialActiveTab(): ActiveTab {
  if (typeof window === "undefined") {
    return "home";
  }

  const params = new URLSearchParams(window.location.search);

  if (params.get("support_payment_return") === "1") {
    return "support";
  }

  if (
    params.get("access_payment_return") === "1" ||
    params.get("access_accept_return") === "1"
  ) {
    return "accessgate";
  }

  const requestedTab = params.get("tab");
  if (!requestedTab) {
    return "home";
  }

  const founderMode = params.get("founder") === "1";
  const allowedItems = founderMode
    ? getAllRouteItems("en")
    : getCoreMenuGroups("en").flatMap((group) => group.items);

  return allowedItems.some((item) => item.id === requestedTab)
    ? requestedTab as ActiveTab
    : "home";
}

function getPrimaryNavigation`;

  app = replaceOnce(app, routeAnchor, routeReplacement, "initial URL route resolver");
}

app = app.replace(
  'const [activeTab, setActiveTab] = useState<ActiveTab>("home");',
  'const [activeTab, setActiveTab] = useState<ActiveTab>(() => getInitialActiveTab());',
);

if (!app.includes('window.addEventListener("popstate", syncFromHistory);')) {
  const accountAnchor = `  const accountName = getOttAccountName(user);

  useEffect(() => {
    const refreshAccess`;

  const accountReplacement = `  const accountName = getOttAccountName(user);

  useEffect(() => {
    const initialTab = activeTab;
    const url = new URL(window.location.href);

    if (initialTab !== "home" && !url.searchParams.has("tab")) {
      url.searchParams.set("tab", initialTab);
      window.history.replaceState({}, document.title, url.toString());
    }

    const syncFromHistory = () => setActiveTab(getInitialActiveTab());
    window.addEventListener("popstate", syncFromHistory);

    return () => window.removeEventListener("popstate", syncFromHistory);
  }, []);

  useEffect(() => {
    document.title = activeTab === "home"
      ? "OTT Terminal | XRPL learning platform"
      : (activeItem?.label ?? "OTT") + " | OTT Terminal";
  }, [activeItem?.label, activeTab]);

  useEffect(() => {
    const refreshAccess`;

  app = replaceOnce(app, accountAnchor, accountReplacement, "history and document title synchronization");
}

if (!app.includes('window.history.pushState({}, document.title, url.toString());')) {
  const goToAnchor = `  function goTo(target: ActiveTab) {
    setAccessUnlocked(getAccessUnlocked(walletAddress));
    setActiveTab(target);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }`;

  const goToReplacement = `  function goTo(target: ActiveTab) {
    setAccessUnlocked(getAccessUnlocked(walletAddress));
    setActiveTab(target);
    setMenuOpen(false);

    const url = new URL(window.location.href);
    if (target === "home") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", target);
    }
    window.history.pushState({}, document.title, url.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }`;

  app = replaceOnce(app, goToAnchor, goToReplacement, "URL-aware navigation");
}

fs.writeFileSync(appPath, app);
console.log("Patched src/App.tsx with 17 public routes and URL-aware Xaman return navigation.");
