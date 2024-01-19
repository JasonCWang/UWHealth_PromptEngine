import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Home from './pages/Home';
import AboutPage from "./pages/About";
import Leaderboard from "./pages/Leaderboard"
import TopUsers from "./pages/TopUsers"
import History from "./pages/PromptHistory"

import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Flex, Image } from '@mantine/core';
import Prompting from "./pages/Prompting";
// import clinipromptlogo from './assets/clinipromptlogo.png';

export default function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <Router>
      <AppShell
        style={{ flex: 1, height: "100vh" }}
        header={{ height: 55 }}
        navbar={{
          width: 200,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
      >
        <AppShell.Header zIndex={100}>
          <Flex align={"center"} w="100%" h="100%" px="md">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Image height={28} mt={4.3} ml={12} src={'clinipromptlogo.png'} />
          </Flex>
        </AppShell.Header>
        <AppShell.Navbar zIndex={200}>
          <Navbar />
        </AppShell.Navbar>
        <AppShell.Main style={{ width: '100%', height: "100%" }} zIndex={100}>
          <Flex style={{ flex: 1, width: '100%', height: "100%" }}>
            <Routes>
              <Route path="/prompting" element={<Prompting />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/topusers" element={<TopUsers />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/" element={<Home />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Flex>
        </AppShell.Main>
      </AppShell>
    </Router>

  );
}