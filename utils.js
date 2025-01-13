import dotenv from "dotenv";
dotenv.config();

export async function hasTokenBeenDone(token) {
  const res = await fetch(`https://frontend-api-v2.pump.fun/coins?offset=0&limit=50&sort=market_cap&includeNsfw=true&order=DESC&searchTerm=${token.name}`);
  const data = await res.json();
  return data.filter((e) => e.mint !== token.mint).some((e) => e.twitter === token.detail.twitter && e.website === token.detail.website);
}

export async function isDevHolding(token) {
  const headers = { origin: "https://pump.fun", referrer: "https://pump.fun" };
  const body = JSON.stringify({
    method: "getTokenLargestAccounts",
    jsonrpc: "2.0",
    params: [
      `${token.mint}`,
      {
        commitment: "confirmed",
      },
    ],
    id: "e0e89697-75ee-4575-84d8-b8e026fd144c",
  });
  const res = await fetch(`https://pump-fe.helius-rpc.com/?api-key=${process.env.PUMP_FUN_API_KEY}`, { headers, method: "POST", body });
  const data = await res.json();
  return data.result.value.some((e) => e.address === token.traderPublicKey);
}
