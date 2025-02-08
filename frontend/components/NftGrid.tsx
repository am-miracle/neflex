"use client"
import React, { useState, useEffect, useMemo } from 'react'
import PlaceHolder from "../assets/collectibles.svg"
import { useReadContracts } from 'wagmi'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
import { NFT, NFTMetadata } from '@/types'
import Link from 'next/link'
import Pagination from './pagination'
import { getClient } from '@/lib/apollo-client'
import { GET_ALL_COLLECTIONS } from '@/lib/queries'
import NftCard from './NftCard'
import Owner from "../assets/owner.svg"


interface NFTGridProps {
    className?: string
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


const NftGrid = ({ className }: NFTGridProps) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(nfts.length / ITEMS_PER_PAGE);
  
  // Calculate current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return nfts.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch collections using GraphQL
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data } = await getClient().query({
          query: GET_ALL_COLLECTIONS,
        });
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
        // {
        //   address: collection.collectionAddress as `0x${string}`,
        //   abi: NFT_COLLECTION_ABI,
        //   functionName: 'ownerOf',
        //   args: [BigInt(tokenId)],
        // },
      ]).flat();
    }).flat();
  }, [collections, collectionsData]);

  // Read all token data at once
  const { data: tokenData } = useReadContracts({
    contracts: tokenDataContracts,
  });


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

    const currentNFTs = getCurrentPageItems();


    return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:py-20 lg:py-20`}>
        {currentNFTs.map((nft) => (
          <Link
            href={`/nft/${nft.collection}/${nft.tokenId}`}
            key={nft.id}
          >
            <NftCard
              name={nft.metadata?.name || 'Unnamed NFT'}
              image={nft.metadata?.image || PlaceHolder}
              owner={nft.owner}
              ownerImage={Owner}
              className={className}
            />
          </Link>
        ))}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        showPagination={nfts.length > ITEMS_PER_PAGE}
      />
      
      {nfts.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500">No NFTs found in any collections</p>
        </div>
      )}
    </div>
    )
}

export default NftGrid