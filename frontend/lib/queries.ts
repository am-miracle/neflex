import { gql, DocumentNode } from '@apollo/client';


export const GET_CATEGORIES: DocumentNode = gql`
  query GetCategories {
    categoryAddeds(first: 100, orderBy: timestamp) {
      id
      category
      name
      timestamp
    }
  }
`;

export const GET_NFTS_BY_CATEGORY: DocumentNode = gql`
  query GetNFTsByCategory($categoryId: Bytes!, $first: Int!, $skip: Int!) {
    itemListeds(
      where: { category: $categoryId }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      seller
      nftAddress
      tokenId
      price
      category
      collectionName
      timestamp
    }
  }
`;

export const GET_NFT_HISTORY = gql`
  query GetNFTHistory($tokenId: ID!, $nftAddress: String!) {
    token(id: $tokenId) {
      id
      transfers {
        from
        to
        timestamp
      }
      listings {
        seller
        price
        isAuction
        timestamp
      }
      bids {
        bidder
        amount
        timestamp
      }
    }
  }
`;

export const GET_ALL_NFTS = gql`
  query GetAllNFTs($first: Int!, $skip: Int!) {
    tokenMinteds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      to
      tokenId
      tokenURI
      royaltyFee
      blockNumber
      blockTimestamp
      transactionHash
    }
    itemListeds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      seller
      nftAddress
      tokenId
      price
      isAuction
      category
      timestamp
      collectionName
      creator
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`

export const GET_NFT_DETAILS = gql`
  query GetNFTDetails($tokenId: String!) {
    tokenMinteds(where: { tokenId: $tokenId }, first: 1) {
      id
      to
      tokenId
      tokenURI
      royaltyFee
      blockTimestamp
      transactionHash
    }
    itemListeds(where: { tokenId: $tokenId }, orderBy: blockTimestamp, orderDirection: desc, first: 1) {
      id
      seller
      nftAddress
      tokenId
      price
      isAuction
      category
      collectionName
      creator
      blockTimestamp
    }
  }
`

export const GET_CREATOR_NFTS = gql`
  query GetCreatorNFTs($creator: String!, $currentTokenId: String!) {
    itemListeds(
      where: { creator: $creator, tokenId_not: $currentTokenId }
      orderBy: blockTimestamp
      orderDirection: desc
      first: 9
    ) {
      id
      seller
      nftAddress
      tokenId
      price
      isAuction
      category
      collectionName
      creator
      blockTimestamp
    }
  }
`

export const GET_COLLECTIONS = gql`
  query GetCollections($first: Int!, $skip: Int!) {
    collectionCreateds(
      first: $first
      skip: $skip
      orderBy: blockTimestamp
      orderDirection: desc
    ) {
      id
      name
      symbol
      baseTokenURI
      maxSupply
      creator
      collectionAddress
      blockTimestamp
    }
  }
`
