import { InstructionForm } from "../instruction-form";

export default function NewInstructionPage() {
  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-semibold mb-6">Add New Instruction</h1>
      <InstructionForm />
    </div>
  );
} 