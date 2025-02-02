'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useReadContract, useReadContracts } from 'wagmi';
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from '@/constants/abis/NFTCollectionFactory';
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Record<string, string>;
}

interface NFT {
  tokenId: number;
  collection: `0x${string}`; // Make this explicit to match the contract address type
  collectionName: string;
  metadata: NFTMetadata;
}

export function NFTDisplay() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get default collection
  const { data: defaultCollection } = useReadContract({
    address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_FACTORY_ABI,
    functionName: 'getDefaultCollection',
  });

  // Get collections data
  const { data: collectionsData } = useReadContracts({
    contracts: defaultCollection ? [
      {
        address: defaultCollection,
        abi: NFT_COLLECTION_ABI,
        functionName: 'name',
      },
      {
        address: defaultCollection,
        abi: NFT_COLLECTION_ABI,
        functionName: 'getTokenCount',
      },
    ] : [],
  });

  // Create tokenURI read requests
  const tokenCount = collectionsData?.[1]?.result ? Number(collectionsData[1].result) : 0;
  
  const { data: tokenURIs } = useReadContracts({
    contracts: defaultCollection ? Array.from({ length: tokenCount }, (_, i) => ({
      address: defaultCollection,
      abi: NFT_COLLECTION_ABI,
      functionName: 'tokenURI',
      args: [BigInt(i)]
    })) : [],
  });

  // Fetch NFT metadata from IPFS
  const fetchIPFSMetadata = async (uri: string): Promise<NFTMetadata> => {
    try {
      // Remove ipfs:// prefix and fetch from gateway
      const hash = uri.replace('ipfs://', '');
      const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
      const metadata = await response.json();
      
      // If image is IPFS URI, convert to gateway URL
      if (metadata.image?.startsWith('ipfs://')) {
        metadata.image = metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      return metadata;
    } catch (error) {
      console.error('Error fetching IPFS metadata:', error);
      return {
        name: 'Unknown',
        description: 'Metadata unavailable',
        image: '/placeholder.png',
      };
    }
  };

  useEffect(() => {
    const fetchAllNFTs = async () => {
      if (!defaultCollection || !collectionsData || !tokenURIs) return;

      try {
        const [name] = collectionsData;

        // Fetch metadata for each token and explicitly type the promise array
        const nftPromises: Promise<NFT | null>[] = tokenURIs.map(async (uriData, index) => {
          if (!uriData?.result) return null;
          const metadata = await fetchIPFSMetadata(uriData.result as string);
          return {
            tokenId: index,
            collection: defaultCollection,
            collectionName: name?.result as string,
            metadata,
          };
        });

        const fetchedNFTs = await Promise.all(nftPromises);
        // Use type predicate to filter out null values
        const validNFTs = fetchedNFTs.filter((nft): nft is NFT => nft !== null);
        setNfts(validNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllNFTs();
  }, [defaultCollection, collectionsData, tokenURIs]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-1/2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!nfts.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No NFTs Found</CardTitle>
          <CardDescription>
            There are no NFTs in any collections yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

    console.log("nfs",nfts)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <Card key={`${nft.collection}-${nft.tokenId}`} className="w-full">
          <CardHeader>
            <CardTitle>{nft.metadata.name}</CardTitle>
            <CardDescription>{nft.collectionName} #{nft.tokenId}</CardDescription>
          </CardHeader>
          <CardContent>
            {nft.metadata.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={nft.metadata.image}
                alt={nft.metadata.name}
                className="w-full h-48 object-cover rounded-md"
              />
            )}
            <p className="mt-4 text-sm text-gray-600">
              {nft.metadata.description}
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Collection: {nft.collection.slice(0, 6)}...{nft.collection.slice(-4)}
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}