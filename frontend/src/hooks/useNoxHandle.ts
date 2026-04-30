import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { createViemHandleClient, type HandleClient } from "@iexec-nox/handle";

export function useNoxHandle() {
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<HandleClient | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletClient) {
      setClient(null);
      setReady(false);
      return;
    }
    setError(null);
    createViemHandleClient(walletClient)
      .then((c) => {
        setClient(c);
        setReady(true);
      })
      .catch((e) => {
        setError(e?.message || "Failed to initialize Nox Handle");
        setReady(false);
      });
  }, [walletClient]);

  return { client, ready, error };
}
