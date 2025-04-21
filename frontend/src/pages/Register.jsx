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

//This was built using code from this link: https://ui.mantine.dev/category/authentication/
//I should probably come back and use some kind of DatePicker from Mantine for the date of birth
export default function Register() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("");
  const [dominantFoot, setDominantFoot] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // Clear old errors

    // Beginnning of client-side data validation
    const errors = [];

    // Trim and validate required fields
    if (!firstName || !lastName || !email || !password || !birthDate || !gender) {
      errors.push("Missing required fields.");
    }

    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      errors.push("First and last name must be at least two characters long.");
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email.trim())) {
      errors.push("Email must be provided in an appropriate format.");
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)/;
    if (password.length < 8 || !passwordPattern.test(password)) {
      errors.push("Password must be at least 8 characters and include an uppercase letter and a number.");
    }

    const birthDatePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!birthDatePattern.test(birthDate)) {
      errors.push("Date of birth must be in MM-DD-YYYY format.");
    } else {
      const [mm, dd, yyyy] = birthDate.split("-");
      const dateObj = new Date(`${yyyy}-${mm}-${dd}`);
      const today = new Date();
      const earliest = new Date(1900, 0, 1);
      if (isNaN(dateObj.getTime()) || dateObj > today || dateObj < earliest) {
        errors.push("The date of birth provided is unrealistic for a living person.");
      }
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      errors.push("Gender must be Male, Female, or Other.");
    }

    const feet = Number(heightFeet);
    const inches = Number(heightInches);
    if (isNaN(feet) || feet < 4 || feet > 7) {
      errors.push("Height in feet must be between 4 and 7.");
    }
    if (isNaN(inches) || inches < 0 || inches > 11) {
      errors.push("Height in inches must be between 0 and 11.");
    }

    if (dominantFoot && !["Right", "Left"].includes(dominantFoot)) {
      errors.push("Dominant foot must be either Right or Left.");
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(" "));
      return;
    }

    try {
      const response = await axiosInstance.post("/register", {
        firstName,
        lastName,
        email,
        password,
        birthDate,
        gender,
        heightFeet,
        heightInches,
        preferredPosition,
        dominantFoot,
      });

      console.log("Registration success:", response.data);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Registration failed. Please check the information you provided.");
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Register with us!</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Anchor size="sm" component={Link} to="/">
          Log In
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" component="form" onSubmit={handleRegister}>
        <TextInput label="First Name" placeholder="Your First Name" required value={firstName} onChange={(e) => setFirstName(e.currentTarget.value)} />
        <TextInput label="Last Name" placeholder="Your Last Name" required value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} />
        <TextInput label="Email" placeholder="user@example.com" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        <PasswordInput label="Password" placeholder="Your password" required mt="md" value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
        <TextInput label="Date of Birth" placeholder="MM-DD-YYYY" required mt="md" value={birthDate} onChange={(e) => setBirthDate(e.currentTarget.value)} />

        <Select
          label="Gender"
          placeholder="Select gender"
          data={["Male", "Female", "Other"]}
          value={gender}
          onChange={setGender}
          required
          allowDeselect
          mt="md"
        />

        <TextInput label="Height in Feet" placeholder="X Feet" mt="md" value={heightFeet} onChange={(e) => setHeightFeet(e.currentTarget.value)} />
        <TextInput label="Height in Inches" placeholder="X Inches" mt="md" value={heightInches} onChange={(e) => setHeightInches(e.currentTarget.value)} />

        <Select
          label="Preferred Position"
          placeholder="Select your preferred position"
          data={[
            "Goalkeeper",
            "Center Back",
            "Full Back",
            "Wing Back",
            "Defensive Midfielder",
            "Central Midfielder",
            "Attacking Midfielder",
            "Winger",
            "Striker",
          ]}
          value={preferredPosition}
          onChange={setPreferredPosition}
          allowDeselect
          mt="md"
        />

        <Select
          label="Dominant Foot"
          placeholder="Select your dominant foot"
          data={["Right", "Left"]}
          value={dominantFoot}
          onChange={setDominantFoot}
          allowDeselect
          mt="md"
        />

        {errorMessage && (
          <Text c="red" size="sm" mt="md">
            {errorMessage}
          </Text>
        )}

        <Button fullWidth mt="xl" type="submit">
          Register
        </Button>
      </Paper>
    </Container>
  );
}