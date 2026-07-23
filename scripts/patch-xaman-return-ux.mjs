import fs from "node:fs";

const file = "src/App.tsx";
let source = fs.readFileSync(file, "utf8");

const startMarker = `  useEffect(() => {\n    const returnState = getXamanReturnState();`;
const endMarker = `  }, [language]);`;
const start = source.indexOf(startMarker);
if (start < 0) throw new Error("Xaman return effect start not found.");
const end = source.indexOf(endMarker, start);
if (end < 0) throw new Error("Xaman return effect end not found.");

let effect = source.slice(start, end + endMarker.length);
effect = effect.replace(
  `          setActiveTab(returnState.returnTarget);\n          setWalletStatus(language === "en" ? "Wallet connected." : "Wallet gekoppeld.");`,
  `          goTo(returnState.returnTarget);\n          setWalletStatus(\n            language === "en"\n              ? "Xaman transaction verified."\n              : "Xaman-transactie geverifieerd.",\n          );`,
);
effect = effect.replaceAll(`          setActiveTab("xaman");`, `          goTo("xaman");`);

if (!effect.includes(`goTo(returnState.returnTarget);`)) {
  throw new Error("Successful Xaman return navigation was not patched.");
}
if (effect.includes(`setActiveTab("xaman");`)) {
  throw new Error("One or more Xaman fallback routes were not patched.");
}

source = source.slice(0, start) + effect + source.slice(end + endMarker.length);
fs.writeFileSync(file, source);
console.log("Patched generic Xaman return UX and URL synchronization.");
