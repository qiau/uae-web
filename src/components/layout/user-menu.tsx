import { LogOut, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { signOut } from "@/lib/auth-session";

export function UserMenu() {
  const { username } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  // SessionGate clears cached data and redirects once the session is signed out.
  function handleSignOut() {
    setSigningOut(true);
    void signOut();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="gap-2 px-2" aria-label={`Account: ${username}`} />}
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User className="size-3.5" aria-hidden />
        </span>
        <span className="hidden max-w-32 truncate font-mono text-sm sm:inline">{username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="text-xs text-muted-foreground">Signed in as</span>
            <span className="truncate font-mono text-sm text-foreground">{username}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} disabled={signingOut}>
          <LogOut aria-hidden />
          {signingOut ? "Signing out" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
