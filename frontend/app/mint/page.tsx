import MintPage from "@/components/mint-page";

type SearchParamsType = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function mintPage(props: {
  searchParams: SearchParamsType;
}) {
  const searchParams = await props.searchParams;
  
  return <MintPage searchParams={searchParams} />;
}