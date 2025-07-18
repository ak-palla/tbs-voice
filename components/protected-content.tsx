import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export function withProtectedContent<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return async function ProtectedPage(props: P) {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }

    return <WrappedComponent {...props} />;
  };
} 