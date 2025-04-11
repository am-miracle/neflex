import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { shortenAddress } from '@/lib'
import CustomButton from './custom/CustomButton'
import AuctionCountdown from './AuctionCountdown'
import { Eye } from 'lucide-react'

interface NftAuctionProps {
  nft: {
    id: string
    collectionAddress: `0x${string}`
    tokenId: bigint
    name: string
    image: string
    creator: `0x${string}`
    creatorName?: string
    currentBid: bigint
    auctionEndTime: number
  }
}

const AuctionNft: React.FC<NftAuctionProps> = ({ nft }) => {
  return (
    <div className="w-full max-h-[630px] relative">
      <div className="relative aspect-square w-full h-[630px] overflow-hidden mb-4">
        <Image
          src={nft.image}
          alt={nft.name}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-accent mix-blend-color pointer-events-none" />
      </div>

      <div className="space-y-4 px-[30px] md:px-20 lg:px-36 xl:px-0 absolute bottom-[60px] left-0 md:right-0 md:left-0 max-w-[1050px] lg:mx-auto w-full flex flex-col md:flex-row md:items-end justify-between">
        <div>
            <Link href={`/creators/${nft.creator}`} className='bg-secondary px-5 py-2.5 rounded-full text-white'>{nft.creatorName || shortenAddress(nft.creator)}</Link>
          <h3 className="text-[38px] font-bold truncate text-white my-[30px]">{nft.name}</h3>
          <Link href={`/nft/${nft.collectionAddress}/${nft.tokenId}`} passHref className='hidden md:block'>
            <CustomButton
                className="w-full md:w-[198px] bg-white hover:bg-accent-dark rounded-[20px] h-12 text-gray-800"
                type="button"
                title='See NFT'
                icon={<Eye size={18} className='text-accent' />}
            />
            </Link>
        </div>

        <div className="p-[30px] bg-black/50 rounded-[20px]">
          <div className="!text-white">
            <span className="text-sm text-white mb-2.5 font-mono">Auction ends in</span>
            <AuctionCountdown
              endTime={nft.auctionEndTime}
              className="text-white font-mono"
            />
          </div>
        </div>

        <Link href={`/nft/${nft.collectionAddress}/${nft.tokenId}`} passHref className='md:hidden'>
            <CustomButton
                className="w-full md:w-[198px] bg-white hover:bg-accent-dark rounded-[20px] h-12 text-gray-800"
                type="button"
                title='See NFT'
                icon={<Eye size={18} className='text-accent' />}
            />
        </Link>
      </div>
    </div>
  )
}

export default AuctionNft