import CreatorDetails from '@/components/CreatorDetails';
import { ethers } from 'ethers';

const CreatorPage = async ({params}: {
  params: Promise<{ creatorAddress: string }>
}) => {
  const rawCreatorAddress = (await params).creatorAddress;
  const creatorAddress = ethers.hexlify(rawCreatorAddress);

  return (
    <main>
      <CreatorDetails creatorAddress={creatorAddress as `0x${string}`} />
    </main>
  )
}

export default CreatorPage