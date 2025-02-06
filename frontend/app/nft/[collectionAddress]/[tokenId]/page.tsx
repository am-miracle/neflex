import NFTDetails from '@/components/NFTDetails';

export default async function NFTDetailPage({params}: { params: Promise<{ tokenId: string }> }) {
    const rawTokenId = (await params).tokenId;
    const tokenId = BigInt(rawTokenId);

    console.log(tokenId)

    return (
      <NFTDetails
        // nftData={data}
        // creatorData={creatorData}
      />
    );
  }