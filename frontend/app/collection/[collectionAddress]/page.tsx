import React from 'react'

const CollectionAddressPage = async ({ params }: {
    params: Promise<{
      collectionAddress: string,
    }>
}) => {
    const collectionAddress = (await params).collectionAddress

    console.log("collection", collectionAddress)
  return (
    <div>CollectionAddressPage</div>
  )
}

export default CollectionAddressPage