"use client"
import React, { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from '@/constants/abis/NFTCollectionFactory'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
import Link from 'next/link'
import NftCard from './NftCard'
import Owner from "../assets/owner.svg"
import { NFT, NFTMetadata } from '@/types'

interface NFTGridProps {
    className?: string;
}


const UserNfts = ({ className }: NFTGridProps) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const { address } = useAccount();

  // Get default collection
  const { data: defaultCollection } = useReadContract({
    address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_FACTORY_ABI,
    functionName: 'getDefaultCollection',
  });


  // Get user collections
  const { data: userCollections } = useReadContract({
    address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_FACTORY_ABI,
    functionName: 'getCreatorCollections',
    args: [address as `0x${string}`],
  });


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


  // Fetch NFT metadata from IPFS
   const fetchIPFSMetadata = async (uri: string): Promise<NFTMetadata> => {
    try {
        // Get the actual IPFS hash (everything after the last ipfs:// occurrence)
        const hash = uri.split('ipfs://').pop() as string;
        
        // Create direct gateway URL
        const gatewayUrl = `https://ipfs.io/ipfs/${hash}`;
        console.log("Gateway URL:", gatewayUrl);
        
        const response = await fetch(gatewayUrl);
        const metadata = await response.json();
        
        // Also convert metadata image to gateway URL if it's IPFS
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
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }
    };

    fetchAllNFTs();
  }, [allCollections, collectionsData, tokenData]);
    

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:py-20 lg:py-20`}>
                {nfts.map((nft) => {
                    const metadata = nft.metadata;
                    // const listing = nft.listing;
                    const imageUrl = metadata?.image;

                    return (
                    <Link
                        href={`/nft/${nft.collection}/${nft.tokenId}`}
                        key={nft.id}
                    >
                        <NftCard
                            name={metadata?.name || 'Unnamed NFT'}
                            image={imageUrl || "./placeholder"}
                            // price={listing ? Number(formatEther(BigInt(listing.price))) : undefined}
                            owner={nft.owner}
                            ownerImage={Owner}
                            className={className}
                        />
                    </Link>
                    );
                })}
        </div>
    )
}

export default UserNfts