import React, { useState } from "react";
import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const history = useHistory();

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      // Note: We are sending the data to our backend proxy (port 5000)
      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input placeholder="Enter Your Name" onChange={(e) => setName(e.target.value)} />
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input placeholder="Enter Your Email" onChange={(e) => setEmail(e.target.value)} />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input type={show ? "text" : "password"} placeholder="Enter Password" onChange={(e) => setPassword(e.target.value)} />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      
      {/* We are hiding the image upload for the 10-hour speedrun to save time. It will use a default avatar. */}
      
      <Button colorScheme="blue" width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;