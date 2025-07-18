import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { InstructionForm } from "../instruction-form";

interface Params {
  id: string;
}

interface Props {
  params: Params;
}

export default async function EditInstructionPage({ params }: Props) {
  const supabase = await createClient();
  
  const { data: instruction, error } = await supabase
    .from("chatbot_instructions")
    .select("*")
    .eq("id", params.id)
    .single();
    
  if (error || !instruction) {
    notFound();
  }
  
  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Instruction</h1>
      <InstructionForm instruction={instruction} />
    </div>
  );
} 