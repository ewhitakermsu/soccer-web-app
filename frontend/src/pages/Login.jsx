import React, {useState} from "react"
import axiosInstance from "../authentication/axiosInstance"
import { Link, useNavigate } from "react-router-dom"
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
//import classes from './LoginStyle.module.css';


//This was built using code from this link: https://ui.mantine.dev/category/authentication/
export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    //Client-side validation to match the backend validation
    if (!email || !password) {
      setErrorMessage("Email and password are required!");
      return;
    }

    console.log("Login form submitted");

    try {
      const response = await axiosInstance.post("/login", {
        email,
        password,
      });

      console.log("Full response:", response);

      const { token } = response.data;

      if (!token) {
        console.warn("Token missing in response:", response.data);
        setErrorMessage("Login failed: Token not provided.");
        return;
      }

      console.log("Token received from backend:", token);

      //Stores the token in local storage for later retrieval
      localStorage.setItem('token', token);
      console.log("Token stored in localStorage");
      console.log("Login success:", response.data);
      navigate("/home");

    } catch (error) {
      console.error("Login error:", error);
      console.log("Full error response:", error?.response);
      setErrorMessage("Login failed. Please check your email and password.");
    }
  };


  return (
    <Container size={420} my={40}>
      <Title ta="center">
        Welcome to KickUp!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        {/*Redirects the user to the register route when they click on the "Create account" link*/}
        <Anchor size="sm" component={Link} to='/register'>
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={handleLogin}>
        <TextInput label="Email"
        placeholder="user@example.com"
        required 
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
        />

        <PasswordInput label="Password" 
        placeholder="Your password" 
        required 
        mt="md" 
        value={password}
        onChange={(event) => setPassword(event.currentTarget.value)}
        />

        {errorMessage && (
          <Text c="red" size="sm" mt="md">
            {errorMessage}
          </Text>
        )}

        <Button fullWidth mt="xl" type="submit">
          Sign in
        </Button>
      </Paper>
    </Container>
  );
  }