import { FighterDetailView } from '@/widgets/fighter-detail';

interface FighterPageProps {
  params: Promise<{ id: string }>;
}

export default async function FighterPage({ params }: FighterPageProps) {
  const { id } = await params;
  return <FighterDetailView id={id} />;
}
