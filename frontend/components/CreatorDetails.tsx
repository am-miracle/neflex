"use client"
import React, { Suspense } from 'react'
import Image from 'next/image';
import Cover from "../assets/cover.svg"
import UserImage from "../assets/creator.svg"
import { useAccount, useEnsName, useReadContract } from 'wagmi';
import CustomButton from './custom/CustomButton';
import { Copy, Plus } from 'lucide-react';
import DiscordLogo from "../assets/DiscordLogo.svg"
import TwitterLogo from "../assets/TwitterLogo.svg"
import YoutubeLogo from "../assets/YoutubeLogo.svg"
import InstagramLogo from "../assets/InstagramLogo.svg"
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LoadingGrid } from './loading';
import UserNfts from './user-nfts';
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from '@/constants/abis/NFTCollectionFactory';
import { UserCollections } from './user-collections';
import { copyAddress, shortenAddress } from '@/lib';


// interface CreatorDetailsProps {
//     creatorAddress: `0x${string}`;
// }

const CreatorDetails = () => {
    const { address } = useAccount()
    const { data: ensName } = useEnsName({ address });

    const { data: collections } = useReadContract({
        address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
        abi: NFT_COLLECTION_FACTORY_ABI,
        functionName: 'getCreatorCollections',
        args: [address as `0x${string}`],
    })

  return (
    <div>
        <Image
            src={Cover}
            alt={`creator cover image`}
            className="object-fill min-w-full max-h-[560px] h-full mb-10"
            width={100}
            height={100}
            style={{ width: "auto", height: "auto" }}
            quality={100}
            priority
        />
        <div className='max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0'>
            <div className='max-w-[120px] max-h-[120px] rounded-[20px] overflow-hidden mx-auto md:mx-0 -mt-[100px] z-10 border-2 border-solid border-black'>
                <Image
                    src={UserImage}
                    alt={`creator image`}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                    style={{ width: "auto", height: "auto" }}
                />
            </div>
            <div className='py-10 space-y-7'>
                <div className='flex flex-col md:flex-row md:items-center justify-between space-y-3'>
                    <h1 className='text-2xl md:text-4xl xl:text-5xl font-semibold'>AnimaKid</h1>
                    <div className='flex flex-col md:flex-row xl:items-center gap-5'>
                        <CustomButton
                            type='button'
                            title={ensName || shortenAddress(address as `0x${string}`)}
                            className='bg-accent h-[60px] text-semibold'
                            icon={<Copy size={20} />}
                            onClick={() => copyAddress(address as `0x${string}`)}
                        />
                        <CustomButton
                            type='button'
                            title={"follow"}
                            className='bg-background border-2 border-solid border-accent h-[60px] text-semibold'
                            icon={<Plus size={20} className='text-accent' />}
                            onClick={() => {}}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between md:justify-normal md:space-x-8 xl:space-x-16">
                    <span>
                        <p className='font-bold lg:text-xl xl:text-2xl font-mono'>240k+</p>
                        <p className='text-base'>Volumes</p>
                    </span>
                    <span>
                        <p className='font-bold lg:text-xl xl:text-2xl font-mono'>50k+</p>
                        <p className='text-base'>NFTs sold</p>
                    </span>
                    <span>
                        <p className='font-bold lg:text-xl xl:text-2xl font-mono'>3000+</p>
                        <p className='text-base'>Followers</p>
                    </span>
                </div>
                <div className='space-y-3'>
                    <h1 className='font-mono text-primary xl:text-xl'>Bio</h1>
                    <p>The internet&apos;s friendliest designer kid.</p>
                </div>
                <div className='space-y-3'>
                    <h1 className='font-mono text-primary xl:text-xl'>Links</h1>
                    <div className='flex gap-4 items-center'>
                        <a href="#" target="_blank" rel="noreferrer">
                            <Image
                                src={DiscordLogo}
                                alt="Discord logo"
                                width={100}
                                height={100}
                                className='h-[32px] w-[32px]'
                                style={{width: "auto", height: "auto"}}
                            />
                        </a>
                        <a href="#" target="_blank" rel="noreferrer">
                            <Image
                                src={TwitterLogo}
                                alt="Twitter logo"
                                width={100}
                                height={100}
                                className='h-[32px] w-[32px]'
                                style={{width: "auto", height: "auto"}}
                            />
                        </a>
                        <a href="#" target="_blank" rel="noreferrer">
                            <Image
                                src={YoutubeLogo}
                                alt="Youtube logo"
                                width={100}
                                height={100}
                                className='h-[32px] w-[32px]'
                                style={{width: "auto", height: "auto"}}
                            />
                        </a>
                        <a href="#" target="_blank" rel="noreferrer">
                            <Image
                                src={InstagramLogo}
                                alt="Instagram logo"
                                width={100}
                                height={100}
                                className='h-[32px] w-[32px]'
                                style={{width: "auto", height: "auto"}}
                            />
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <hr className='border-primary mb-0' />
        <section className='mt-8'>
            <Tabs defaultValue="nft" className="w-full">
                <TabsList className='w-full max-w-[1050px] mx-auto text-primary flex items-center justify-evenly pt-4 ease-in-out duration-300'>
                <TabsTrigger
                    value="nft"
                    className='data-[state=active]:border-b-2 data-[state=active]:border-primary w-full text-lg xl:text-2xl font-semibold'
                >
                    NFTs
                </TabsTrigger>
                <TabsTrigger
                    value="owned"
                    className='data-[state=active]:border-b-2 data-[state=active]:border-primary w-full text-lg xl:text-2xl font-semibold'
                >
                    Owned
                </TabsTrigger>
                <TabsTrigger
                    value="collection"
                    className='data-[state=active]:border-b-2 data-[state=active]:border-primary w-full text-lg xl:text-2xl font-semibold flex items-center space-x-3'
                >
                          Collection
                          { collections && <span className="w-7 h-7 rounded-full bg-secondary ml-3 text-base flex items-center justify-center">{collections.length}</span>}
                </TabsTrigger>
                </TabsList>
                <TabsContent value="nft" className='bg-secondary h-full border-b border-background'>
                <div className='max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0 py-20 md:py-0'>
                    <Suspense fallback={<LoadingGrid />}>
                        <UserNfts
                            className={"bg-background"}
                        />
                    </Suspense>
                </div>
                </TabsContent>
                <TabsContent value="owned" className='bg-secondary h-full border-b border-background'>
                <div className='max-w-[1050px] mx-auto'>
                    <Suspense fallback={<LoadingGrid />}>
                    <div className="text-center py-10">
                        <h2 className="text-xl font-semibold">No owned/unlisted NFT found</h2>
                        <p className="text-gray-500">Check back later for new bought/minted NFTs</p>
                    </div>
                    </Suspense>
                </div>
                </TabsContent>
                <TabsContent value="collection" className='bg-secondary h-full border-b border-background'>
                <div className='max-w-[1050px] mx-auto'>
                    <Suspense fallback={<LoadingGrid />}>
                    {/* <div className="text-center py-10">
                        <h2 className="text-xl font-semibold">No Collection found</h2>
                        <p className="text-gray-500">Check back later for new collection</p>
                    </div> */}
                        <UserCollections
                           userAddress={address as `0x${string}`}
                        />
                    </Suspense>
                </div>
                </TabsContent>
            </Tabs>
        </section>
    </div>
  )
}

export default CreatorDetails