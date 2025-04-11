import CollectionDetails from '@/components/CollectionDetails'
import { ethers } from 'ethers'
import Image from 'next/image'
import { getClient } from '@/lib/apollo-client'
import { GET_COLLECTION_BY_COLLECTION_ADDRESS } from '@/lib/queries'
import Link from 'next/link'

interface CollectionProps {
  name: string
  symbol: string
  collectionAddress: `0x${string}`
  baseTokenURI: string
  creator: string
}

const CollectionAddressPage = async ({params}: {
  params: Promise<{ collectionAddress: string }>
}) => {
  const rawCollectionAddress = (await params).collectionAddress;
  const collectionAddress = ethers.hexlify(rawCollectionAddress)

  const { data } = await getClient().query({
    query: GET_COLLECTION_BY_COLLECTION_ADDRESS,
    variables: { collectionAddress },
  })

  const collection: CollectionProps = data?.collectionCreateds?.[0]

  if (!collection) {
    return (
      <div className="max-w-[1050px] mx-auto px-8 py-12 text-center">
        <h1 className="text-2xl font-bold">Collection not found</h1>
        <p className="mt-2 text-gray-500">
          The collection with address {collectionAddress} doesn&apos;t exist
        </p>
      </div>
    )
  }

  return (
    <main className="pb-12">
      {/* Collection Header */}
      <section className="">
        <div className="max-w-[1050px] mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={collection.baseTokenURI}
                alt={collection.name}
                width={192}
                height={192}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{collection.name}</h1>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Symbol</p>
                  <p className="font-medium">{collection.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Creator</p>
                  <Link href={`/creators/${collection.creator}`} className='hover:underline'>
                    <p className="font-mono text-sm truncate">
                      {collection.creator}
                    </p>
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contract</p>
                  <p className="font-mono text-sm truncate">
                    {collection.collectionAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NFT Collection */}
      <section className="mt-8">
        <CollectionDetails collectionAddress={collectionAddress as `0x${string}`} />
      </section>
    </main>
  )
}

export default CollectionAddressPage