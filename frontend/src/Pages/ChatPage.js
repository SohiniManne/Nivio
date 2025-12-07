import { Box } from "@chakra-ui/layout";
import { useState } from "react";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    // FIX: Using Flex Column ensures elements stack properly without overlapping
    <Box w="100%" h="100vh" display="flex" flexDirection="column">
      
      {/* Header Area */}
      {user && <SideDrawer />}
      
      {/* Content Area - Takes up remaining space */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        w="100%" 
        flex="1" 
        overflow="hidden"
      >
        {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;