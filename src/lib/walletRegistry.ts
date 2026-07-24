export type WalletProviderId =
  | "xaman"
  | "crossmark"
  | "gemwallet"
  | "walletconnect"
  | "joey"
  | "katz"
  | "metamask-xrpl"
  | "ledger"
  | "read-only";

export type XrplNetwork = "mainnet" | "testnet" | "devnet";
export type WalletConnectionType = "xaman-payload" | "browser-extension" | "walletconnect" | "snap" | "hardware" | "read-only";
export type WalletSupportLevel = "live" | "beta" | "planned" | "education";
export type WalletVerificationMethod = "signed" | "provider" | "read-only";

export type WalletProvider = {
  id: WalletProviderId;
  name: string;
  badge: string;
  accent: string;
  connectionType: WalletConnectionType;
  supportLevel: WalletSupportLevel;
  custody: "self-custody" | "hardware" | "none";
  platforms: string[];
  networks: XrplNetwork[];
  capabilities: Array<"connect" | "sign" | "submit" | "nft" | "tokens" | "walletconnect" | "read-only">;
  connectorId?: "xaman" | "crossmark" | "gemwallet" | "walletconnect" | "metamask-xrpl" | "ledger";
  website: string;
  docs?: string;
  description: { en: string; nl: string };
  limitation?: { en: string; nl: string };
};

export const WALLET_REGISTRY: WalletProvider[] = [
  {
    id: "xaman",
    name: "Xaman",
    badge: "X",
    accent: "#173bdb",
    connectionType: "xaman-payload",
    supportLevel: "live",
    custody: "self-custody",
    platforms: ["iOS", "Android", "xApp"],
    networks: ["mainnet", "testnet", "devnet"],
    capabilities: ["connect", "sign", "submit", "nft", "tokens"],
    connectorId: "xaman",
    website: "https://xaman.app",
    docs: "https://docs.xaman.dev",
    description: {
      en: "Mobile XRPL wallet and xApp environment. OTT already verifies Xaman sign requests and return routes.",
      nl: "Mobiele XRPL-wallet en xApp-omgeving. OTT verifieert Xaman-ondertekenverzoeken en terugkeerroutes al.",
    },
  },
  {
    id: "crossmark",
    name: "CROSSMARK",
    badge: "C",
    accent: "#ef3340",
    connectionType: "browser-extension",
    supportLevel: "beta",
    custody: "self-custody",
    platforms: ["Chrome", "Edge", "Brave"],
    networks: ["mainnet", "testnet", "devnet"],
    capabilities: ["connect", "sign", "submit", "nft", "tokens"],
    connectorId: "crossmark",
    website: "https://crossmark.io",
    docs: "https://docs.crossmark.io",
    description: {
      en: "Browser extension for signing and submitting native XRPL transactions without exposing private keys.",
      nl: "Browserextensie voor het ondertekenen en indienen van native XRPL-transacties zonder private keys bloot te stellen.",
    },
  },
  {
    id: "gemwallet",
    name: "GemWallet",
    badge: "G",
    accent: "#11a7e8",
    connectionType: "browser-extension",
    supportLevel: "beta",
    custody: "self-custody",
    platforms: ["Chrome", "Edge", "Brave"],
    networks: ["mainnet", "testnet", "devnet"],
    capabilities: ["connect", "sign", "submit", "nft", "tokens"],
    connectorId: "gemwallet",
    website: "https://gemwallet.app",
    docs: "https://gemwallet.app/docs",
    description: {
      en: "Browser wallet with an official provider API for addresses, networks, messages, NFTs and XRPL transactions.",
      nl: "Browserwallet met een officiële provider-API voor adressen, netwerken, berichten, NFT’s en XRPL-transacties.",
    },
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    badge: "W",
    accent: "#2788f6",
    connectionType: "walletconnect",
    supportLevel: "planned",
    custody: "none",
    platforms: ["QR", "Mobile deep link"],
    networks: ["mainnet", "testnet"],
    capabilities: ["connect", "sign", "submit", "walletconnect"],
    connectorId: "walletconnect",
    website: "https://walletconnect.com",
    description: {
      en: "Connection protocol used by compatible mobile wallets. It is not itself a wallet and needs a Reown project configuration.",
      nl: "Verbindingsprotocol voor compatibele mobiele wallets. Het is zelf geen wallet en vereist een Reown-projectconfiguratie.",
    },
  },
  {
    id: "joey",
    name: "Joey Wallet",
    badge: "J",
    accent: "#ff5a36",
    connectionType: "walletconnect",
    supportLevel: "planned",
    custody: "self-custody",
    platforms: ["iOS", "Android", "WalletConnect"],
    networks: ["mainnet", "testnet"],
    capabilities: ["connect", "sign", "submit", "nft", "tokens", "walletconnect"],
    connectorId: "walletconnect",
    website: "https://joeywallet.xyz",
    docs: "https://docs.joeywallet.xyz",
    description: {
      en: "Self-custody mobile XRPL wallet that connects to dApps through WalletConnect.",
      nl: "Mobiele self-custody XRPL-wallet die via WalletConnect met dApps verbindt.",
    },
    limitation: {
      en: "Becomes directly connectable after OTT receives and configures a Reown project ID.",
      nl: "Wordt direct koppelbaar nadat OTT een Reown-project-ID heeft en configureert.",
    },
  },
  {
    id: "katz",
    name: "Katz Wallet",
    badge: "K",
    accent: "#24a8ff",
    connectionType: "walletconnect",
    supportLevel: "planned",
    custody: "self-custody",
    platforms: ["iOS", "Android", "WalletConnect"],
    networks: ["mainnet"],
    capabilities: ["connect", "sign", "submit", "nft", "tokens", "walletconnect"],
    connectorId: "walletconnect",
    website: "https://katzwallet.com",
    description: {
      en: "Mobile XRPL wallet with DEX, token and NFT features and WalletConnect support for dApps.",
      nl: "Mobiele XRPL-wallet met DEX-, token- en NFT-functies en WalletConnect-ondersteuning voor dApps.",
    },
    limitation: {
      en: "OTT will only mark this live after a WalletConnect session and signed Testnet transaction are verified.",
      nl: "OTT markeert dit pas als live nadat een WalletConnect-sessie en ondertekende Testnet-transactie zijn geverifieerd.",
    },
  },
  {
    id: "metamask-xrpl",
    name: "MetaMask XRPL Snap",
    badge: "M",
    accent: "#e2761b",
    connectionType: "snap",
    supportLevel: "planned",
    custody: "self-custody",
    platforms: ["MetaMask Flask/extension", "Snap"],
    networks: ["mainnet", "testnet", "devnet"],
    capabilities: ["connect", "sign", "submit", "nft", "tokens"],
    connectorId: "metamask-xrpl",
    website: "https://snaps.metamask.io/snap/npm/xrpl-snap/",
    docs: "https://snap-docs.xrplevm.org",
    description: {
      en: "Officially listed XRPL Snap that adds native XRP Ledger accounts and transaction signing to MetaMask.",
      nl: "Officieel vermelde XRPL Snap die native XRP Ledger-accounts en transactieondertekening aan MetaMask toevoegt.",
    },
  },
  {
    id: "ledger",
    name: "Ledger",
    badge: "L",
    accent: "#111827",
    connectionType: "hardware",
    supportLevel: "planned",
    custody: "hardware",
    platforms: ["Hardware", "Desktop"],
    networks: ["mainnet", "testnet"],
    capabilities: ["connect", "sign", "submit", "nft", "tokens"],
    connectorId: "ledger",
    website: "https://www.ledger.com/coin/wallet/xrp",
    description: {
      en: "Hardware-secured XRP account. Direct browser integration requires a reviewed transport and device confirmation flow.",
      nl: "Hardware-beveiligd XRP-account. Directe browserintegratie vereist een gecontroleerde transport- en apparaatbevestigingsflow.",
    },
  },
  {
    id: "read-only",
    name: "XRPL address",
    badge: "r",
    accent: "#475569",
    connectionType: "read-only",
    supportLevel: "live",
    custody: "none",
    platforms: ["Any wallet", "Any classic address"],
    networks: ["mainnet", "testnet", "devnet"],
    capabilities: ["read-only"],
    website: "https://xrpl.org/docs/introduction/crypto-wallets",
    description: {
      en: "Open any valid XRPL account as a public read-only profile. This never proves ownership and cannot sign.",
      nl: "Open ieder geldig XRPL-account als openbaar alleen-lezen profiel. Dit bewijst geen eigendom en kan niet ondertekenen.",
    },
  },
];

export function getWalletProvider(providerId: WalletProviderId) {
  return WALLET_REGISTRY.find((provider) => provider.id === providerId) ?? WALLET_REGISTRY[0];
}

export function isWalletProviderId(value: unknown): value is WalletProviderId {
  return typeof value === "string" && WALLET_REGISTRY.some((provider) => provider.id === value);
}

export function getWalletSupportLabel(level: WalletSupportLevel, language: "en" | "nl") {
  const labels = {
    live: { en: "Live", nl: "Live" },
    beta: { en: "Beta", nl: "Bèta" },
    planned: { en: "Next connector", nl: "Volgende connector" },
    education: { en: "Education", nl: "Educatie" },
  } as const;
  return labels[level][language];
}
