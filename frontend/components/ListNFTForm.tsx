"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from 'react-hot-toast'
import { parseEther } from 'viem'
import { NFT_COLLECTION_ABI, NFT_COLLECTION_ADDRESS } from '@/constants/abis/NFTCollection'
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/constants/abis/NFTMarketplace'
import CustomButton from './custom/CustomButton'
import { CategoryAdded } from '@/types'

interface ListNFTFormProps {
  tokenId: bigint;
  categories: CategoryAdded[]
}

interface ListingFormData {
  listingType: 'fixed' | 'auction'
  price: string
  category: string
}

const ListNFTForm: React.FC<ListNFTFormProps> = ({ tokenId, categories }) => {
  const router = useRouter()
  const { address } = useAccount()
  const [formData, setFormData] = useState<ListingFormData>({
    listingType: 'fixed',
    price: '',
    category: ''
  })
  const [isApproving, setIsApproving] = useState(false)
  
  // Approval and listing hooks
  const { writeContract: writeNFTContract } = useWriteContract()
  const { writeContract: writeMarketContract, data: listingHash } = useWriteContract()
  const { isLoading: isApprovalLoading, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: listingHash
  })

  // Approval status check
  const { data: isApprovedForAll } = useReadContract({
    address: NFT_COLLECTION_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_ABI,
    functionName: 'isApprovedForAll',
    args: [address as `0x${string}`, MARKETPLACE_ADDRESS as `0x${string}`]
  })

  useEffect(() => {
    if (isApprovalSuccess) {
      toast.success('Marketplace approval completed')
      setIsApproving(false)
    }
  }, [isApprovalSuccess])

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      await writeNFTContract({
        address: NFT_COLLECTION_ADDRESS as `0x${string}`,
        abi: NFT_COLLECTION_ABI,
        functionName: 'setApprovalForAll',
        args: [MARKETPLACE_ADDRESS as `0x${string}`, true],
      })
    } catch (error: Error | unknown) {
      console.error('Approval failed:', error)
      toast.error(error instanceof Error ? error.message : 'Approval failed')
      setIsApproving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.price || !formData.category || !address) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const priceInWei = parseEther(formData.price)
      const categoryBytes = formData.category.padEnd(66, '0') as `0x${string}`
      const isAuction = formData.listingType === 'auction'

      await writeMarketContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: 'listItem',
        args: [
          NFT_COLLECTION_ADDRESS as `0x${string}`,
          tokenId,
          priceInWei,
          isAuction,
          categoryBytes,
        ],
        gas: BigInt(300000),
      })

      router.push(`/nft/${tokenId.toString()}`)
    } catch (error) {
      console.error('Listing failed:', error)
      toast.error('Failed to list NFT')
    }
  }


  const handleFormChange = (field: keyof ListingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      {/* Listing Type Selection */}
      <div className="space-y-3">
        <Label>Listing Type</Label>
        <RadioGroup
          value={formData.listingType}
          onValueChange={(value: 'fixed' | 'auction') => handleFormChange('listingType', value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fixed" id="fixed" />
            <Label htmlFor="fixed">Fixed Price</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auction" id="auction" />
            <Label htmlFor="auction">Auction</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Price Input */}
      <div className="space-y-2">
        <Label htmlFor="price">Price (ETH)</Label>
        <Input
          id="price"
          type="number"
          step="0.001"
          min="0"
          required
          value={formData.price}
          onChange={(e) => handleFormChange('price', e.target.value)}
          className="bg-white rounded-[20px] h-12 text-base text-background block w-full ps-14 p-2.5"
          placeholder="Enter price in ETH"
        />
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleFormChange('category', value)}
          required
        >
          <SelectTrigger
            className="bg-white rounded-[20px] h-12 text-base text-background w-full"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent
            className="bg-white rounded-[20px] text-base text-background active:text-white w-full"
          >
            {categories?.map((category: CategoryAdded, index: number) => (
              <SelectItem key={index} value={category.category}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Approval Button (if not approved) */}
      {!isApprovedForAll && (
        <CustomButton
          type="button"
          title={isApproving ? "Approving..." : "Approve Marketplace"}
          onClick={handleApprove}
          isLoading={isApproving || isApprovalLoading}
          isDisabled={!address}
          className="w-full bg-accent h-12"
        />
      )}

      {/* Submit button */}
      <CustomButton
        type="submit"
        title={isApprovalLoading ? 'Listing...' : 'List NFT'}
        isLoading={isApprovalLoading}
        isDisabled={!isApprovedForAll || !address}
        className="w-full bg-accent h-12"
      />
    </form>
  )
}

export default ListNFTForm