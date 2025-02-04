"use client"
import { CollectionCreated } from '@/types/nft';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import OwnerImage from "../assets/owner.svg"
import { shortenAddress } from '@/lib';
import Pagination from './pagination';

interface CollectionProps {
    data: {
        collectionCreateds: CollectionCreated[]
    };
    itemsPerPage: number;
    showPagination?: boolean;
    className?: string;
}

const CollectionGrid = ({ data, itemsPerPage = 3, showPagination = false, className }: CollectionProps) => {
    const [currentPage, setCurrentPage] = React.useState(1);
  const totalItems = data.collectionCreateds.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.collectionCreateds.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

    return (
      <div>
            {className ? (
                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:py-20 lg:py-20`}>
                    {currentItems.map((collection) => (
                        <Link
                            href={`/collection/${collection.collectionAddress}`}
                            key={collection.id}
                            className={"text-foreground rounded-[20px] overflow-hidden w-full transform transition-all duration-300 hover:scale-95"}>
                            {/* NFT Image */}
                            <div className="relative">
                                <Image
                                    src={collection.baseTokenURI}
                                    alt={collection.name}
                                    width={100}
                                    height={100}
                                    className="min-h-[295px] max-h-[238px] xl:max-h-[295px] min-w-full object-cover"
                                    style={{ width: "auto", height: "auto" }}
                                />
                            </div>
                            {/* Card Content */}
                            <div className={`py-6 px-5 bg-background`}>
                                {/* NFT Name */}
                                <h3 className="text-2xl font-semibold mb-2 truncate">
                                    {collection.name}
                                </h3>
                                {/* Owner Information */}
                                <div className="flex items-center space-x-3 mt-3">
                                    {OwnerImage ? (
                                        <div className="w-7 h-7">
                                            <Image
                                                src={OwnerImage}
                                                alt={'Owner'}
                                                width={100}
                                                height={100}
                                                className="w-full h-full rounded-full mr-3 object-cover"
                                                style={{ width: "auto", height: "auto" }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-full mr-3 bg-gray-300">{collection.name[0]}</div>
                                    )}
                                    <p className="font-medium font-mono truncate text-base max-w-[200px]">{shortenAddress(collection.creator)}</p>
                                </div>
                            </div>
                        </Link>
                    )
                    )}
                </div>
            ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`}>
                    {currentItems.map((collection: CollectionCreated) => (
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
                                    style={{ width: "auto", height: "auto" }}
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
                                        style={{ width: "auto", height: "auto" }}
                                    />
                                </div>
                                <p>{shortenAddress(collection.creator)}</p>
                            </div>
                        </Link>
                    )
                    )}
                </div>
        )}
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPagination={showPagination}
        />
      </div>
  )
}

export default CollectionGrid