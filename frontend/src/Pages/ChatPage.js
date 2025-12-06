import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import ChatBox from "../components/ChatBox"; // We will make this soon
import MyChats from "../components/MyChats"; // We will make this soon
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box d="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {/* Placeholder components until we build them in the next step */}
        {user && <Box w="30%">My Chats (Coming Soon)</Box>} 
        {user && <Box w="68%">Chat Box (Coming Soon)</Box>}
      </Box>
    </div>
  );
};

export default ChatPage;