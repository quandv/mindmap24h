import { MindMapEditor } from '@/components/editor/MindMapEditor';

export default async function BoardEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MindMapEditor boardId={id} />;
}
