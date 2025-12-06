import React from "react";
import { Container, Box, Text } from "@chakra-ui/react";

const Homepage = () => {
  return (
    <Container maxW="xl" centerContent>
      <Box
        d="flex"
        justifyContent="center"
        p={3}
        bg={"white"}
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans" color="black">
          Nivio
        </Text>
      </Box>
    </Container>
  );
};

export default Homepage;