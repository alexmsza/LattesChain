/**
 * Utilitário Centralizado de Conexão e Cluster da Solana
 * Suporta alternância determinística entre Devnet (Demo/Testes) e Mainnet-Beta (Produção Enterprise)
 */

export type SolanaNetwork = "devnet" | "mainnet-beta" | "localnet";

export interface ClusterConfig {
  network: SolanaNetwork;
  rpcUrl: string;
  fallbackRpcUrl?: string;
  sasProgramId: string;
  explorerBaseUrl: string;
  isMainnet: boolean;
}

/**
 * Obtém a configuração ativa do cluster Solana baseada em variáveis de ambiente
 */
export function getSolanaClusterConfig(): ClusterConfig {
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as SolanaNetwork;
  const isMainnet = network === "mainnet-beta";

  const defaultRpc = isMainnet
    ? "https://api.mainnet-beta.solana.com"
    : "https://api.devnet.solana.com";

  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || defaultRpc;
  const fallbackRpcUrl = process.env.SOLANA_FALLBACK_RPC_URL;

  // Program ID do Solana Attestation Service (SAS)
  const sasProgramId =
    process.env.SAS_PROGRAM_ID || "22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG";

  return {
    network,
    rpcUrl,
    fallbackRpcUrl,
    sasProgramId,
    explorerBaseUrl: "https://explorer.solana.com",
    isMainnet,
  };
}

/**
 * Retorna a URL do explorador da Solana para uma dada assinatura de transação
 */
export function getSolanaExplorerTxUrl(txSignature: string): string {
  const { isMainnet } = getSolanaClusterConfig();
  if (!txSignature) return "#";
  if (isMainnet) {
    return `https://explorer.solana.com/tx/${txSignature}`;
  }
  return `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
}

/**
 * Retorna a URL alternativa do Solscan para uma transação
 */
export function getSolscanTxUrl(txSignature: string): string {
  const { isMainnet } = getSolanaClusterConfig();
  if (!txSignature) return "#";
  if (isMainnet) {
    return `https://solscan.io/tx/${txSignature}`;
  }
  return `https://solscan.io/tx/${txSignature}?cluster=devnet`;
}

/**
 * Retorna a URL do explorador para uma conta/endereço público
 */
export function getSolanaExplorerAddressUrl(address: string): string {
  const { isMainnet } = getSolanaClusterConfig();
  if (!address) return "#";
  if (isMainnet) {
    return `https://explorer.solana.com/address/${address}`;
  }
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}
