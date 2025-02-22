import { LoadingGrid } from '@/components/loading';
import { Suspense } from 'react';
import SearchNft from './SearchNft';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GET_COLLECTIONS } from '@/lib/queries';
import { getClient } from '@/lib/apollo-client';
import CollectionGrid from '@/components/CollectionGrid';
import NftGrid from '@/components/NftGrid';


export default async function MarketplacePage() {
  const { data } = await getClient().query({
    query: GET_COLLECTIONS,
    variables: {
      first: 12,
      skip: 0,
    },
  });

  return (
    <main className="">
      <section className='max-w-[1050px] mx-auto'>
        <div className='my-10 px-8 md:px-11 lg:px-36 xl:px-0'>
          <h1 className="text-3xl md:text-4xl xl:text-5xl font-semibold mb-3">Browse Marketplace</h1>
          <p className='text-xl xl:text-2xl mb-7'>Browse through more than 50k NFTs on the NFT Marketplace.</p>
          <SearchNft />
        </div>
      </section>
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
            value="collection"
            className='data-[state=active]:border-b-2 data-[state=active]:border-primary w-full text-lg xl:text-2xl font-semibold'
          >
            Collection
          </TabsTrigger>
        </TabsList>
        <TabsContent value="nft" className='bg-secondary h-full border-b border-background'>
          <div className='max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0 py-20 md:py-0'>
              <Suspense fallback={<LoadingGrid />}>
                <NftGrid />
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="collection" className='bg-secondary h-full border-b border-background'>
          <div className='max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0 py-20 md:py-0'>
            <Suspense fallback={<LoadingGrid />}>
                {data.length === 0 ? (
                  <div className="text-center py-10">
                    <h2 className="text-xl font-semibold">No Collection found</h2>
                    <p className="text-gray-500">Check back later for new collection</p>
                  </div>
                ): (
                    <CollectionGrid
                      data={data}
                      itemsPerPage={12}
                      showPagination={true}
                      className='bg-background'
                  />
                )}
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
      </section>
    </main>
  );
}
