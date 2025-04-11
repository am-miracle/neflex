import Image from "next/image"

interface CreatorsTable {
    timeRange?: string
    allCreators: {
      rank: number
      image: string
      name: string
      address: string
      change: string
      nftsSold: number
      volume: number
    }[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreatorsTable = ({ timeRange, allCreators }: CreatorsTable) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full max-w-[1050px] mx-auto">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-4 px-4">#</th>
              <th className="text-left py-4 px-4">Artist</th>
              <th className="text-right py-4 px-4 hidden sm:table-cell">Change</th>
              <th className="text-right py-4 px-4">NFTs Sold</th>
              <th className="text-right py-4 px-4 hidden md:table-cell">Volume</th>
            </tr>
          </thead>
          <tbody>
            {allCreators.map(creator => (
              <tr key={creator.rank} className="border-b border-gray-700 hover:bg-secondary/50">
                <td className="py-4 px-4 font-bold">{creator.rank}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={creator.image}
                        alt={creator.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{creator.name}</div>
                      <div className="text-sm text-gray-400">{creator.address}</div>
                    </div>
                  </div>
                </td>
                <td className={`py-4 px-4 text-right hidden sm:table-cell ${
                  creator.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                }`}>
                  {creator.change}
                </td>
                <td className="py-4 px-4 text-right">{creator.nftsSold}</td>
                <td className="py-4 px-4 text-right hidden md:table-cell">{creator.volume} ETH</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  export default CreatorsTable