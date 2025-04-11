import { LoadingGrid } from '@/components/loading';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreatorsTable from '@/components/creators-table';


export default async function CreatorsPage() {

  return (
    <main className="">
      <section className='max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0'>
        <div className='my-10'>
          <h1 className="text-3xl md:text-4xl xl:text-5xl font-semibold mb-3">Top Creators</h1>
          <p className='text-xl xl:text-2xl mb-7'>Check out top ranking NFT artists on the NFT Marketplace.</p>
        </div>
      </section>
      <hr className='border-primary mb-0' />
      <section className='mt-8 px-8 md:px-11 lg:px-36 xl:px-0'>
      <Tabs defaultValue="today" className="w-full">
        <TabsList className='w-full max-w-[1050px] mx-auto text-primary flex items-center justify-evenly pt-4 ease-in-out duration-300'>
          <TabsTrigger
            value="today"
            className='data-[state=active]:border-b-2 data-[state=active]:border-primary w-full text-lg xl:text-2xl font-semibold'
          >
            Today
          </TabsTrigger>
          <TabsTrigger
            value="week"
            className='data-[state=active]:border-b-2 data-[state=active]:border-primary w-full text-lg xl:text-2xl font-semibold'
          >
            This Week
            </TabsTrigger>
            <TabsTrigger
            value="month"
            className='data-[state=active]:border-b-2 data-[state=active]:border-primary w-full text-lg xl:text-2xl font-semibold'
          >
            This Month
          </TabsTrigger>
          <TabsTrigger
            value="allTime"
            className='data-[state=active]:border-b-2 data-[state=active]:border-primary w-full text-lg xl:text-2xl font-semibold'
          >
            All Time
          </TabsTrigger>
        </TabsList>
        <TabsContent value="today" className='bg-secondary h-full border-b border-background'>
          <div className='max-w-[1050px] mx-auto'>
              <Suspense fallback={<LoadingGrid />}>
                <CreatorsTable timeRange="today" allCreators={allCreators} />
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="week" className='bg-secondary h-full border-b border-background'>
          <div className='max-w-[1050px] mx-auto'>
            <Suspense fallback={<LoadingGrid />}>
              <CreatorsTable timeRange="week" allCreators={allCreators} />
            </Suspense>
          </div>
          </TabsContent>
          <TabsContent value="month" className='bg-secondary h-full border-b border-background'>
          <div className='max-w-[1050px] mx-auto'>
            <Suspense fallback={<LoadingGrid />}>
              <CreatorsTable timeRange="month" allCreators={allCreators} />
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="allTime" className='bg-secondary h-full border-b border-background'>
          <div className='max-w-[1050px] mx-auto'>
            <Suspense fallback={<LoadingGrid />}>
              <CreatorsTable timeRange="allTime" allCreators={allCreators} />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
      </section>
    </main>
  );
}

const allCreators = [
  {
    rank: 1,
    image: '/creator1.jpg',
    name: 'CryptoPunkFan',
    address: '0x8a9...3e4f',
    change: '+12.5%',
    nftsSold: 142,
    volume: 45.2
  },
  {
    rank: 2,
    image: '/creator2.jpg',
    name: 'NFTArtist',
    address: '0x7b2...5c6d',
    change: '+8.3%',
    nftsSold: 98,
    volume: 32.7
  },
  {
    rank: 3,
    image: '/creator3.jpg',
    name: 'DigitalDreamer',
    address: '0x6c3...9b2a',
    change: '+5.9%',
    nftsSold: 76,
    volume: 28.1
  },
  // Add more creators as needed
]