import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import Image from "next/image";

export default async function SignIn(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      <div className="flex-1 flex items-center justify-center p-8">

      

        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded">
          <div className="flex flex-col items-start justify-start">
          <div className="flex justify-center mb-6 ">
              <Image 
                src="https://tradebusinessschool.com/wp-content/uploads/2024/11/TBS-coloured-logo-1.webp"
                alt="Trades Business School Logo"
                width={130}
                height={60}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-left text-black-800">Command HQ</h1>
            <p className="mt-2 text-muted-foreground text-left">
              Your central hub for business growth and success
            </p>
          </div>


          <form className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="rounded-xl border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-800 font-medium">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                  required
                  className="rounded-xl border-gray-200 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
            </div>

            <SubmitButton 
              formAction={signInAction} 
              pendingText="Signing in..." 
              className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-xl py-2.5 transition-colors duration-200 font-medium"
            >
              Sign in
            </SubmitButton>

            {/* <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-gray-600 hover:text-gray-800 hover:underline font-medium">
                Sign up
              </Link>
            </div> */}
          </form>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden ">
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'overlay',
          opacity: 0.3
        }}></div>
        <div className="h-full flex items-center justify-center p-10 relative z-10 backdrop-blur-sm">
          <div className="max-w-lg space-y-8">
            <div className="p-6 rounded-xl ">
              <h2 className="text-2xl font-bold text-white mb-4">Trades Business Command Center</h2>
              <p className="text-white/80 mb-5">Take control of your trade business with our comprehensive management platform designed specifically for trades professionals.</p>
            
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gray-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Strategic Planning</h4>
                    <p className="text-white/80 text-sm">Build and execute your business strategy with expert guidance</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gray-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Growth Tracking</h4>
                    <p className="text-white/80 text-sm">Monitor and accelerate your business growth metrics</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gray-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Team Management</h4>
<<<<<<< HEAD
                    <p className="text-white/80 text-sm">Optimize team performance and collaboration</p>
=======
                    <p className="text-white/80 text-sm">Optimise team performance and collaboration</p>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gray-500 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Business Analytics</h4>
                    <p className="text-white/80 text-sm">Gain insights with comprehensive business reporting</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
