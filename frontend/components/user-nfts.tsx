"use client"
import React, { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from '@/constants/abis/NFTCollectionFactory'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
import Link from 'next/link'
import NftCard from './NftCard'
import Owner from "../assets/owner.svg"
import { NFT, NFTMetadata } from '@/types'

interface UserNftsProps {
  className?: string;
  creatorAddress: `0x${string}`;
}

// Create a public client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})

const UserNfts = ({ className, creatorAddress }: UserNftsProps) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchNFTs = async () => {
      try {
        setIsLoading(true);

        // Get default collection and user collections
        const [defaultCollection, userCollections] = await Promise.all([
          publicClient.readContract({
            address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
            abi: NFT_COLLECTION_FACTORY_ABI,
            functionName: 'getDefaultCollection',
          }),
          publicClient.readContract({
            address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
            abi: NFT_COLLECTION_FACTORY_ABI,
            functionName: 'getCreatorCollections',
            args: [creatorAddress],
          }),
        ]);

        // Combine all collections
        const allCollections = [
          ...(defaultCollection ? [defaultCollection] : []),
          ...(userCollections || []),
        ];

        const nftPromises: Promise<NFT | null>[] = [];

        // Process each collection
        for (const collection of allCollections) {
          try {
            // Get collection name and token count
            const [name, tokenCount] = await Promise.all([
              publicClient.readContract({
                address: collection as `0x${string}`,
                abi: NFT_COLLECTION_ABI,
                functionName: 'name',
              }),
              publicClient.readContract({
                address: collection as `0x${string}`,
                abi: NFT_COLLECTION_ABI,
                functionName: 'getTokenCount',
              }),
            ]);

            // Fetch data for each token
            for (let tokenId = 0; tokenId < Number(tokenCount); tokenId++) {
              const fetchTokenData = async (): Promise<NFT | null> => {
                try {
                  const [tokenURI, owner] = await Promise.all([
                    publicClient.readContract({
                      address: collection as `0x${string}`,
                      abi: NFT_COLLECTION_ABI,
                      functionName: 'tokenURI',
                      args: [BigInt(tokenId)],
                    }),
                    publicClient.readContract({
                      address: collection as `0x${string}`,
                      abi: NFT_COLLECTION_ABI,
                      functionName: 'ownerOf',
                      args: [BigInt(tokenId)],
                    }),
                  ]);

                  if (!tokenURI || !owner) return null;

                  const metadata = await fetchIPFSMetadata(tokenURI as string);
                  
                  // Only include NFTs owned by the creator
                  if (owner.toLowerCase() === creatorAddress.toLowerCase()) {
                    return {
                      id: `${collection}-${tokenId}`,
                      tokenId,
                      collection: collection as string,
                      collectionName: name as string,
                      metadata,
                      owner: owner as string,
                    };
                  }
                  return null;
                } catch (error) {
                  console.error(`Error fetching token ${tokenId} data:`, error);
                  return null;
                }
              };

              nftPromises.push(fetchTokenData());
            }
          } catch (error) {
            console.error(`Error processing collection ${collection}:`, error);
          }
        }

        const fetchedNFTs = (await Promise.all(nftPromises))
          .filter((nft): nft is NFT => nft !== null);

        setNfts(fetchedNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [creatorAddress]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:py-20 lg:py-20`}>
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
              image={imageUrl || "./placeholder"}
              owner={nft.owner}
              ownerImage={Owner}
              className={className}
            />
          </Link>
        );
      })}
      {nfts.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">No NFTs found for this creator</p>
        </div>
      )}
    </div>
  );
}

export default UserNfts