"use client"
import React, { useState, useEffect, useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
import Link from 'next/link'
import NftCard from './NftCard'
import Owner from "../assets/owner.svg"
import { getClient } from '@/lib/apollo-client'
import { GET_ALL_COLLECTIONS } from '@/lib/queries'

interface NFTGridProps {
    className?: string;
}

interface Collection {
  id: string;
  name: string;
  symbol: string;
  baseTokenURI: string;
  maxSupply: string;
  creator: string;
  collectionAddress: string;
  blockTimestamp: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Record<string, string>;
}

interface NFT {
  id: string;
  tokenId: number;
  collection: string;
  collectionName: string;
  metadata: NFTMetadata;
  owner: string;
}

const AllNfts = ({ className }: NFTGridProps) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Fetch collections using GraphQL
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data } = await getClient().query({
          query: GET_ALL_COLLECTIONS,
        });
        console.log("Found collections:", data.collectionCreateds);
        setCollections(data.collectionCreateds);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, []);

  // Get collection details (token count)
  const { data: collectionsData } = useReadContracts({
    contracts: collections.map(collection => ({
      address: collection.collectionAddress as `0x${string}`,
      abi: NFT_COLLECTION_ABI,
      functionName: 'getTokenCount',
    })),
  });

  console.log("Collections data:", collectionsData);

  // Prepare token data reading contracts
  const tokenDataContracts = useMemo(() => {
    if (!collectionsData) return [];

    return collections.map((collection, i) => {
      const tokenCount = Number(collectionsData[i]?.result || 0);
      
      return Array.from({ length: tokenCount }, (_, tokenId) => [
        {
          address: collection.collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        },
        {
          address: collection.collectionAddress as `0x${string}`,
          abi: NFT_COLLECTION_ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        },
      ]).flat();
    }).flat();
  }, [collections, collectionsData]);

  // Read all token data at once
  const { data: tokenData } = useReadContracts({
    contracts: tokenDataContracts,
  });

  console.log("Token data:", tokenData);

  // Fetch NFT metadata from IPFS
  const fetchIPFSMetadata = async (uri: string): Promise<NFTMetadata> => {
    try {
      const hash = uri.split('ipfs://').pop() as string;
      const gatewayUrl = `https://ipfs.io/ipfs/${hash}`;
      
      const response = await fetch(gatewayUrl);
      const metadata = await response.json();
      
      if (metadata.image?.startsWith('ipfs://')) {
        const imageHash = metadata.image.replace('ipfs://', '');
        metadata.image = `https://ipfs.io/ipfs/${imageHash}`;
      }
      
      return metadata;
    } catch (error) {
      console.error('Error fetching IPFS metadata:', error);
      return {
        name: 'Unknown NFT',
        description: 'Metadata unavailable',
        image: '/placeholder.png',
      }
    }
  };

  useEffect(() => {
    const fetchAllNFTs = async () => {
      if (!collectionsData || !tokenData || collections.length === 0) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);

      try {
        const nftPromises: Promise<NFT | null>[] = [];
        let tokenDataIndex = 0;

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i];
          const tokenCount = Number(collectionsData[i]?.result || 0);

          for (let tokenId = 0; tokenId < tokenCount; tokenId++) {
            const tokenURI = tokenData[tokenDataIndex]?.result as string;
            const owner = tokenData[tokenDataIndex + 1]?.result as string;
            tokenDataIndex += 2;

            if (tokenURI) {
              nftPromises.push((async () => {
                const metadata = await fetchIPFSMetadata(tokenURI);
                return {
                  id: `${collection.collectionAddress}-${tokenId}`,
                  tokenId,
                  collection: collection.collectionAddress,
                  collectionName: collection.name,
                  metadata,
                  owner
                };
              })());
            }
          }
        }

        const fetchedNFTs = (await Promise.all(nftPromises)).filter((nft): nft is NFT => nft !== null);
        console.log("Fetched NFTs:", fetchedNFTs);
        setNfts(fetchedNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllNFTs();
  }, [collections, collectionsData, tokenData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:py-20 lg:py-20 ${className}`}>
      {nfts.map((nft) => {
        const metadata = nft.metadata;
        const imageUrl = metadata?.image;

        return (
          <Link
            href={`/nft/${nft.collection}/${nft.tokenId}`}
            key={nft.id}
          >
            <NftCard
              name={metadata?.name || 'Unnamed NFT'}
              image={imageUrl || "/placeholder.png"}
              owner={nft.owner}
              ownerImage={Owner}
              className={className}
            />
          </Link>
        );
      })}
      {nfts.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">No NFTs found in any collections</p>
        </div>
      )}
    </div>
  );
}

export default AllNfts