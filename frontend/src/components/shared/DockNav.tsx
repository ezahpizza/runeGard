import { VscHome, VscAccount, VscSignIn, VscSignOut } from 'react-icons/vsc';
import { IoIosInformationCircleOutline } from "react-icons/io";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Dock from '@/components/ui/Dock';
import { motion } from 'framer-motion';
import type { UserResource } from '@clerk/types';


type DockNavProps = {
  isSignedIn?: boolean;
  signInRef?: React.RefObject<HTMLButtonElement>;
  signOutRef?: React.RefObject<HTMLButtonElement>;
  user?: UserResource;
};

const DockNav = ({ isSignedIn, signInRef, signOutRef, user }: DockNavProps) => {
  const navigate = useNavigate();
  const goHome = useCallback(() => navigate('/'), [navigate]);
  const goabout = useCallback(() => navigate('/about'), [navigate]);
  const goProfile = useCallback(() => navigate(`/profile/${user?.id}`), [navigate, user?.id]);
  const goExplore = useCallback(() => navigate('/explore'), [navigate]);

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
    explore: <HiOutlineUserGroup size={20} />,
    signIn: <VscSignIn size={18} />,
    signOut: <VscSignOut size={18} />,
  }), []);

  const items = useMemo(() => ([
    { icon: icons.home, label: 'Home', onClick: goHome },
    { icon: icons.about, label: 'Learn More', onClick: goabout },
    { icon: icons.explore, label: 'Explore Projects', onClick: goExplore },
    { icon: icons.profile, label: 'Profile', onClick: goProfile },
    {
      icon: isSignedIn ? icons.signOut : icons.signIn,
      label: isSignedIn ? 'Sign Out' : 'Sign In',
      onClick: handleAuthClick,
    },
  ]), [icons, goHome, goabout, goExplore, goProfile, handleAuthClick, isSignedIn]);

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
