"use client"
import CreateCollectionForm from "@/components/CreateCollectionForm";
import MintNFTForm from "@/components/MintNFTForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from "@/constants/abis/NFTCollectionFactory";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";

const searchParamsCache = createSearchParamsCache({
  collection: parseAsString.withDefault(""),
});

const MintPage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const { address } = useAccount();
  const { collection } = searchParamsCache.parse(searchParams);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Fetch user's collections
  const { data: collections, error, isLoading } = useReadContract({
    address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_FACTORY_ABI,
    functionName: "getCreatorCollections",
    args: [address as `0x${string}`],
  });

  // Fetch default collection from factory
  const { data: defaultCollection } = useReadContract({
    address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
    abi: NFT_COLLECTION_FACTORY_ABI,
    // functionName: "defaultCollection",
    functionName: "owner",

  });

  return (
    <main className="">
      <section className="max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0">
        <div className="my-10">
          <h1 className="text-3xl md:text-4xl xl:text-5xl font-semibold mb-3">Create NFT</h1>
          <p className="text-xl xl:text-2xl mb-7">Create and mint your NFT</p>
        </div>
      </section>
      <hr className="border-primary mb-0" />
      <section className="my-10 w-full max-w-[1050px] mx-auto px-8 md:px-11 lg:px-36 xl:px-0 text-primary pt-4 ease-in-out duration-300">
        <Tabs defaultValue={collection ? "mint" : "collection"} className="w-full max-w-4xl mx-auto p-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="data-[state=active]:bg-secondary" value="collection">
              Create a new collection
            </TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-secondary" value="default">
              Mint to default collection
            </TabsTrigger>
            <TabsTrigger className="data-[state=active]:bg-secondary" value="mint">
              Mint to existing collection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collection">
            <CreateCollectionForm />
          </TabsContent>

          <TabsContent value="default">
            {defaultCollection ? (
              <MintNFTForm collectionAddress={defaultCollection} />
            ) : (
              <p>Loading default collection...</p>
            )}
          </TabsContent>

          <TabsContent value="mint">
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading collections...</p>
              ) : error ? (
                <p>Error fetching collections.</p>
              ) : (
                <Select onValueChange={(value) => setSelectedCollection(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections?.map((collection: string) => (
                      <SelectItem key={collection} value={collection}>
                        {collection}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedCollection ? (
                <MintNFTForm collectionAddress={selectedCollection} />
              ) : (
                <p className="text-center text-gray-500">Please select a collection.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default MintPage;