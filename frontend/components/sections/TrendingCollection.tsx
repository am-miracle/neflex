import { getClient } from '@/lib/apollo-client';
import { GET_COLLECTIONS } from '@/lib/queries';
import React, { Suspense } from 'react'
import CollectionGrid from '../CollectionGrid';

const TrendingCollection = async () => {

    const { data } = await getClient().query({
      query: GET_COLLECTIONS,
      variables: {
          first: 3,
          skip: 0,
      },
    });
  return (
    <section className='px-8 py-10 md:px-11 lg:px-36 text-white my-10'>
      <div className='max-w-[1050px] mx-auto'>
        <div className='grid gap-2 mb-12'>
          <h1 className='text-4xl font-bold'>Trending Collection</h1>
          <p>Checkout our weekly updated trending collection.</p>
        </div>
       <div>
          <Suspense fallback={<p>Loading ..</p>}>
            <CollectionGrid
              data={data}
            />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

export default TrendingCollection