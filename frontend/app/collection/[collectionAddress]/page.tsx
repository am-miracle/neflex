import CollectionDetails from '@/components/CollectionDetails'
import { ethers } from 'ethers';
import Image from 'next/image';
import React from 'react'

const CollectionAddressPage = async ({ params }: {
    params: Promise<{
      collectionAddress: string,
    }>
}) => {
  const rawCollectionAddress = (await params).collectionAddress;
  const collectionAddress = ethers.hexlify(rawCollectionAddress)

    console.log("collection", collectionAddress)
  return (
    <main className="">
      <section className='max-w-[1050px] mx-auto'>
        <div className='my-10 px-8 md:px-11 lg:px-36 xl:px-0'>
          <div className='flex items-center gap-3'>
            <Image
              src={""}
              alt='collection image'
              width={100}
              height={100}
            />
            <div>
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-semibold mb-3"> Collection</h1>
               <p>Collection symbol (MM)</p>
            </div>
          </div>
          <p className='text-xl xl:text-2xl mb-7'>All NFTs for - collections</p>
        </div>
      </section>
      <hr className='border-primary mb-0' />
      <section className='mt-8'>
      <CollectionDetails collectionAddress={collectionAddress as `0x${string}`} />
      </section>
    </main>
  )
}

export default CollectionAddressPage