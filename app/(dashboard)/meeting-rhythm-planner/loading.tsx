import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <Spinner className="h-10 w-10" />
    </div>
  );
} 