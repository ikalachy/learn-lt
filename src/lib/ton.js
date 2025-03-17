import { HttpApi, loadTransaction, Cell } from "@ton/ton";

const TON_NETWORK = process.env.TON_NETWORK || "testnet";
const TON_API_KEY = process.env.TON_API_KEY;

const endpoint =
  TON_NETWORK === "mainnet"
    ? "https://toncenter.com/api/v2/jsonRPC"
    : "https://testnet.toncenter.com/api/v2/jsonRPC";

const client = new HttpApi({
  endpoint,
  apiKey: TON_API_KEY,
});

export async function verifyTransaction(signedBoc, userId) {
  try {
    // Decode the transaction
    const transaction = loadTransaction(
      Cell.fromBoc(Buffer.from(signedBoc, "base64"))[0].beginParse()
    );
    console.log(JSON.stringify(transaction, null, 2));

    // Verify the destination address matches our wallet
    const destinationAddress = transaction.address;
    const message = transaction.inMessage;
    console.log(JSON.stringify(message, null, 2));
    const expectedAddress = process.env.OWNER_WALLET;

    if (destinationAddress !== expectedAddress) {
      console.error("Invalid destination address:", destinationAddress);
      return false;
    }

    // // Verify the amount matches our expected price
    // const amount = message.amount;
    // const expectedAmount = BigInt(0.1 * 1e9); // 0.1 TON in nanotons

    // if (amount < expectedAmount) {
    //   console.error("Invalid amount:", amount);
    //   return false;
    // }

    // // Verify the comment matches our expected format
    // const comment = message.comment;
    // const expectedComment = `premium_${userId}`;

    // if (comment !== expectedComment) {
    //   console.error("Invalid comment:", comment);
    //   return false;
    // }

    return true;
  } catch (error) {
    console.error("Transaction verification error:", error);
    return false;
  }
}
