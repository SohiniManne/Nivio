import React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { SingleChat } from "./SingleChat"; // FIX: Added curly braces for Named Import

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();
  const bg = useColorModeValue("#F0F2F5", "#0B141A");

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={0}
      bg={bg}
      w={{ base: "100%", md: "70%" }}
      borderRadius="0"
      h="100%"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;