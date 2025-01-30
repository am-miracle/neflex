import { UserNFTs } from '@/components/UserNFTs'
import { ethers } from 'ethers';
import React from 'react'

const CreatorPage = async (props: {
  params: Promise<{ creatorId: string }>
}) => {
  const { creatorId: rawCategoryId } = await props.params;
    const creatorId = ethers.hexlify(rawCategoryId);
  
  console.log(creatorId)
  return (
    <div>
      <UserNFTs />
    </div>
  )
}

export default CreatorPage