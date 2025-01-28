export interface TokenMinted {
  id: string
  to: string
  tokenId: string
  tokenURI: string
  royaltyFee: string
  blockTimestamp: string
  transactionHash: string
}

export interface TokenMintedResponse {
  tokenMinteds: TokenMinted[]
}

export interface NFTListing {
  id: string
  seller: string
  nftAddress: string
  tokenId: string
  price: string
  isAuction: boolean
  category: string
  collectionName: string
  creator: string
  blockTimestamp: string
  auctionEndTime?: string;
  highestBidder?: string;
  highestBid?: string;
}

export interface NFTListingsResponse {
  itemListeds: NFTListing[]
}

export interface CollectionCreated {
  id: string;
  name: string;
  symbol?: string;
  baseTokenURI: string;
  maxSupply?: string;
  creator: string;
  collectionAddress?: string;
  blockTimestamp?: string;
}