import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import type { Account } from "@arkiv-network/sdk";

export const publicClient = createPublicClient({
  chain: braga,
  transport: http(),
});

export function createUserWalletClient(account: Account) {
  return createWalletClient({
    chain: braga,
    transport: http(),
    account,
  });
}

export { braga };
