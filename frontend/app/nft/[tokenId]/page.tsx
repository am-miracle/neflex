import NFTDetails from '@/components/NFTDetails';
import { ethers } from 'ethers';

export default async function NFTDetailPage(props: { params: Promise<{ tokenId: string }> }) {
    const { tokenId: rawTokenId } = await props.params;
    const tokenId = ethers.hexlify(rawTokenId);

    console.log(tokenId)


    return (
      <NFTDetails
        // nftData={data}
        // creatorData={creatorData}
      />
    );
  }