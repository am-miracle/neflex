import NFTDetails from '@/components/NFTDetails';
import { ethers } from 'ethers';

export default async function NFTDetailPage({params}: { params: Promise<{ tokenId: string, collectionAddress: string }> }) {
    const rawTokenId = (await params).tokenId;
    const tokenId = BigInt(rawTokenId);
  const rawCollectionAddress = (await params).collectionAddress
  const collectionAddress = ethers.hexlify(rawCollectionAddress)

  console.log("tokenId", tokenId)
  console.log("collection", collectionAddress)

    return (
      <NFTDetails
        collectionAddress={collectionAddress as `0x${string}`}
        tokenId={tokenId}
      />
    );
  }