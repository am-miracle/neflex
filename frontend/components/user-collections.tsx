'use client'
import { useState, useEffect, useMemo } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from '@/constants/abis/NFTCollectionFactory'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
import { Address } from 'viem'
import Link from 'next/link'
import Image from 'next/image'
import OwnerImage from "../assets/owner.svg"
import { shortenAddress } from '@/lib'

interface Collection {
  address: string
  name: string
  symbol: string
  baseTokenURI: string
  maxSupply: bigint
  tokenCount: bigint
}

interface UserCollectionsProps {
  userAddress: string
}

export function UserCollections({ userAddress }: UserCollectionsProps) {
  const [collections, setCollections] = useState<Collection[]>([])

  // Get all collection addresses for the user
  const { data: collectionAddresses } = useReadContract({
    address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_FACTORY_ABI,
    functionName: 'getCreatorCollections',
    args: [userAddress as Address],
  })

  // Prepare contract reads for all collections
    const addresses = useMemo(() => {
        return Array.isArray(collectionAddresses) ? collectionAddresses : []
    }, [collectionAddresses])
  
  const contractReads = addresses.flatMap((address) => [
    {
      address: address as Address,
      abi: NFT_COLLECTION_ABI,
      functionName: 'name',
    },
    {
      address: address as Address,
      abi: NFT_COLLECTION_ABI,
      functionName: 'symbol',
    },
    {
      address: address as Address,
      abi: NFT_COLLECTION_ABI,
      functionName: 'getBaseTokenURI',
    },
    {
      address: address as Address,
      abi: NFT_COLLECTION_ABI,
      functionName: 'getMaxSupply',
    },
    {
      address: address as Address,
      abi: NFT_COLLECTION_ABI,
      functionName: 'getTokenCount',
    },
  ])

  const { data: collectionsData } = useReadContracts({
    contracts: contractReads,
  })

    console.log(collectionsData)

  // Process the data when it's available
  useEffect(() => {
    if (!collectionsData || !addresses.length) return

    const processedCollections: Collection[] = []
    
    for (let i = 0; i < addresses.length; i++) {
      const baseIndex = i * 5 // Since we have 5 reads per collection
      const collectionData = collectionsData.slice(baseIndex, baseIndex + 5)
      
      // Check if all reads were successful
      if (collectionData.every(data => data.status === 'success')) {
        processedCollections.push({
          address: addresses[i],
          name: collectionData[0].result as string,
          symbol: collectionData[1].result as string,
          baseTokenURI: collectionData[2].result as string,
          maxSupply: collectionData[3].result as bigint,
          tokenCount: collectionData[4].result as bigint,
        })
      }
    }

    setCollections(processedCollections)
  }, [collectionsData, addresses])


  if (collections.length === 0) {
    return (
      <div className="text-center py-10">
            <h2 className="text-xl font-semibold">No Collection found</h2>
            <p className="text-gray-500">Check back later for new collection</p>
        </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:py-20 lg:py-20`}>
        {collections.map((collection, index) => (
                <Link
                    href={`/collection/${collection.address}`}
                    key={index}
                    className={"text-foreground rounded-[20px] overflow-hidden w-full transform transition-all duration-300 hover:scale-95"}>
                      {/* NFT Image */}
                      <div className="relative">
                        <Image
                            src={collection.baseTokenURI}
                            alt={collection.name}
                            width={100}
                            height={100}
                            className="min-h-[295px] max-h-[238px] xl:max-h-[295px] min-w-full object-cover"
                            style={{width: "auto", height: "auto"}}
                        />
                    </div>
                      {/* Card Content */}
                      <div className={`py-6 px-5 bg-background`}>
                        {/* NFT Name */}
                        <h3 className="text-2xl font-semibold mb-2 truncate">
                          {collection.name}
                        </h3>
                        {/* Owner Information */}
                        <div className="flex items-center space-x-3 mt-3">
                            {OwnerImage ? (
                                <div className="w-7 h-7">
                                    <Image
                                        src={OwnerImage}
                                        alt={'Owner'}
                                        width={100}
                                        height={100}
                                        className="w-full h-full rounded-full mr-3 object-cover"
                                        style={{width: "auto", height: "auto"}}
                                    />
                                </div>
                            ): (
                                <div className="w-7 h-7 rounded-full mr-3 bg-gray-300">{ collection.name[0] }</div>
                            )}
                            <p className="font-medium font-mono truncate text-base max-w-[200px]">{shortenAddress(collection.address)}</p>
                        </div>
                      </div>
                </Link>
            )
        )}
    </div>
  )
}
