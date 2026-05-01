import { useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import NoxPayAbi from "../../../artifacts/contracts/NoxPay.sol/NoxPay.json";

const NOXPAY_ADDRESS = (import.meta.env.VITE_NOXPAY_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export function useNoxPayContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const wrap = useCallback(
    (to: `0x${string}`, amount: string, decimals: number = 6) => {
      const value = parseUnits(amount, decimals);
      writeContract({
        address: NOXPAY_ADDRESS,
        abi: NoxPayAbi.abi,
        functionName: "wrap",
        args: [to, value],
        gas: 500000n,
      });
    },
    [writeContract]
  );

  const batchPayroll = useCallback(
    (to: `0x${string}`[], amounts: `0x${string}`[]) => {
      writeContract({
        address: NOXPAY_ADDRESS,
        abi: NoxPayAbi.abi,
        functionName: "batchConfidentialTransfer",
        args: [to, amounts],
        gas: 2000000n,
      });
    },
    [writeContract]
  );

  return {
    wrap,
    batchPayroll,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useUnderlyingToken() {
  const { data } = useReadContract({
    address: NOXPAY_ADDRESS,
    abi: NoxPayAbi.abi,
    functionName: "underlying",
  });
  return { underlying: data as `0x${string}` | undefined };
}

export function usePublicBalance(address?: `0x${string}`) {
  const { data, isLoading } = useReadContract({
    address: NOXPAY_ADDRESS,
    abi: NoxPayAbi.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  return { balance: data as bigint | undefined, isLoading };
}

export function useUnderlyingBalance(
  token?: `0x${string}`,
  address?: `0x${string}`
) {
  const { data, isLoading } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: token && address ? [address] : undefined,
    query: { enabled: !!token && !!address },
  });
  return { balance: data as bigint | undefined, isLoading };
}

export function useConfidentialBalance(address?: `0x${string}`) {
  const { data, isLoading } = useReadContract({
    address: NOXPAY_ADDRESS,
    abi: NoxPayAbi.abi,
    functionName: "confidentialBalanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  return { balanceHandle: data as `0x${string}` | undefined, isLoading };
}

export function useTokenAllowance(
  token?: `0x${string}`,
  owner?: `0x${string}`,
  spender?: `0x${string}`
) {
  const { data, isLoading } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: token && owner && spender ? [owner, spender] : undefined,
    query: { enabled: !!token && !!owner && !!spender },
  });
  return { allowance: data as bigint | undefined, isLoading };
}

export function useApproveToken() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const approve = useCallback(
    (token: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
      writeContract({
        address: token,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, amount],
        gas: 100000n,
      });
    },
    [writeContract]
  );

  return { approve, hash, isPending, isConfirming, isConfirmed };
}
