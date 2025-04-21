import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../authentication/axiosInstance";
import GameCard from "../components/GameCard";
import LogoutButton from "../components/LogoutButton";
import { Container, Title, Group, Button, Text, Loader,
  Anchor
 } from "@mantine/core";

export default function Home() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  const handleCreateGame = () => {
    navigate("/gamecreation");
  };

  const handleProfileRedirect = () => {
    navigate('/profile'); // Redirect to the Profile Page
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axiosInstance.get("/api/games");
        setGames(response.data);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
  }, []);

  return (
    <div style={{ position: "relative" }}>
    <Container size="md" mt="x1">
      <Title ta="center">KickUp Soccer Game Manager</Title>
      <img 
        src="soccerball.webp"
        alt="Soccer Image"
        style={{
          width: '250px', 
          height: 'auto', 
          borderRadius: '8px', 
          marginBottom: '20px', 
          display: 'block', 
          marginLeft: 'auto', 
          marginRight: 'auto'
        }} 
      />
      
      <LogoutButton />
      <Button
        variant="outline"
        color="blue"
        size="sm"
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
        }}
        onClick={handleProfileRedirect}
      >
        Go to Profile
      </Button>
      <Title order={2} mb="lg">Available Games</Title>
      <Button fullWidth mt="xl" onClick={handleCreateGame}>
        Create a Game
      </Button>
      {games.map((game) => (
        <GameCard key={game.GameID} game={game} />
      ))}
    </Container>
    </div>
  );
}