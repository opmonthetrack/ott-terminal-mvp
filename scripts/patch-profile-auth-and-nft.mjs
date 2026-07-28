import fs from "node:fs";

const walletPath = "src/tabs/WalletTab.tsx";
const authPath = "src/lib/ottAuth.ts";
const galleryPath = "src/components/NftCollectionGallery.tsx";

let wallet = fs.readFileSync(walletPath, "utf8");
let auth = fs.readFileSync(authPath, "utf8");
let gallery = fs.readFileSync(galleryPath, "utf8");

const oldNftImport = `import {
  formatNftSerial,
  getNftIssuanceSummary,
  NFT_ISSUANCE_LIMITS,
} from "../lib/nftIssuanceStore";`;
const newNftImport = `import { NftCollectionGallery } from "../components/NftCollectionGallery";`;

if (wallet.includes(oldNftImport)) {
  wallet = wallet.replace(oldNftImport, newNftImport);
}

wallet = wallet.replace(
  `  const accessPass = useMemo(() => getNftIssuanceSummary("access-pass"), []);\n  const certificate = useMemo(() => getNftIssuanceSummary("foundation-certificate"), []);\n`,
  "",
);

const oldNftSection = `        <section className="mt-8 rounded-3xl border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                {isEnglish ? "NFT issuance foundation" : "NFT-uitgiftefundament"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                {isEnglish ? "Separate editions, controlled status and no duplicate serials." : "Gescheiden edities, gecontroleerde status en geen dubbele nummers."}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              {isEnglish
                ? "An NFT is never created merely by pressing a UI button. Eligibility, wallet ownership, metadata and the validated mint transaction must agree."
                : "Een NFT ontstaat nooit alleen door op een knop te drukken. Geschiktheid, walletbezit, metadata en de gevalideerde minttransactie moeten overeenkomen."}
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <EditionCard
              title={NFT_ISSUANCE_LIMITS["access-pass"].label}
              range="#001–#500"
              nextSerial={accessPass.nextSerial ? formatNftSerial("access-pass", accessPass.nextSerial) : "Full"}
              issued={accessPass.issued}
              reserved={accessPass.reserved}
              available={accessPass.available}
              isEnglish={isEnglish}
            />
            <EditionCard
              title={NFT_ISSUANCE_LIMITS["foundation-certificate"].label}
              range="#00001–#50000"
              nextSerial={certificate.nextSerial ? formatNftSerial("foundation-certificate", certificate.nextSerial) : "Full"}
              issued={certificate.issued}
              reserved={certificate.reserved}
              available={certificate.available}
              isEnglish={isEnglish}
            />
          </div>
        </section>`;

if (wallet.includes(oldNftSection)) {
  wallet = wallet.replace(oldNftSection, `        <NftCollectionGallery compact />`);
}

wallet = wallet.replace(
  `                  disabled={busy}\n                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"`,
  `                  disabled={busy || !provider.enabled}\n                  title={!provider.enabled ? (isEnglish ? "Provider not activated in Supabase yet" : "Provider nog niet geactiveerd in Supabase") : undefined}\n                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-100"`,
);

wallet = wallet.replace(
  `                  {provider.label}\n`,
  `                  {provider.label}{!provider.enabled ? (isEnglish ? " · soon" : " · binnenkort") : ""}\n`,
);

auth = auth.replace(
  `export function getEnabledOttAuthProviders() {\n  return OTT_AUTH_PROVIDER_OPTIONS.filter((provider) => provider.enabled);\n}`,
  `export function getEnabledOttAuthProviders() {\n  return OTT_AUTH_PROVIDER_OPTIONS;\n}`,
);

gallery = gallery.replaceAll(".webp", ".png");
gallery = gallery.replace(
  `                loading="lazy"\n                className="aspect-[1055/1491] w-full object-cover"`,
  `                loading="lazy"\n                onError={(event) => {\n                  event.currentTarget.onerror = null;\n                  event.currentTarget.src = "/logo.png";\n                  event.currentTarget.className = "aspect-[1055/1491] w-full bg-slate-950 object-contain p-12";\n                }}\n                className="aspect-[1055/1491] w-full object-cover"`,
);
gallery = gallery.replace(
  `            ? "The full-resolution PNG masters remain the source artwork. These optimized previews keep the terminal fast on mobile without changing the NFT design."\n            : "De PNG-masters op volledige resolutie blijven het bronartwork. Deze geoptimaliseerde previews houden de terminal snel op mobiel zonder het NFT-ontwerp te wijzigen."}`,
  `            ? "The exact PNG masters in public/nft/artwork are used as the collection previews. Missing files fall back to the OTT mark instead of showing a broken image."\n            : "De exacte PNG-masters in public/nft/artwork worden als collectiepreview gebruikt. Ontbrekende bestanden vallen terug op het OTT-logo in plaats van een kapotte afbeelding."}`,
);

fs.writeFileSync(walletPath, wallet);
fs.writeFileSync(authPath, auth);
fs.writeFileSync(galleryPath, gallery);
