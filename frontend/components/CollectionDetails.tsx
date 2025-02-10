import React from 'react'


interface CollectionDetailsProps {
    collectionAddress: `0x${string}`
}

const CollectionDetails = ({collectionAddress}: CollectionDetailsProps) => {
  return (
    <div>{collectionAddress}</div>
  )
}

export default CollectionDetails