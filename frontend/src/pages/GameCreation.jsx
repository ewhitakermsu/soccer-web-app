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
  Select,
} from '@mantine/core';

export default function CreateGame() {

    const [gameLocation, setGameLocation] = useState("");
    const [gameDate, setGameDate] = useState("");
    const [gameTime, setGameTime] = useState("");
    const [gameStatus, setGameStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleGameCreation = async (event) => {
      event.preventDefault();
      setErrorMessage(""); // Clear old errors
  
      // Beginning of client-side validation to match back-end validation
      if (!gameLocation || !gameDate || !gameTime || !gameStatus) {
        setErrorMessage("Missing required fields.");
        return;
      }
  
      // Validate game date (MM-DD-YYYY)
      const gameDatePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
      if (!gameDatePattern.test(gameDate)) {
        setErrorMessage("Date of game must be in this format: (MM-DD-YYYY)");
        return;
      }
  
      // Check if game date is valid
      let dateObj = new Date(gameDate);
      if (isNaN(dateObj)) {
        setErrorMessage("Date of game provided is not a valid date.");
        return;
      }
  
      // Check that the game date is not in the past
      const currentDate = new Date();
      if (dateObj < currentDate) {
        setErrorMessage("Date of game cannot be in the past.");
        return;
      }
  
      // Validate game time (military format)
      const gameTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!gameTimePattern.test(gameTime)) {
        setErrorMessage("Time of game must be entered in military format: (00:00).");
        return;
      }
  
      // Validate game status (must match specific values)
      if (
        gameStatus !== "Scheduled" &&
        gameStatus !== "Updated" &&
        gameStatus !== "Finished" &&
        gameStatus !== "Cancelled"
      ) {
        setErrorMessage(
          "Game status must be listed as one of these values: Scheduled, Updated, Finished, or Cancelled."
        );
        return;
      }
  
      // If all checks pass, proceed with submitting the form
      try {
        const response = await axiosInstance.post("/api/creategame", {
          gameLocation,
          gameDate,
          gameTime,
          gameStatus,
        });
  
        console.log("Game Creation success:", response.data);
        navigate("/home");
      } catch (error) {
        console.error("Game Creation error:", error);
        setErrorMessage(
          "Game Creation failed. Please check the information that you provided."
        );
      }
    };
  

    return (
        <Container size={420} my={40}>
          <Title ta="center">
            Create a game!
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            Want to go back to the home page?{' '}
            {/*Redirects the user to the register route when they click on the "Create account" link*/}
            <Anchor size="sm" component={Link} to='/home'>
              Home
            </Anchor>
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={handleGameCreation}>
          
          <TextInput label="Location of Game" 
            placeholder="Desired Location" 
            required 
            mt="md" 
            value={gameLocation}
            onChange={(event) => setGameLocation(event.currentTarget.value)}
          />
          
          <TextInput label="Date of Game" 
            placeholder="MM-DD-YYYY" 
            required 
            mt="md" 
            value={gameDate}
            onChange={(event) => setGameDate(event.currentTarget.value)}
          />

          <TextInput label="Time of Game" 
            placeholder="00:00" 
            required 
            mt="md" 
            value={gameTime}
            onChange={(event) => setGameTime(event.currentTarget.value)}
          />

          <Select
            label="Game Status"
            placeholder="Select Game Status"
            data={['Scheduled', 'Updated', 'Finished', 'Cancelled']}
            value={gameStatus}
            onChange={setGameStatus}
            required
            allowDeselect
            mt="md"
          />

          {errorMessage && (
            <Text c="red" size="sm" mt="md">
              {errorMessage}
            </Text>
          )}
  
          <Button fullWidth mt="xl" type="submit">
            Submit
          </Button>
        </Paper>
    </Container>
    );
}