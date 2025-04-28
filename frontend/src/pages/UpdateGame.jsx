import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TextInput, Button, Container, Paper, Select, Grid, Title, Group, Loader } from '@mantine/core';
import axiosInstance from '../authentication/axiosInstance';

export default function EditGamePage() {
  const { GameID } = useParams();  // GameID is passed as a URL parameter
  console.log('GameID:', GameID);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        console.log("Fetching game with ID:", GameID);
        const response = await axiosInstance.get(`/api/games/${GameID}`);
        setGameData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };
    
    fetchGameData();
  }, [GameID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear old error message

    // Beginning of client-side data validation to match backend validation
    const { gameLocation, gameDate, gameTime, gameStatus } = gameData;

    if (!gameLocation || !gameDate || !gameTime || !gameStatus) {
      setErrorMessage("Missing required fields.");
      return;
    }

    // Validate game date (DD-MM-YYYY)
    const gameDatePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!gameDatePattern.test(gameDate)) {
      setErrorMessage("Date of game must be in this format: (DD-MM-YYYY)");
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

    try {
      await axiosInstance.put(`/api/games/${GameID}`, gameData);  // Update the game
      navigate('/home');  // Redirect to the home page after successful update
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };

  if (loading) {
    return <Loader />;
  } 

  return (
    <Container size="sm" my={40}>
      <Title ta="center">Update Game</Title>
      <Paper withBorder shadow="md" p={30} radius="md" sx={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Grid gutter="md" sx={{ width: '100%' }}>
          <Grid.Col span={6}>
            <TextInput 
              label="Game Location" 
              value={gameData.gameLocation} 
              onChange={(e) => setGameData({ ...gameData, gameLocation: e.target.value })}
              sx={{ width: '100%', minWidth: '100%' }}
            />
            </Grid.Col>
          <Grid.Col span={6}> 
            <TextInput 
              label="Date" 
              value={gameData.gameDate} 
              onChange={(e) => setGameData({ ...gameData, gameDate: e.target.value })}
              sx={{ width: '100%', minWidth: '100%' }}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput 
              label="Time" 
              value={gameData.gameTime} 
              onChange={(e) => setGameData({ ...gameData, gameTime: e.target.value })}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
                label="Game Status"
                value={gameData.gameStatus}
                onChange={(value) => setGameData({ ...gameData, gameStatus: value })}
                data={['Scheduled', 'Updated', 'Finished', 'Cancelled']}  // Dropdown options
                required
              />
          </Grid.Col>
            <Button fullWidth type="submit">
              Update Game
            </Button>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}