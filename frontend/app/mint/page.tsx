import MintPage from "@/components/mint-page";

type SearchParamsType = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function mintPage(props: {
  searchParams: SearchParamsType;
}) {
  // Await and pass the resolved searchParams to the client component
  const searchParams = await props.searchParams;
  
  return <MintPage searchParams={searchParams} />;
}