import { redirect } from "next/navigation";

export default async function SuccessPageWithId({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/checkout/success?booking_id=${id}`);
}

