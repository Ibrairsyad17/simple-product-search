import { useProfile } from '../../hooks/auth/useProfile';
import { useLogout } from '../../hooks/auth/useLogout';
import { Button } from '../ui/button';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { data: user } = useProfile();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Product Search</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-muted-foreground" />
              <span className="hidden font-medium sm:inline">
                {user.name || user.email}
              </span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
