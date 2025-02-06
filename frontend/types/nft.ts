
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