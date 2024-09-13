"use client";

import { reservoirChains } from "@reservoir0x/reservoir-sdk";
import { ThemeProvider } from "@/components/theme-provider";
import {
  Client,
  Provider as UrqlProvider,
  cacheExchange,
  fetchExchange,
} from "urql";
import { NextUIProvider } from "@nextui-org/react";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalProvider } from "@/contexts/modal";
import { ApolloProvider, InMemoryCache, ApolloClient } from "@apollo/client";
import { ReservoirKitProvider, darkTheme } from "@reservoir0x/reservoir-kit-ui";
import { RainbowKitProvider, darkTheme as rainbowKitDark } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

const client = new Client({
  url: process.env.NEXT_PUBLIC_SUBGRAPH_URL ?? "",
  exchanges: [cacheExchange, fetchExchange],
});

const apolloClient = new ApolloClient({
  uri: "https://dyad-indexer-v2-production.up.railway.app/",
  // uri: "http://localhost:42069",
  cache: new InMemoryCache(),
});

const theme = darkTheme({
  font: "Inter, sans-serif",
  borderRadius: "5px",
});

const rainbowKitTheme = rainbowKitDark({
  accentColor: "#ffffff",
  accentColorForeground: "#282828",
})

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ApolloProvider client={apolloClient}>
          <WagmiProvider config={wagmiConfig}>
            <ReservoirKitProvider
              options={{
                apiKey: process.env.NEXT_PUBLIC_RESERVOIR_API_KEY,
                chains: [{ ...reservoirChains.mainnet, active: true }],
                source: "app.dyadstable.xyz",
              }}
              theme={theme}
            >
              <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={rainbowKitTheme}>
                  <UrqlProvider value={client}>
                    <ModalProvider>{children}</ModalProvider>
                  </UrqlProvider>
                </RainbowKitProvider>
              </QueryClientProvider>
            </ReservoirKitProvider>
          </WagmiProvider>
        </ApolloProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
};
