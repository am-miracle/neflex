  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const extractTokenIdFromReceipt = (receipt: any): string | null => {
    // Implement logic to extract the tokenId from the transaction receipt
    // This will depend on how your contract emits events and how the receipt is structured
    // For example, if your contract emits a `Transfer` event with the tokenId, you can extract it from there
    // Here's a placeholder implementation:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transferEvent = receipt.logs.find((log: any) => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');
    if (transferEvent) {
      const tokenId = BigInt(transferEvent.topics[3]).toString();
      return tokenId;
    }
    return null;
  };

export const shortenAddress = (address: string | undefined) => {
    if(!address) return "connect wallet";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};