"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import CustomButton from "./custom/CustomButton";
import { Upload } from "lucide-react";
import { NFT_COLLECTION_FACTORY_ABI, NFT_COLLECTION_FACTORY_ADDRESS } from "@/constants/abis/NFTCollectionFactory";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import toast from "react-hot-toast";

const CreateCollectionForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);

  const { writeContract, data: hash } = useWriteContract();
  const {  isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({ hash });

useEffect(() => {
  if (isConfirmed && receipt) {
    // Add proper type guards and error handling
    const log = receipt.logs.find(log => 
      log.address.toLowerCase() === NFT_COLLECTION_FACTORY_ADDRESS.toLowerCase()
    );

    if (log?.topics && log.topics.length >= 2) {
      const rawAddress = log.topics[1]?.slice(26);
      if (rawAddress) {
        const collectionAddress = `0x${rawAddress}`;
        router.push(`/mint?collection=${collectionAddress}`);
        return;
      }
    }

    // Handle error case
    console.error("Failed to extract collection address from transaction logs");
    toast.error("Collection created but failed to redirect. Check your collections.");
  }
}, [isConfirmed, receipt, router]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.symbol || !formData.file) {
      alert("Please fill in all fields and upload a collection image.");
      return;
    }

    setIsUploading(true);

    try {
      const imageFormData = new FormData();
      imageFormData.append("file", formData.file);
      const uploadResponse = await fetch("/api/uploadCollectionImage", {
        method: "POST",
        body: imageFormData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload collection image");
      const { ipfsHash } = await uploadResponse.json();
      const baseURI = `https://ipfs.io/ipfs/${ipfsHash}/`;

      writeContract({
        address: NFT_COLLECTION_FACTORY_ADDRESS as `0x${string}`,
        abi: NFT_COLLECTION_FACTORY_ABI,
        functionName: "createCollection",
        args: [formData.name, formData.symbol, baseURI, BigInt(100)],
      });

    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <form onSubmit={handleCreateCollection}>
      <Card className="p-6">
        <CardContent className="space-y-4">
          {/* Collection Name */}
          <div>
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              className="bg-white rounded-[20px] h-12"
              value={formData.name}
              placeholder="eg. Your Collection Name"
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Collection Symbol */}
          <div>
            <Label htmlFor="symbol">Collection Symbol</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              className="bg-white rounded-[20px] h-12"
              placeholder="eg. YOURSYMBOL"
              onChange={(e) => setFormData((prev) => ({ ...prev, symbol: e.target.value }))}
              required
            />
          </div>

          {/* Collection Image Upload */}
          <div>
            <Label>Collection Image</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => setFormData((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                id="file"
              />
              <Label htmlFor="file" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <span className="mt-2 block text-sm text-gray-600">
                  {formData.file ? formData.file.name : "Click to upload collection image"}
                </span>
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <CustomButton
            type="submit"
            title={isUploading ? "Creating..." : "Create Collection"}
            className="bg-accent h-12 text-base w-full mt-8"
            isLoading={isUploading}
          />
        </CardContent>
      </Card>
    </form>
  );
};

export default CreateCollectionForm;