import { shortenAddress } from "@/lib";
import { Bid } from "@/types";
import { formatEther } from "ethers";


const BidHistory = ({ bids }: { bids: Bid[] }) => {
    if (bids.length === 0) {
      return <p className="text-gray-500 mt-4">No bids yet</p>;
    }

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Bid History</h3>
        <div className="space-y-3">
          {bids
            .sort((a, b) => Number(b.amount) - Number(a.amount))
            .map((bid, index) => (
              <div key={index} className="w-full flex justify-between items-center rounded-lg">
                <div className="flex items-center justify-between gap-3 text-sm w-full">
                  <p className="font-medium">{shortenAddress(bid.bidder)}</p>
                  <p className="">{formatEther(bid.amount)} ETH</p>
                </div>
                {/* <div className="text-right">
                  <p className="font-bold">{formatEther(bid.amount)} ETH</p>
                  <p className="text-sm text-gray-400">
                    {new Date(bid.timestamp * 1000).toLocaleString()}
                  </p>
                </div> */}
              </div>
            ))}
        </div>
      </div>
    );
  };

  export default BidHistory