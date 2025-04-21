import { Card, Text, Group, Button, Select, Modal, List, Loader} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../authentication/axiosInstance";
import { getUserFromToken } from '../authentication/auth';
import { Link } from 'react-router-dom';


export default function GameCard({ game, onDelete }) {

  const [joined, setJoined] = useState(false);
  const [team, setTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  //Function for when a user decides to join a game
  const handleJoinGame = async () => {
    const user = getUserFromToken();
    console.log(user);
    if (!user) return alert("You must be logged in to join a game.");

    // Check if a team is selected before submitting
    if (!selectedTeam) {
      return alert("Please select a team.");
    }
    
    try {
      const res = await axiosInstance.post("/api/usergames", {
        GameID: game.GameID,
        UserID: user.id,
        teamNumber: Number(selectedTeam), //Assigned to the appropriate team from the dropdown box
      });

      setJoined(true);
      setTeam(selectedTeam);
    } catch (err) {
      alert(err.response?.data?.message || "Error joining game.");
    }
  };

  //Function for getting all of the players for a specific game
  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/usergames/${game.GameID}/players`);
      setPlayers(res.data);
    } catch (err) {
      alert("Failed to fetch players.");
    }
    setLoading(false);
  };
  
  //Function for creating the modal that displays the players
  const handleViewPlayers = () => {
    open();        // Open the modal
    fetchPlayers(); // Fetch data when opened
  };

  //Function for deleting a game
  const handleDeleteGame = async () => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/api/mydatabase/games/${game.GameID}`);
        // Call the onDelete function passed from the parent to update the UI
        onDelete(game.GameID);
      } catch (error) {
        console.error("Error deleting game:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  //Function for leaving a game that a user has joined
  const handleLeaveGame = async () => {
    const user = getUserFromToken();
    if (!user) return alert("You must be logged in.");
    const compositeID = `${game.GameID}-${user.id}`;
  
    try {
      await axiosInstance.delete(`/api/usergames/${compositeID}`);
      setJoined(false);
      setTeam(null);
      alert("You have left the game.");
    } catch (err) {
      alert(err.response?.data?.message || "Error leaving game.");
    }
  };
  
  return (
    <>
    <Card withBorder shadow="sm" radius="md" p="lg" my="md">
      <Group position="apart" mb="xs">
        <Text fw={500}>Game #{game.GameID}</Text>
      </Group>

      <Text size="sm" c="dimmed">
        Date:  {game.gameDate}
    </Text>

      <Text size="sm" c="dimmed">
        Location: {game.gameLocation}
      </Text>

      <Text size="sm" c="dimmed">
        Time: {game.gameTime}
      </Text>

      <Text size="sm" c="dimmed">
        Status: {game.gameStatus}
      </Text>

      {joined ? (
        <Text size="sm" mt="md" fw={500} c="green">
          Joined on Team {team}
        </Text>
      ) : (
        <>
          <Select
            label="Choose a team"
            placeholder="Pick a team"
            value={selectedTeam}
            onChange={setSelectedTeam}
            data={[
              { value: '1', label: 'Team 1' },
              { value: '2', label: 'Team 2' },
            ]}
            required
          />

        <Button variant="light" fullWidth mt="md" onClick={handleJoinGame}>
          Join Game
        </Button>
        </>
      )}

      <Button variant="light" fullWidth mt="md" onClick={handleViewPlayers}>
        View Players
      </Button>

      <Button variant="light" color="red" fullWidth mt="md" onClick={handleLeaveGame}>
      Leave Game
      </Button>

      <Group position="right" style={{ marginTop: '10px' }}>
        {/* Edit Button to navigate to the Edit Game page */}
          <Button
            component={Link}
            to={`/game/edit/${game.GameID}`}
            variant="filled"
            color="blue"
            fullWidth
            mt="md"
            >
            Edit Game
          </Button>
      </Group>

      <Button
        variant="light"
        fullWidth
        mt="md"
        color="red"
        onClick={handleDeleteGame}
        loading={loading}
      >
        Delete Game
      </Button>
    </Card>
    <Modal
      opened={opened}
      onClose={close}
      title={`Players in Game #${game.GameID}`}
      centered
    >
      {loading ? (
        <Loader />
      ) : players.length === 0 ? (
        <Text>No players have joined yet.</Text>
      ) : (
        <List spacing="sm">
          {players.map((player, index) => (
            <List.Item key={index}>
              {player.firstName} {player.lastName} — Team {player.teamNumber}
            </List.Item>
          ))}
        </List>
      )}
    </Modal>
  </>
  );
}