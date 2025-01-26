// app/api/createCollection/route.ts
import { NextResponse } from 'next/server';
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from '@/constants/abis/NFTCollectionFactory';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

export async function POST(request: Request) {
  try {
    const { name, symbol, baseURI } = await request.json();

    if (!name || !symbol || !baseURI) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Viem client
    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    // Call the createCollection function
    const { result: collectionAddress } = await client.simulateContract({
      address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
      abi: NFT_COLLECTION_FACTORY_ABI,
      functionName: 'createCollection',
      args: [name, symbol, baseURI],
    });

    return NextResponse.json({
      success: true,
      collectionAddress,
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}