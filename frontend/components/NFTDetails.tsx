"use client"
import { createPublicClient, http, formatEther } from 'viem'
import { sepolia } from 'viem/chains'
import React, { useEffect, useState } from 'react'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/constants/abis/NFTMarketplace'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import CustomButton from './custom/CustomButton'
import Owner from "../assets/owner.svg"
import { shortenAddress } from '@/lib'
import { ArrowBigRight, Earth } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import UserNfts from './user-nfts'
import AuctionCountdown from './AuctionCountdown'
import BidModal from './BidModal'
import BuyModal from './BuyModal'
import { Listing, NFTMetadata } from '@/types'

interface NFTDetailsProps {
    collectionAddress: `0x${string}`
    tokenId: bigint
}

// Create a public client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
})



const NFTDetails = ({ collectionAddress, tokenId }: NFTDetailsProps) => {
    const [metadata, setMetadata] = useState<NFTMetadata>()
    const [isAuctionEnded, setIsAuctionEnded] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [showBidModal, setShowBidModal] = useState(false)
    const [showBuyModal, setShowBuyModal] = useState(false)
    const [mintDate, setMintDate] = useState<Date | null>(null)
    const [listing, setListing] = useState<Listing>()
    const [owner, setOwner] = useState<string | null>(null)
    const [tokenURI, setTokenURI] = useState<string | null>(null)
    const router = useRouter()
    const { address } = useAccount()


    // Fetch NFT data
    useEffect(() => {
        const fetchNFTData = async () => {
            try {
                // Get listing, owner, and tokenURI in parallel
                const [listingData, ownerData, tokenURIData] = await Promise.all([
                    publicClient.readContract({
                        address: MARKETPLACE_ADDRESS as `0x${string}`,
                        abi: MARKETPLACE_ABI,
                        functionName: 'getListing',
                        args: [collectionAddress, tokenId],
                    }),
                    publicClient.readContract({
                        address: collectionAddress,
                        abi: NFT_COLLECTION_ABI,
                        functionName: 'ownerOf',
                        args: [tokenId],
                    }),
                    publicClient.readContract({
                        address: collectionAddress,
                        abi: NFT_COLLECTION_ABI,
                        functionName: 'tokenURI',
                        args: [tokenId],
                    }),
                ]);

                setListing(listingData)
                setOwner(ownerData as string)
                setTokenURI(tokenURIData as string)

            } catch (error) {
                console.error('Error fetching NFT data:', error)
            }
        }

        fetchNFTData()
    }, [collectionAddress, tokenId])

  // Fetch mint date from transfer events with chunked requests
  
  // Usage in useEffect
  useEffect(() => {
        const fetchMintDate = async () => {
            try {
                // Get current block
                const currentBlock = await publicClient.getBlockNumber()
                const CHUNK_SIZE = BigInt(9999) // Slightly less than 10000 to be safe
                let startBlock = currentBlock - CHUNK_SIZE
                let foundEvent = false
      
                while (startBlock > BigInt(0) && !foundEvent) {
                    try {
                        const transferEvents = await publicClient.getLogs({
                            address: collectionAddress,
                            event: {
                                type: 'event',
                                name: 'Transfer',
                                inputs: [
                                    { type: 'address', name: 'from', indexed: true },
                                    { type: 'address', name: 'to', indexed: true },
                                    { type: 'uint256', name: 'tokenId', indexed: true },
                                ],
                            },
                            args: {
                                from: '0x0000000000000000000000000000000000000000',
                                tokenId: tokenId,
                            },
                            fromBlock: startBlock,
                            toBlock: startBlock + CHUNK_SIZE,
                        })
      
                        if (transferEvents && transferEvents.length > 0) {
                            const block = await publicClient.getBlock({
                                blockNumber: transferEvents[0].blockNumber,
                            })
                            setMintDate(new Date(Number(block.timestamp) * 1000))
                            foundEvent = true
                            break
                        }
      
                        // Move to the next chunk
                        startBlock = startBlock > CHUNK_SIZE ? startBlock - CHUNK_SIZE : BigInt(0)
                    } catch (error) {
                        console.error('Error in chunk fetch:', error)
                        startBlock = startBlock > CHUNK_SIZE ? startBlock - CHUNK_SIZE : BigInt(0)
                    }
                }
      
                if (!foundEvent) {
                    console.log('No mint event found in the available block range')
                }
            } catch (error) {
                console.error('Error fetching mint date:', error)
            }
        }
        fetchMintDate()
    }, [collectionAddress, tokenId])

    // Fetch metadata
    useEffect(() => {
        const fetchMetadata = async () => {
            if (!tokenURI) return

            try {
                const hash = tokenURI.split('ipfs://').pop()
                const response = await fetch(`https://ipfs.io/ipfs/${hash}`)
                const data = await response.json()

                if (data.image?.startsWith('ipfs://')) {
                    data.image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
                }
                setMetadata(data)
            } catch (error) {
                console.error('Error fetching IPFS metadata:', error)
                return {
                    name: 'Unknown',
                    description: 'Metadata unavailable',
                    image: '/placeholder.png',
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchMetadata()
    }, [tokenURI])

      // Replace the auction section in the existing JSX with:
  const renderAuctionOrPriceSection = () => {
      if (!listing || listing.price === BigInt(0)) {
      return (
        <div className='bg-secondary rounded-[20px]'>
          <p className="text-xl font-semibold mb-4">Not Listed</p>
          {owner === address && (
            <CustomButton
                type='button'
                title='List NFT'
                className='bg-accent h-[60px] w-full md:w-44 xl:w-72 text-base'
                onClick={() => router.push(`/list/${collectionAddress}/${tokenId}`)}
            />
            )}
        </div>
      );
    }

    if (listing.isAuction) {
      const endTime = parseInt(listing?.auctionEndTime?.toString() || '0');
      const now = Math.floor(Date.now() / 1000);
      
      if (endTime <= now || isAuctionEnded) {
        return (
          <div className='bg-secondary rounded-[20px]'>
            <p className="text-xl font-semibold mb-4">Auction Ended</p>
            <p className="text-gray-500">This auction has concluded</p>
          </div>
        );
      }

      return (
        <div className='bg-secondary rounded-[20px]'>
          <p className="text-sm mb-2">Auction ends in:</p>
          <AuctionCountdown
            endTime={endTime}
            onEnd={handleAuctionEnd}
          />
          <div className="mb-6">
            <p className="text-sm text-gray-500">Current bid</p>
            <p className="text-2xl font-bold">{formatEther(BigInt(listing.price))} ETH</p>
          </div>
          {owner !== address && (
            <CustomButton
                type='button'
                title='Place bid'
                className='bg-accent h-[60px] text-base w-full'
                onClick={() => setShowBidModal(true)}
            />
            )}
        </div>
      );
    }

    return (
      <div className='bg-secondary rounded-[20px]'>
        <div className="mb-6">
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-2xl font-bold">{formatEther(BigInt(listing.price))} ETH</p>
        </div>
        {owner !== address && (
            <CustomButton
            type='button'
            title='Buy Now'
            className='bg-accent h-[60px] text-base w-full'
            onClick={() => setShowBuyModal(true)}
            />
        )}
      </div>
    );
  };

    const handleAuctionEnd = () => {
        setIsAuctionEnded(true);
        toast.success("Auction has ended!");
    };

    if (isLoading || !metadata) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }


  return (
    <main>
        <div>
            <Image
                src={metadata.image}
                alt={metadata.name}
                className="object-fill min-w-full max-h-[560px] h-full mb-10"
                width={100}
                height={100}
                style={{ width: "auto", height: "auto" }}
                quality={100}
                priority
            />
            <div className='max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0 md:flex md:gap-10 md:items-start'>
                <div>
                    <div className='space-y-2 mb-7'>
                        <h1 className="text-2xl md:text-3xl xl:text-5xl font-semibold">{metadata.name}</h1>
                        <p className='text-base text-primary xl:text-2xl'>
                            {mintDate ? `Minted on ${mintDate.toLocaleDateString(
                                'en-US',
                                { day: 'numeric', month: 'short', year: 'numeric' }
                            )}` : 'Loading mint date...'}
                        </p>
                    </div>
                    <div className='mb-7 bg-secondary p-8 rounded-[20px] md:hidden'>
                        <div className=''>
                            {renderAuctionOrPriceSection()}
                        </div>
                        {listing?.isAuction && !isAuctionEnded && (
                            <CustomButton
                                type='button'
                                title='Place bid'
                                className='bg-accent h-[60px] text-base w-full'
                                onClick={() => setShowBidModal(true)}
                            />
                        )}
                    </div>
                    <div className='mb-8'>
                        <p className="text-base text-primary xl:text-2xl font-mono font-bold mb-3">Created by</p>
                        <span className='flex items-center gap-2'>
                        <Image
                            src={Owner}
                            alt={owner ? shortenAddress(owner) : "0x134..."}
                            width={100}
                            height={100}
                            className="max-w-7 max-h-7 rounded-full object-cover"
                            style={{width: "auto", height: "auto"}}
                        />
                        <Link href={`/creators/${owner}`} className="font-semibold text-white">
                            {owner ? shortenAddress(owner) : "0x134..."}
                        </Link>
                        </span>
                    </div>

                    <div className="text-base mb-8">
                        <h2 className="text-primary xl:text-2xl font-bold mb-4 font-mono">Description</h2>
                        <p>{metadata.description}</p>
                    </div>

                    <div className='mb-8 text-base'>
                        <p className="text-primary xl:text-2xl font-mono font-bold mb-4">Details</p>
                        <Link
                            href={`https://sepolia.etherscan.io/address/${collectionAddress}`}
                            target="_blank"
                            className='flex items-center gap-2 mb-3'
                        >
                            <Earth size={20} className='h-5 w-5' />
                            <p>View on Etherscan</p>
                        </Link>
                        <Link
                            href={metadata.image}
                            target="_blank"
                            className='flex items-center gap-2'
                        >
                            <Earth size={20} className='h-5 w-5' />
                            <p>View original</p>
                        </Link>
                    </div>
                </div>
                  <div className='mb-7 bg-secondary p-8 rounded-[20px] hidden md:block'>
                    <div className=''>
                        {renderAuctionOrPriceSection()}
                    </div>
                    {listing?.isAuction && !isAuctionEnded && (
                        <CustomButton
                            type='button'
                            title='Place bid'
                            className='bg-accent h-[60px] text-base w-full'
                            onClick={() => setShowBidModal(true)}
                        />
                    )}
                </div>
            </div>
          </div>

        <div className='max-w-[1050px] mx-auto my-20 px-8 md:px-11 lg:px-36 xl:px-0'>
            <div className='flex items-center justify-between mb-14 md:mb-3'>
                <h1 className='text-2xl xl:text-4xl font-bold'>More from this artist</h1>
                <Link href={`/creators/${owner}`} className='hidden md:block'>
                    <CustomButton
                        type='button'
                        title='Go To Artist Page'
                        className='bg-background border-2 border-solid border-accent h-[60px] text-base'
                        icon={<ArrowBigRight size={20} />}
                    />
                </Link>
            </div>
            <div className='mb-7 md:mb-0'>
                <UserNfts creatorAddress={owner as `0x${string}`} className='bg-secondary' />
            </div>
            <Link href={`/creators/${owner}`} className='block md:hidden mb-7'>
                <CustomButton
                type='button'
                title='Go To Artist Page'
                className='bg-background border-2 border-solid border-accent h-[60px] text-base w-full'
                icon={<ArrowBigRight size={20} />}
                />
            </Link>
          </div>
          
        {listing && listing?.seller && (
        <>
            <BidModal
                isOpen={showBidModal}
                onClose={() => setShowBidModal(false)}
                collectionAddress={collectionAddress}
                tokenId={tokenId }
                currentBid={listing.price}
                minBidIncrement="100000000000000000" // 0.1 ETH,
            />
            <BuyModal
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                collectionAddress={collectionAddress}
                tokenId={tokenId}
                price={listing.price}
                metadata={{
                    name: metadata?.name || '',
                    image: metadata?.image || ''
                }}
            />
            </>
        )}
    </main>
  )
}

export default NFTDetails