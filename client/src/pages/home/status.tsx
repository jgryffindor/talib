import { Spinner, Stack } from "@liftedinit/ui";
import { useQuery } from "@tanstack/react-query";

import { getNeighborhood } from "api";
import { Stat } from "ui";
import { STALE_INTERVAL, REFRESH_INTERVAL } from "utils";

export function NeighborhoodStatus({ id }: { id: number }) {
  const query = useQuery(["neighborhoods", id], getNeighborhood(id),
    {
      staleTime: STALE_INTERVAL,
      refetchInterval: REFRESH_INTERVAL,
    },
  );

  const height = query.data?.latestBlockHeight.toLocaleString();
  const txnCount = query.data?.totalTransactionCount.toLocaleString();
  const status = query.isError ? "Unavailable" : "Available";

  return (
    <>
      {query.isLoading ? (
        <Spinner />
      ) : (
        <Stack direction="row" mt={6}>
          <Stat label="Height" value={height} />
          <Stat label="Transactions" value={txnCount} />
          <Stat label="Status" value={status} />
        </Stack>
      )}
    </>
  );
}
