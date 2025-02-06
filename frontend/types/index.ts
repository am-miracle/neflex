export interface CategoryAdded {
  id: string;
  category: string;
  name: string;
  timestamp: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Record<string, string>;
}

export interface NFT {
  id: string;
  tokenId: number;
  collection: string;
  collectionName: string;
  metadata: NFTMetadata;
  owner?: string;
  listing?: string;
}



export interface Collection {
  address: string
  name: string
  symbol: string
  baseTokenURI: string
  maxSupply: bigint
  tokenCount: bigint
}