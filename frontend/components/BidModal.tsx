"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { formatEther, parseEther } from "viem"
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import toast from "react-hot-toast"
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from "@/constants/abis/NFTMarketplace"
import CustomButton from "./custom/CustomButton"
import { useRouter } from "next/navigation"

interface BidModalProps {
  isOpen: boolean
  onClose: () => void
  collectionAddress: `0x${string}`
  tokenId: bigint
  currentBid: bigint
}

export default function BidModal({
  isOpen,
  onClose,
  collectionAddress,
  tokenId,
  currentBid,
}: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('')
  const router = useRouter()

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isBidding, isSuccess } = useWaitForTransactionReceipt({ hash })

    const { data: minBidIncrement } = useReadContract({
      address: MARKETPLACE_ADDRESS as `0x${string}`,
      abi: MARKETPLACE_ABI,
      functionName: 'getMinBidIncrement',
    })

  // Calculate minimum bid
  const minBid = BigInt(currentBid) + (minBidIncrement ?? BigInt(1000000000000000))

  const handleBid = async () => {
    try {
      if (!bidAmount) {
        toast.error('Please enter a bid amount')
        return
      }

      const bidInWei = parseEther(bidAmount)
      if (bidInWei <= BigInt(currentBid)) {
        toast.error('Bid must be higher than current bid')
        return
      }

      if (bidInWei < minBid) {
        toast.error(`Minimum bid increment is ${formatEther(minBidIncrement ?? BigInt(1000000000000000))} ETH`)
        return
      }

      writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'placeBid',
        args: [ collectionAddress as `0x${string}`, BigInt(tokenId)],
        value: bidInWei
      })

    } catch (error: Error | unknown) {
      console.error('Error placing bid:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place a bid')
    }
  }

  // Close modal on success
  useEffect(() => {
    if (isSuccess) {
      toast.success('Bid placed successfully!')
      router.refresh();
      onClose()
    }
  }, [isSuccess, onClose, router])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background text-white">
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-xl font-bold">{formatEther(BigInt(currentBid))} ETH</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Minimum Bid</p>
            <p className="text-xl font-bold">{formatEther(minBid)} ETH</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="bid" className="text-sm font-medium leading-none">
              Your Bid (ETH)
            </label>
            <Input
              id="bid"
              type="number"
              step="0.001"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bg-white text-black rounded-[20px] h-12"
              placeholder="Enter bid amount"
            />
          </div>
        </div>
        <CustomButton
          type="button"
          title={isBidding ? 'Placing Bid...' : 'Place Bid'}
          onClick={handleBid}
          isLoading={isBidding}
          className="bg-accent h-[60px] text-base w-full"
        />
      </DialogContent>
    </Dialog>
  )
}
