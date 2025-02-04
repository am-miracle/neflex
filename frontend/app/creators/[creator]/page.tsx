import CreatorDetails from '@/components/CreatorDetails';

const CreatorPage = async ({params}: {
  params: Promise<{ creatorAddress: string }>
}) => {
  const creatorAddress = (await params).creatorAddress
  console.log("creator address", creatorAddress);

  return (
    <main>
      <CreatorDetails />
    </main>
  )
}

export default CreatorPage