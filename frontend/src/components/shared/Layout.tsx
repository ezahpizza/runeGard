import { useRef } from 'react';
import { SignInButton, SignOutButton, useUser } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';
import { Header, DockNav } from './index';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isSignedIn, user } = useUser();
  const location = useLocation();
  const signInRef = useRef<HTMLButtonElement>(null);
  const signOutRef = useRef<HTMLButtonElement>(null);

  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background font-body overflow-hidden">
      <div style={{ display: 'none' }}>
        <SignInButton mode="modal">
          <button ref={signInRef} />
        </SignInButton>
        <SignOutButton>
          <button ref={signOutRef} />
        </SignOutButton>
      </div>

      <Header />
      
      <DockNav
        isSignedIn={isSignedIn}
        signInRef={signInRef}
        signOutRef={signOutRef}
        user={user}
      />

      <div className={isLandingPage ? '' : 'pb-28'}>
        {children}
      </div>
    </div>
  );
};
