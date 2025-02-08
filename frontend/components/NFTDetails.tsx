"use client"
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection';
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/constants/abis/NFTMarketplace';
import { NFTMetadata } from '@/types';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { useReadContract } from 'wagmi';
import CustomButton from './custom/CustomButton';
import Owner from "../assets/owner.svg"
import { shortenAddress } from '@/lib';
import { Earth } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';


interface NFTDetailsProps{
    collectionAddress: `0x${string}`;
    tokenId: bigint;
}

const NFTDetails = ({ collectionAddress, tokenId }: NFTDetailsProps) => {
    const [metadata, setMetadata] = useState<NFTMetadata>();
      const [isAuctionEnded, setIsAuctionEnded] = useState(false);
    const [isLoading, setIsLoading] = useState(true)

  // Get listing information
    const { data: listing } = useReadContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'getListing',
        args: [collectionAddress, tokenId],
    });

    console.log("listing", listing)

  // Get token URI and metadata
  const { data: tokenURI } = useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'tokenURI',
    args: [tokenId],
  })


    useEffect(() => {
        const fetchMetadata = async () => {
        if (!tokenURI) return

        try {
            const hash = tokenURI.split('ipfs://').pop()
            const response = await fetch(`https://ipfs.io/ipfs/${hash}`)
            const data = await response.json()

            // If image is IPFS URI, convert to gateway URL
            if (data.image?.startsWith('ipfs://')) {
                data.image = data.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
            setMetadata(data)
        } catch (error) {
            console.error('Error fetching IPFS metadata:', error);
            return {
                name: 'Unknown',
                description: 'Metadata unavailable',
                image: '/placeholder.png',
            };
        } finally {
            setIsLoading(false)
        }
        }

        fetchMetadata()
    }, [tokenURI]);

    const handleAuctionEnd = () => {
        setIsAuctionEnded(true);
        toast.success("Auction has ended!");
    };
    console.log("", () => handleAuctionEnd)

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
                src={metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                alt={metadata.name}
                className="object-fill min-w-full max-h-[560px] h-full mb-10"
                width={100}
                height={100}
                style={{ width: "auto", height: "auto" }}
                quality={100}
                priority
            />
            <div className='max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0'>
                <div className='grid gap-2 mb-7'>
                    <h1 className="text-2xl md:text-3xl xl:text-5xl font-semibold">{metadata.name}</h1>
                    {listing?.isAuction ? (
                    <p className='text-base text-primary xl:text-2xl'>
                        {/* Minted on {new Date(parseInt(nft.blockTimestamp) * 1000).toLocaleDateString()} */}
                    </p>
                    ) : (
                    <p className='text-base text-primary xl:text-2xl'>Not listed</p>
                    )}
                </div>
                <div className='mb-7 bg-secondary p-8 rounded-[20px]'>
                    <p className="text-sm">Auction ends in:</p>
                    <div className=''>
                        {/* {renderAuctionOrPriceSection()} */}
                    </div>
                    {listing?.isAuction && !isAuctionEnded && (
                    <CustomButton
                        type='button'
                        title='Place bid'
                        className='bg-accent h-[60px] text-base w-full'
                    />
                    )}
                  </div>
                <div className='mb-8'>
                    <p className="text-base text-primary xl:text-2xl font-mono font-bold mb-3">Created by</p>
                    <span className='flex items-center gap-2'>
                    <Image
                        src={Owner}
                        alt={listing?.seller ? shortenAddress(listing?.seller) : "0x134..."}
                        width={100}
                        height={100}
                        className="max-w-7 max-h-7 rounded-full object-cover"
                        style={{width: "auto", height: "auto"}}
                    />
                    <p className="font-semibold text-white">
                        {listing?.seller ? shortenAddress(listing?.seller) : "0x134..."}
                    </p>
                    </span>
                </div>

                <div className="text-base mb-8">
                    <h2 className="text-primary xl:text-2xl font-bold mb-4 font-mono">Description</h2>
                    <p>{metadata.description}</p>
                </div>

                <div className='mb-8 text-base'>
                    <p className="text-primary xl:text-2xl font-mono font-bold mb-4">Details</p>
                    <Link
                        href={`https://sepolia.etherscan.io/tx/`}
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
        </div>
    </main>
  )
}

export default NFTDetails