

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      afterSignUpUrl="/select-role"
      redirectUrl="/select-role" // fallback
    />
  );
}
