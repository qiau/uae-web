import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <>
      <title>Sign in | Rheo</title>
      <LoginForm />
      <div className="fixed top-3 right-3">
        <ThemeToggle />
      </div>
    </>
  );
}
