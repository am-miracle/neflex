"use client"
import { CollectionCreated } from '@/types/nft';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface CollectionProps {
    data: {
     collectionCreateds: CollectionCreated[]
    }
    className?: string;
}

const CollectionGrid = ({data}: CollectionProps) => {

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:py-20 lg:py-20`}>
        {data.collectionCreateds.map((collection: CollectionCreated) => {

            // You might want to replace this with an actual owner image or fallback
            const ownerImage = 'https://via.placeholder.com/100'

            return (
                <Link
                    href={`/collection/${collection.collectionAddress}`}
                    key={collection.id}
                >
                    <div className='rounded-[20px] overflow-hidden transform transition-all duration-300 hover:scale-95'>
                        <Image
                            src={collection.baseTokenURI}
                            alt={collection.name}
                            width={100}
                            height={100}
                            className="min-h-[315px] max-h-[315px] xl:max-h-[330px] min-w-full object-cover"
                            style={{width: "auto", height: "auto"}}
                        />
                    </div>
                    <h1>{collection.name}</h1>
                    <div className='flex items-center'>
                        <Image
                            src={ownerImage}
                            alt={"owner"}
                            width={100}
                            height={100}
                            className="w-full h-full rounded-full mr-3 object-cover"
                            style={{width: "auto", height: "auto"}}
                        />
                        <p>{collection.creator.slice(4,4)}</p>
                    </div>
                </Link>
            )
        })}
    </div>
  )
}

export default CollectionGrid