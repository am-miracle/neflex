"use client"
import { CollectionCreated } from '@/types/nft';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import OwnerImage from "../assets/owner.svg"
import { shortenAddress } from '@/lib';

interface CollectionProps {
    data: {
     collectionCreateds: CollectionCreated[]
    }
    className?: string;
}

const CollectionGrid = ({data}: CollectionProps) => {

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`}>
        {data.collectionCreateds.map((collection: CollectionCreated) => (
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
                    <h1 className="text-2xl font-semibold mb-2 mt-6 truncate">{collection.name}</h1>
                    <div className='flex items-center space-x-3 font-mono'>
                        <div className="w-7 h-7">
                            <Image
                                src={OwnerImage}
                                alt={'creator'}
                                width={100}
                                height={100}
                                className="w-full h-full rounded-full mr-3 object-cover"
                                style={{width: "auto", height: "auto"}}
                            />
                        </div>
                        <p>{shortenAddress(collection.creator)}</p>
                    </div>
                </Link>
            )
        )}
    </div>
  )
}

export default CollectionGrid