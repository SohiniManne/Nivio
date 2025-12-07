import React, { useState } from "react";
import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const history = useHistory();

  // FIX: Initialize with empty strings instead of undefined
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
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

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
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
      <FormControl id="email-login" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input 
          value={email} 
          placeholder="Enter Your Email" 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </FormControl>

      <FormControl id="password-login" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input 
            type={show ? "text" : "password"} 
            value={password} 
            placeholder="Enter Password" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button colorScheme="blue" width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
        Login
      </Button>
      <Button variant="solid" colorScheme="red" width="100%" onClick={() => {
        setEmail("guest@example.com");
        setPassword("123456");
      }}>
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;