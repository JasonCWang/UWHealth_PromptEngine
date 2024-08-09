import { useNavigate } from "react-router-dom";
import { useAuth } from '../components/AuthProvider';
import { NavLink } from "@mantine/core";

import { FaPen, FaAward, FaCrown, FaHome, FaNotesMedical, FaQuestionCircle, FaSignInAlt, FaSignOutAlt, FaBookMedical} from "react-icons/fa";
import { AiOutlineRight } from "react-icons/ai";

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
        color="black"
        variant={"light"}
        active
      />
      <NavLink
        onClick={() => goToPage('/readme')}
        label="Clinician Guide"
        leftSection={<FaPen size={14} />}
        color="red"
        active
      />
      <NavLink
        onClick={() => goToPage('/about')}
        label="About CliniPrompt"
        leftSection={<FaQuestionCircle size={14} />}
        color="blue"
        active
      />

      {user ?

        <>
          <NavLink
            onClick={() => goToPage('/prompting')}
            label="Create Prompt"
            leftSection={<FaNotesMedical size={14} />}
            rightSection={<AiOutlineRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />}
            color="indigo"
            variant="filled"
            active
          />

          <NavLink
            onClick={() => goToPage('/history')}
            label="Prompt History"
            leftSection={<FaBookMedical size={14} />}
            rightSection={<AiOutlineRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />}
            color="pink"
            variant="filled"
            active
          />

          <NavLink
            onClick={() => goToPage('/topusers')}
            label="Top Users"
            leftSection={<FaCrown size={14} />}
            rightSection={<AiOutlineRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />}
            color="lime"
            variant="filled"
            active
          />

          <NavLink
            onClick={() => goToPage('/leaderboard')}
            label="Leaderboard"
            leftSection={<FaAward size={14} />}
            rightSection={<AiOutlineRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />}
            color="yellow"
            variant="filled"
            active
          />

        </>

        : 
        <>
        <NavLink
          onClick={() => goToPage('/prompting')}
          label="Create Prompt"
          leftSection={<FaNotesMedical size={14} />}
          disabled
        />

        <NavLink
          onClick={() => goToPage('/history')}
          label="Prompt History"
          leftSection={<FaBookMedical size={14} />}
          color="indigo"
          disabled
        />

        <NavLink
          onClick={() => goToPage('/topusers')}
          label="Top Users"
          leftSection={<FaCrown size={14} />}
          color="lime"
          disabled
        />

        <NavLink
          onClick={() => goToPage('/leaderboard')}
          label="Prompt Leaderboard"
          leftSection={<FaAward size={14} />}
          color="yellow"
          disabled
        />

      </>}
      {
        user ?
          <NavLink
            onClick={() => handleLogout()}
            label="Sign Out"
            leftSection={<FaSignOutAlt size={14} />}
            color={"black"}
            active
          />
          :
          <NavLink
            onClick={() => goToPage('/login')}
            label="Sign In"
            leftSection={<FaSignInAlt size={14} />}
            color={"black"}
            active
          />
      }

    </>
  );
};

export default Navbar;
