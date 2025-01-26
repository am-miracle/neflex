import { NextResponse } from 'next/server';
import FormData from 'form-data';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      pinataFormData,
      {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${pinataFormData.getBoundary()}`,
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    return NextResponse.json({
      ipfsHash: response.data.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}