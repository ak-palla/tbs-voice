import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
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
    <>
      <form className="flex flex-col min-w-64 max-w-64 mx-auto space-y-4">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input name="fullName" placeholder="John Doe" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input name="businessName" placeholder="Your Business Name" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" placeholder="you@example.com" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input name="phoneNumber" type="tel" placeholder="+1 (555) 555-5555" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentOption">Payment Option</Label>
          <Select name="paymentOption" required>
            <SelectTrigger>
              <SelectValue placeholder="Select payment option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL">Full Payment</SelectItem>
              <SelectItem value="6_MONTH_SPLIT">6 Month Split</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentRemaining">Payment Remaining (EX VAT)</Label>
          <Input 
            name="paymentRemaining" 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="commandHqLink">Command HQ Link</Label>
          <Input 
            name="commandHqLink" 
            type="url" 
            placeholder="https://..." 
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="commandHqCreated">Command HQ Created</Label>
            <Switch name="commandHqCreated" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="gdFolderCreated">GD Folder Created</Label>
            <Switch name="gdFolderCreated" />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="meetingScheduled">3-1 Meeting Scheduled</Label>
            <Switch name="meetingScheduled" />
          </div>
        </div>

        <SubmitButton formAction={signUpAction} pendingText="Signing up...">
          Sign up
        </SubmitButton>
        <FormMessage message={searchParams} />
      </form>
      <SmtpMessage />
    </>
  );
}
