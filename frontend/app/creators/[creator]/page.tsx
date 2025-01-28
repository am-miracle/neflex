import { UserNFTs } from '@/components/UserNFTs'
import React from 'react'

const page = async ({
  params,
}: {
  params: { creatorId: string };
  }) => {
  const { creatorId } = await params;
  
  console.log(creatorId)
  return (
    <div>
      <UserNFTs />
    </div>
  )
}

export default page