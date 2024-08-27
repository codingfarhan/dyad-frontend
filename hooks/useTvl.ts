import { useQuery, gql } from "@apollo/client";
import { useMemo } from "react";
import { formatEther } from "viem";

export default function useTvl() {
  const GET_ITEMS = gql`
    query {
      tvls(orderBy: "id", orderDirection: "desc", limit: 1) {
        items {
          tvl
        }
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_ITEMS, { fetchPolicy: 'network-only' });

  const formattedTvl = useMemo(() => {
    const rawTvl = data?.tvls?.items[0]?.tvl;
    if (rawTvl === undefined) {
      return 0;
    }

    return Number(formatEther(rawTvl));
  }, [data])

  return { tvl: formattedTvl, isLoading: loading, error };
}
