import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MantineProvider} from '@mantine/core';
import '@mantine/core/styles.css';
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import CreateGame from "./pages/GameCreation"
import PrivateRoute from "./components/PrivateRoute";
import ProfilePage from "./components/Profile";
import EditGamePage from './pages/UpdateGame';
import './global.css';


function App() {

  return ( 
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <div style={{ minHeight: '100vh' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>}/>
          <Route path="/register" element={<Register />}/>
          <Route path="/gamecreation" element={<PrivateRoute><CreateGame /></PrivateRoute>}/>
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>}/>
          <Route path="/game/edit/:GameID" element={<PrivateRoute><EditGamePage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  </MantineProvider>
  );
  
}

export default App;
