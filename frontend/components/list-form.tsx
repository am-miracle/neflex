"use client"

import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/constants/abis/NFTMarketplace'
import { NFT_COLLECTION_ABI } from '@/constants/abis/NFTCollection'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from 'react-hot-toast'
import { CategoryAdded } from '@/types'

interface ListNFTProps {
  collectionAddress: `0x${string}`
  tokenId: bigint
    onSuccess?: () => void
    categories: CategoryAdded[]
}

export function ListNFTForm({ collectionAddress, tokenId, onSuccess, categories }: ListNFTProps) {
  const [price, setPrice] = useState('')
    const [isAuction, setIsAuction] = useState(false)
    const [category, setCategory] = useState('')
  const [duration, setDuration] = useState('86400') // 24 hours in seconds
    const [isApproving, setIsApproving] = useState(false)
    const { address } = useAccount()

  // Check if marketplace is approved
  const { data: isApproved } = useReadContract({
    address: collectionAddress,
    abi: NFT_COLLECTION_ABI,
    functionName: 'isApprovedForAll',
    args: [address as `0x${string}`, MARKETPLACE_ADDRESS as `0x${string}`],
  })

  // Approve marketplace contract
  const { writeContract: writeApprove, data: approveHash } = useWriteContract()

  // Wait for approval transaction
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  // List NFT
  const { writeContract: writeList, data: listHash } = useWriteContract()

  // Wait for list transaction
  const { isLoading: isListLoading, isSuccess: isListSuccess } = useWaitForTransactionReceipt({
    hash: listHash,
  })

  // Handle approval
  const handleApprove = async () => {
    try {
      setIsApproving(true)
      await writeApprove({
        address: collectionAddress,
        abi: NFT_COLLECTION_ABI,
        functionName: 'setApprovalForAll',
        args: [MARKETPLACE_ADDRESS as `0x${string}`, true],
      })
    } catch (error) {
      console.error('Error approving:', error)
      toast.error("Failed to approve marketplace")
    }
  }

  // Handle listing
  const handleList = async () => {
    try {
      if (!price) {
        toast.error("Please enter a price")
        return
      }

      const priceInWei = parseEther(price)
        const auctionDuration = isAuction ? BigInt(duration) : BigInt(0);
        const categoryBytes = category.padEnd(66, '0') as `0x${string}`

        writeList({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'listItem',
        args: [
          collectionAddress,
          tokenId,
          priceInWei,
          isAuction,
          categoryBytes,
          auctionDuration
        ],
      })
    } catch (error) {
      console.error('Error listing:', error)
      toast.error("Failed to list NFT")
    }
  }

  // Handle success
  if (isListSuccess) {
    toast.success("NFT listed successfully!")
    onSuccess?.()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>List NFT for Sale</CardTitle>
        <CardDescription>
          Set your price and listing type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isApproved && !isApproveSuccess && (
          <Button 
            onClick={handleApprove} 
            disabled={isApproveLoading || isApproving}
            className="w-full"
          >
            {isApproveLoading ? "Approving..." : "Approve Marketplace"}
          </Button>
        )}

        <div className="space-y-2">
          <Label htmlFor="price">Price (ETH)</Label>
          <Input
            id="price"
            type="number"
            step="0.000001"
            min="0"
            placeholder="Enter price in ETH"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={isAuction}
            onCheckedChange={setIsAuction}
          />
          <Label>List as auction</Label>
        </div>

        {isAuction && (
          <div className="space-y-2">
            <Label htmlFor="duration">Auction Duration</Label>
            <Select
              value={duration}
              onValueChange={setDuration}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3600">1 Hour</SelectItem>
                <SelectItem value="86400">24 Hours</SelectItem>
                <SelectItem value="172800">48 Hours</SelectItem>
                <SelectItem value="604800">7 Days</SelectItem>
                <SelectItem value="2592000">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
              
        <div className="space-y-2">
            <Label htmlFor="duration">Auction Duration</Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category: CategoryAdded, index: number) => (
                    <SelectItem key={index} value={category.category}>
                    {category.name}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleList}
          disabled={(!isApproved && !isApproveSuccess) || isListLoading}
        >
          {isListLoading ? "Listing..." : "List NFT"}
        </Button>
      </CardFooter>
    </Card>
  )
}