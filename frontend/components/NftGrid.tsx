"use client"
import React, { useState, useEffect, useMemo } from 'react'
// import Link from 'next/link'
// import { formatEther } from 'viem'
// import NftCard from './NftCard' // Adjust the import path as needed
// import { NFTListing, TokenMinted } from '@/types/nft';
// import PlaceHolder from "../assets/collectibles.svg"
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from '@/constants/abis/NFTCollectionFactory'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
// import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/constants/abis/NFTMarketplace'

interface NFTGridProps {
    className?: string
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



const NftGrid = ({ className }: NFTGridProps) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  // Get default collection
  const { data: defaultCollection } = useReadContract({
    address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_FACTORY_ABI,
    functionName: 'getDefaultCollection',
  });

    console.log("default collection", defaultCollection)

  // Get user collections
  const { data: userCollections } = useReadContract({
    address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_FACTORY_ABI,
    functionName: 'getCreatorCollections',
    args: [address as `0x${string}`],
  });
    console.log("user collections", userCollections)


  // Combine all collections
  const allCollections = useMemo(() => [
    ...(defaultCollection ? [defaultCollection] : []),...(userCollections || [])
  ], [defaultCollection, userCollections]);

  // Get collection details (name and token count)
  const { data: collectionsData } = useReadContracts({
    contracts: allCollections.map(collection => [
      {
        address: collection as `0x${string}`,
        abi: NFT_COLLECTION_ABI,
        functionName: 'name',
      },
      {
        address: collection as `0x${string}`,
        abi: NFT_COLLECTION_ABI,
        functionName: 'getTokenCount',
      }
    ]).flat(),
  });

        console.log("collection data", collectionsData)


  // Prepare token data reading contracts
  const tokenDataContracts = allCollections.map((collection, i) => {
    const collectionDataIndex = i * 2;
    const tokenCount = Number(collectionsData?.[collectionDataIndex + 1]?.result || 0);
    
    return Array.from({ length: tokenCount }, (_, tokenId) => [
      {
        address: collection as `0x${string}`,
        abi: NFT_COLLECTION_ABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      },
      {
        address: collection as `0x${string}`,
        abi: NFT_COLLECTION_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      },
    ]).flat();
  }).flat();

  // Read all token data at once
  const { data: tokenData } = useReadContracts({
    contracts: tokenDataContracts,
  });

    console.log("tokenData", tokenData)

  // Fetch NFT metadata from IPFS
  const fetchIPFSMetadata = async (uri: string): Promise<NFTMetadata> => {
    try {
      const hash = uri.replace('ipfs://', '');
      const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
      const metadata = await response.json();
      
      if (metadata.image?.startsWith('ipfs://')) {
        metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
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
      if (!collectionsData || !tokenData || allCollections.length === 0) return;

      try {
        const nftPromises: Promise<NFT | null>[] = [];
        let tokenDataIndex = 0;

        for (let i = 0; i < allCollections.length; i++) {
          const collection = allCollections[i];
          const collectionDataIndex = i * 2;
          const name = collectionsData[collectionDataIndex]?.result as string;
          const tokenCount = Number(collectionsData[collectionDataIndex + 1]?.result || 0);

          for (let tokenId = 0; tokenId < tokenCount; tokenId++) {
            const tokenURI = tokenData[tokenDataIndex]?.result as string;
            const owner = tokenData[tokenDataIndex + 1]?.result as string;
            tokenDataIndex += 2;

            if (tokenURI) {
              const metadata = await fetchIPFSMetadata(tokenURI);
              nftPromises.push(Promise.resolve({
                id: `${collection}-${tokenId}`,
                tokenId,
                collection: collection,
                collectionName: name,
                metadata,
                owner
              }));
            }
          }
        }

        const fetchedNFTs = (await Promise.all(nftPromises)).filter((nft): nft is NFT => nft !== null);
          setNfts(fetchedNFTs);
          console.log("fetch nfts",fetchedNFTs)
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchAllNFTs();
  }, [allCollections, collectionsData, tokenData]);
    
  console.log(nfts)

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:py-20 lg:py-20`}>
                  {/* {nfts.map((nft) => {
                        const metadata = nft.metadata;
                        const listing = nft.listing;
                        const imageUrl = metadata?.image;
                        // In a real app, you'd want to fetch this from a profile service
                        const ownerImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${nft.owner}`;

                        return (
                        <Link
                            href={`/nft/${nft.tokenId}`}
                            key={nft.id}
                        >
                            <NftCard
                            name={metadata?.name || 'Unnamed NFT'}
                            image={imageUrl || PlaceHolder}
                            price={listing ? Number(formatEther(BigInt(listing.price))) : undefined}
                            owner={listing?.creator || nft.owner}
                            ownerImage={ownerImage}
                            className={className}
                            />
                        </Link>
                        );
                    })} */}
            <h1 className={className}>NFT</h1>
        </div>
    )
}

export default NftGrid