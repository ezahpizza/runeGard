import { VscHome, VscAccount, VscSignIn, VscSignOut } from 'react-icons/vsc';
import { IoIosInformationCircleOutline } from "react-icons/io";
import { useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Dock from '@/components/ui/Dock';
import { motion } from 'framer-motion';

type DockNavProps = {
  isSignedIn?: boolean;
  signInRef?: React.RefObject<HTMLButtonElement>;
  signOutRef?: React.RefObject<HTMLButtonElement>;
};

const DockNav = ({ isSignedIn, signInRef, signOutRef }: DockNavProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goHome = useCallback(() => navigate('/'), [navigate]);
  const goabout = useCallback(() => navigate('/about'), [navigate]);
  const goProfile = useCallback(() => navigate('/profile'), [navigate]);

  const handleAuthClick = useCallback(() => {
    if (isSignedIn) {
      signOutRef.current?.click();
    } else {
      signInRef.current?.click();
    }
  }, [isSignedIn, signInRef, signOutRef]);

  const icons = useMemo(() => ({
    home: <VscHome size={18} />,
    about: <IoIosInformationCircleOutline size={23} />,
    profile: <VscAccount size={18} />,
    signIn: <VscSignIn size={18} />,
    signOut: <VscSignOut size={18} />,
  }), []);

  const baseItems = useMemo(() => ([
    { icon: icons.home, label: 'Home', onClick: goHome },
    { icon: icons.about, label: 'Learn More', onClick: goabout },
    { icon: icons.profile, label: 'Profile', onClick: goProfile },
  ]), [icons, goHome, goabout, goProfile]);

  const homeItems = useMemo(() => ([
    ...baseItems,
    {
      icon: isSignedIn ? icons.signOut : icons.signIn,
      label: isSignedIn ? 'Sign Out' : 'Sign In',
      onClick: handleAuthClick,
    },
  ]), [baseItems, isSignedIn, handleAuthClick, icons]);

  const items = pathname === '/' ? homeItems : baseItems;

  return (
    <motion.div
      className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto w-fit"
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Dock 
        className="bg-lavenda"
        items={items}
        panelHeight={90}
        baseItemSize={60}
        magnification={90}
      />
    </motion.div>
  );
};

export default DockNav;
