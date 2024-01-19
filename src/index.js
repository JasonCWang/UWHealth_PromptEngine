import App from "./App";
import ReactDOM from "react-dom";
import React from "react";
import { AuthProvider } from "./components/AuthProvider";

import '@mantine/carousel/styles.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <MantineProvider>
        <Notifications />
        <App />
      </MantineProvider>
    </AuthProvider>
  </React.StrictMode>
  ,
  document.getElementById("root")
);