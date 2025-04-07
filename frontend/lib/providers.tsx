'use client';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { http, WagmiProvider } from 'wagmi';
import {
  mainnet,
  sepolia
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { createPublicClient } from 'viem';


const config = getDefaultConfig({
  appName: 'NEFLEX',
  projectId: "32522fd5c90e00ebed68a076821dc239",
  chains: [mainnet, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
  transports: {
    // [sepolia.id]: http(`https://rpc.ankr.com/eth_sepolia/${process.env.RPC_ID}`)
        [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL)

  }
});

const queryClient = new QueryClient();

export const SUPPORTED_NETWORK = {
  id: 11155111,  // Sepolia
  name: 'Sepolia',
  rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.drpc.org',
    'https://eth-sepolia.public.blastapi.io' ]
};

// Create a public client
export const publicClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL)
})

export function RainbowProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}