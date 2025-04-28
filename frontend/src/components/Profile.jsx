import React, { useEffect, useState } from 'react';
import axiosInstance from "../authentication/axiosInstance";
import { getUserFromToken } from '../authentication/auth';
import { Container, Text, Paper, Grid, Title, Group, Loader, TextInput, Flex, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = getUserFromToken();
        if (!user) return; // If the user is not logged in, don't fetch the profile
        
        const response = await axiosInstance.get('/api/user/profile');
        setUserProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!userProfile) {
    return <Text>No user data found</Text>;
  }

  return (
    <Container size="sm" my={20}>
      <Title ta="center" mb="md">User Profile</Title>
      
      <Flex justify="center">
        <Grid gutter="sm">
            <Grid.Col span={6}>
              <TextInput label="First Name" value={userProfile.firstName} readOnly size="md" />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Last Name" value={userProfile.lastName} readOnly size="md" />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Email" value={userProfile.email} readOnly size="md" />
            </Grid.Col>
            <Grid.Col span={6}>            
              <TextInput label="Date of Birth" value={userProfile.birthDate} readOnly size="md" />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Gender" value={userProfile.gender} readOnly size="md" />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Height in Feet" value={userProfile.heightFeet} readOnly size="md" />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Height in Inches" value={userProfile.heightInches} readOnly size="md" />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Preferred Position" value={userProfile.preferredPosition} readOnly size="md" />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput label="Dominant Foot" value={userProfile.dominantFoot} readOnly size="md" />
            </Grid.Col>

            <Button fullWidth variant="light" mt="md" onClick={() => navigate('/home')}>
            Back to Home
            </Button>
          
            </Grid>
      </Flex>
    </Container>
  );
}