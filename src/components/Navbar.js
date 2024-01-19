import { useNavigate } from "react-router-dom";
import { useAuth } from '../components/AuthProvider';
import { NavLink } from "@mantine/core";

import { FaAward, FaCrown, FaHome, FaNotesMedical, FaQuestionCircle, FaSignInAlt, FaSignOutAlt, FaBookMedical } from "react-icons/fa";

const Navbar = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const goToPage = (route) => {
    navigate(route);
  };

  return (
    <>
      <NavLink
        onClick={() => goToPage('/')}
        label="Home"
        leftSection={<FaHome size={14} />}
        color="blue"
        variant={"light"}
        active
      />

      {user ?

        <>

          <NavLink
            onClick={() => goToPage('/prompting')}
            label="Create Prompts!"
            leftSection={<FaNotesMedical size={14} />}
            active
            variant={"gradient"}
          />

          <NavLink
            onClick={() => goToPage('/history')}
            label="Prompt History"
            leftSection={<FaBookMedical size={14} />}
            color="pink"
            active
            variant="filled"
          />

          <NavLink
            onClick={() => goToPage('/topusers')}
            label="Top Users"
            leftSection={<FaCrown size={14} />}
            color="lime"
            active
            variant="filled"
          />

          <NavLink
            onClick={() => goToPage('/leaderboard')}
            label="Prompt Leaderboard"
            leftSection={<FaAward size={14} />}
            color="yellow"
            active
            variant="filled"
          />


        </>

        : null}

      <NavLink
        onClick={() => goToPage('/about')}
        label="About CliniPrompt"
        leftSection={<FaQuestionCircle size={14} />}
        color="yellow"
        active
      />

      {
        user ?
          <NavLink
            onClick={() => handleLogout()}
            label="Sign Out"
            leftSection={<FaSignOutAlt size={14} />}
            color={"gray"}
            variant="subtle"
            active
          />
          :
          <NavLink
            onClick={() => goToPage('/login')}
            label="Sign In"
            leftSection={<FaSignInAlt size={14} />}
            color={"gray"}
            active
          />
      }

    </>
  );
};

export default Navbar;
