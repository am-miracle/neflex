import React from 'react'
import AuctionNft from '../auction-nft'
import { parseEther } from 'ethers'

const NftAuction = () => {
  return (
    <div>
      <AuctionNft
        nft={{
          id: "1",
          collectionAddress: "0xb30527b29bd209dd4d159224c399cc2d40f5d4aa",
          tokenId: BigInt(1),
          name: "Blooms tat",
          image: "https://ipfs.io/ipfs/QmPoiN7VHUPvbErJENMcth1enXd2dnoEPFaZbVg1H7i8GK",
          creator: "0x1360eDa247bF2fEfeCc5FD5926aC1EF628b19733",
          currentBid: parseEther("0.001"),
          auctionEndTime: Math.floor(Date.now() / 1000) + 86400
        }}
       />
    </div>
  )
}

export default NftAuction