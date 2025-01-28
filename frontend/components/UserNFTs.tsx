// components/UserNFTs.tsx
"use client"
import { NFT_COLLECTION_ABI, NFT_COLLECTION_ADDRESS } from '@/constants/abis/NFTCollection';
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/constants/abis/NFTMarketplace';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';

// interface UserNFTProps {
//   collectionAddress: string;
// }
export const UserNFTs = () => {
  const { address } = useAccount();

  // Fetch the number of NFTs owned by the user
  const { data: balanceOf } = useReadContract({
    address: NFT_COLLECTION_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });



  // Fetch the token IDs owned by the user
  const tokenIds = Array.from({ length: Number(balanceOf) }, (_, i) => i);
  const tokenOfOwnerByIndexCalls = tokenIds.map((index) => ({
    address: NFT_COLLECTION_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [address as `0x${string}`, BigInt(index)],
  }));

  const { data: userTokenIds } = useReadContracts({
    contracts: tokenOfOwnerByIndexCalls,
  });

  // Fetch metadata for each token
  const tokenMetadataCalls = userTokenIds?.map((tokenId) => ({
    address: NFT_COLLECTION_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_ABI,
    functionName: 'tokenURI',
    args: [tokenId.result as bigint],
  })) || [];

  const { data: tokenMetadata } = useReadContracts({
    contracts: tokenMetadataCalls,
  });
  

  // Fetch listings for each token ID
  const listingCalls = userTokenIds?.map((tokenId) => ({
    address: MARKETPLACE_ADDRESS as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'getListing',
    args: [NFT_COLLECTION_ADDRESS as `0x${string}`, tokenId.result as bigint],
  })) || [];

  const { data: listings } = useReadContracts({
    contracts: listingCalls,
  });
  
  console.log("balanceOf", balanceOf)
  console.log("user token Id", userTokenIds)
  console.log("token metadata", tokenMetadata)
  console.log("listing", listings)


  // Filter listings to only include those created by the user
  // const userListings = listings?.filter((listing) => listing.result?.seller === address);

  if (!balanceOf || !userTokenIds) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Minted NFTs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokenMetadata?.map((metadata, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="text-xl font-bold">Token ID: {userTokenIds[index].result?.toString()}</h3>
            <p>Metadata: {metadata.result as string}</p>
            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
              List on Marketplace
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Your Listed NFTs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* {userListings?.map((listing: any, index: number) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="text-xl font-bold">Token ID: {userTokenIds[index].result?.toString()}</h3>
            <p>Price: {listing.result?.price} ETH</p>
            <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
              Cancel Listing
            </button>
          </div>
        ))} */}
      </div>
    </div>
  );
};