import type { XrplNetwork } from "./walletRegistry";

export function resolveXamanNetwork(networkType: unknown, networkId: unknown): XrplNetwork {
  const types: Record<string, XrplNetwork> = { MAINNET: "mainnet", TESTNET: "testnet", DEVNET: "devnet" };
  const ids: Record<number, XrplNetwork> = { 0: "mainnet", 1: "testnet", 2: "devnet" };
  const type = typeof networkType === "string" ? networkType.trim().toUpperCase() : "";
  const hasId = networkId !== undefined && networkId !== null;
  const byType = Object.hasOwn(types, type) ? types[type] : undefined;
  const byId = typeof networkId === "number" && Object.hasOwn(ids, networkId) ? ids[networkId] : undefined;
  if ((type && !byType) || (hasId && !byId) || (!byType && !byId) || (byType && byId && byType !== byId)) {
    throw new Error("The selected Xaman network is unsupported or could not be verified. Select XRPL Mainnet, Testnet or Devnet, then close and reopen OTT.");
  }
  return (byType ?? byId)!;
}
