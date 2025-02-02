import { ethers } from 'ethers';
import React from 'react'

const CreatorPage = async (props: {
  params: Promise<{ creatorId: string }>
}) => {
  const { creatorId: rawCreatorId } = await props.params;
  const creatorId = ethers.hexlify(rawCreatorId);
  
  console.log(creatorId)
  return (
    <div>
      
    </div>
  )
}

export default CreatorPage