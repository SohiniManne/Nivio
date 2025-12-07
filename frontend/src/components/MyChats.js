import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import ChatLoading from "./ChatLoading";
import { Button, useColorModeValue } from "@chakra-ui/react"; // Added hook
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain, setFetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  // COLORS
  const bg = useColorModeValue("white", "#111B21");
  const borderColor = useColorModeValue("#d1d7db", "#2A3942");
  const headerBg = useColorModeValue("#F0F2F5", "#202C33");
  const textColor = useColorModeValue("black", "white");
  const selectedBg = useColorModeValue("#F0F2F5", "#2A3942");
  
  const fetchChats = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({ status: "error", title: "Failed to Load Chats", duration: 5000 });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const getSender = (loggedUser, users) => {
    if(!users || !loggedUser) return "";
    return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={0} // No Padding inside
      bg={bg}
      w={{ base: "100%", md: "30%" }} // 30% width sidebar
      borderRadius="0" // Square corners
      borderRight="1px solid" // Separator line
      borderColor={borderColor}
      h="100%"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "24px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        bg={headerBg}
        p="10px"
        color={textColor}
      >
        My Chats
        <GroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            size="sm"
          >
            New Group
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={0}
        bg={bg}
        w="100%"
        h="100%"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll" spacing={0}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? selectedBg : "transparent"}
                color={textColor}
                px={3}
                py={4}
                borderBottom="1px solid"
                borderColor={borderColor}
                key={chat._id}
                _hover={{ background: selectedBg }}
              >
                <Text fontWeight="500">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;