import { DishDetail } from "@/components/menu/dish-detail";
import { AppShell } from "@/components/menu/app-shell";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DishPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <div className="px-5 lg:px-0 lg:py-8">
        <DishDetail dishId={id} />
      </div>
    </AppShell>
  );
}
