"use client"
import React, { useState, useEffect } from 'react'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/constants/abis/NFTMarketplace'
import NftCard from './NftCard'
import { ethers } from 'ethers'
import { publicClient } from '@/lib/providers'
import { NFTMetadata } from '@/types'
import Owner from "../assets/owner.svg"

interface NFT {
  id: string
  tokenId: number
  collection: string
  name: string
  image: string
  owner: string
  price?: number
  highestBid?: number
}

const CollectionDetails = ({ collectionAddress }: { collectionAddress: `0x${string}` }) => {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

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

  const fetchNFTs = async () => {
    setIsLoading(true)
    try {
      // Get total supply of NFTs in this collection
      const tokenCount = await publicClient.readContract({
        address: collectionAddress,
        abi: NFT_COLLECTION_ABI,
        functionName: 'getTokenCount',
      }) as bigint

      const nftPromises: Promise<NFT | null>[] = []

      // Fetch data for each token
      for (let tokenId = 0; tokenId < Number(tokenCount); tokenId++) {
        const fetchTokenData = async (): Promise<NFT | null> => {
          try {
            const [tokenURI, owner, listing] = await Promise.all([
              publicClient.readContract({
                address: collectionAddress,
                abi: NFT_COLLECTION_ABI,
                functionName: 'tokenURI',
                args: [BigInt(tokenId)],
              }),
              publicClient.readContract({
                address: collectionAddress,
                abi: NFT_COLLECTION_ABI,
                functionName: 'ownerOf',
                args: [BigInt(tokenId)],
              }),
              publicClient.readContract({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI,
                functionName: 'getListing',
                args: [collectionAddress, BigInt(tokenId)],
              }).catch(() => null) // Silently fail if not listed
            ])

            const metadata = await fetchIPFSMetadata(tokenURI as string)

            // Process marketplace listing if exists
            let price, highestBid
            if (listing) {
              price = listing.price ? Number(ethers.formatEther(listing.price)) : undefined
              highestBid = listing.highestBid ? Number(ethers.formatEther(listing.highestBid)) : undefined
            }

            return {
              id: `${collectionAddress}-${tokenId}`,
              tokenId,
              collection: collectionAddress,
              name: metadata.name,
              image: metadata.image,
              owner: owner as string,
              price,
              highestBid,
            }
          } catch (error) {
            console.error(`Error fetching token ${tokenId} data:`, error)
            return null
          }
        }

        nftPromises.push(fetchTokenData())
      }

      const fetchedNFTs = (await Promise.all(nftPromises))
        .filter((nft): nft is NFT => nft !== null)

      setNfts(fetchedNFTs)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNFTs()
  }, [collectionAddress])

  // Pagination calculations
  const totalPages = Math.ceil(nfts.length / itemsPerPage)
  const paginatedNFTs = nfts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return (
      <div className="max-w-[1050px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
              <div className="mt-4 bg-gray-200 h-6 rounded"></div>
              <div className="mt-2 bg-gray-200 h-4 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="max-w-[1050px] mx-auto px-8 py-12 text-center">
        <h3 className="text-xl font-medium">No NFTs found in this collection</h3>
        <p className="mt-2 text-gray-500">This collection doesn&apos;t have any minted NFTs yet</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1050px] mx-auto px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">NFTs in Collection</h2>
        <div className="text-gray-500">
          Showing {paginatedNFTs.length} of {nfts.length} items
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedNFTs.map((nft) => (
          <NftCard
            key={nft.id}
            name={nft.name}
            image={nft.image}
            owner={nft.owner}
            ownerImage={Owner}
            price={nft.price}
            highestBid={nft.highestBid}
            className='bg-secondary'
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex items-center">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = currentPage <= 3
                ? i + 1 
                : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                >
                  {page}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default CollectionDetails