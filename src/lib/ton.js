import { TonClient, TonTransaction, Cell, Address, fromNano } from "@ton/ton";

const TON_NETWORK = process.env.TON_NETWORK || "testnet";
const TON_API_KEY = process.env.TON_API_KEY;
const WALLET_ADDRESS_STRING = process.env.OWNER_WALLET;

const endpoint =
  TON_NETWORK === "mainnet"
    ? "https://toncenter.com/api/v2"
    : "https://testnet.toncenter.com/api/v2";

export async function verifyTransaction(signedBoc, userId) {
  try {
    // Decode the BOC to extract transaction details
    const cell = Cell.fromBase64(signedBoc);

    // Parse the sender address from the BOC
    const bocSender = Address.parseFriendly(
      cell.beginParse().loadAddress().toString()
    ).address.toString();

    const wallet = Address.parseFriendly(
      WALLET_ADDRESS_STRING
    ).address.toString();

    // Prepare query params to get transactions from the wallet address
    const queryParams = new URLSearchParams({
      address: WALLET_ADDRESS_STRING,
      limit: "100",
      to_lt: "0",
      archival: "false",
    }).toString();

    // Fetch transaction data from the testnet
    const response = await fetch(`${endpoint}/getTransactions?${queryParams}`, {
      method: "GET",
      headers: {
        "X-API-Key": TON_API_KEY,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch transactions:", response.statusText);
      return false;
    }

    const data = await response.json();
    // console.log("Transaction data:", JSON.stringify(data, null, 2));

    // Find the matching transaction based on sender, receiver, and amount
    const transaction = data.result.find((tx) => {
      // Ensure the `fromAddress` and `toAddress` are parsed correctly
      const fromAddress = Address.parseFriendly(
        tx.in_msg.source
      ).address.toString();
      const toAddress = Address.parseFriendly(
        tx.in_msg.destination
      ).address.toString();

      // Convert the transaction value from nano to the desired unit (assuming '0.1' is in TON)
      const amount = fromNano(tx.in_msg.value); // fromNano() is assumed to be a utility function

      console.log("bocSender:", bocSender);
      console.log("fromAddress:", fromAddress);
      // Check if the transaction matches the criteria
      if (
        toAddress === wallet && // Check if the destination is the wallet address
        fromAddress === bocSender && // Check if the sender matches the bocSender
        amount === "0.1" // Check if the transaction amount matches 0.1 TON
      ) {
        console.log(
          "✅ Matched transaction: sender, receiver, and amount are valid."
        );
        return true;
      }
      return false;
    });

    if (!transaction) {
      console.error("No matching transaction found");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Transaction verification error:", error);
    return false;
  }
}
