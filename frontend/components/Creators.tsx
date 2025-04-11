import React from 'react'
import Image from 'next/image'

const Creators = () => {
  // Dummy data for 3 top creators
  const topCreators = [
    {
      rank: 1,
      image: '/creator1.jpg',
      name: 'CryptoPunkFan',
      address: '0x8a9...3e4f',
      change: '+12.5%',
      nftsSold: 142,
      volume: 45.2
    },
    {
      rank: 2,
      image: '/creator2.jpg',
      name: 'NFTArtist',
      address: '0x7b2...5c6d',
      change: '+8.3%',
      nftsSold: 98,
      volume: 32.7
    },
    {
      rank: 3,
      image: '/creator3.jpg',
      name: 'DigitalDreamer',
      address: '0x6c3...9b2a',
      change: '+5.9%',
      nftsSold: 76,
      volume: 28.1
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {topCreators.map(creator => (
        <div key={creator.rank} className="bg-secondary rounded-xl p-6 flex items-center gap-4">
          <span className="text-xl font-bold text-accent">{creator.rank}</span>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent">
            <Image
              src={creator.image}
              alt={creator.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{creator.name}</h3>
            <p className="text-sm text-gray-400">{creator.address}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm ${creator.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {creator.change}
              </span>
              <span className="text-sm">• {creator.nftsSold} NFTs</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Creators