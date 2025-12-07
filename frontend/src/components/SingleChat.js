import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { IconButton, Spinner, useToast, useColorModeValue } from "@chakra-ui/react";
import { ArrowBackIcon, ViewIcon, PhoneIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import { Link } from "react-router-dom";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  
  // NEW STATES FOR TYPING
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat } = ChatState();
  const toast = useToast();

  // COLORS
  const headerBg = useColorModeValue("#F0F2F5", "#202C33");
  const chatBg = useColorModeValue("#EFEAE2", "#0B141A");
  const inputBg = useColorModeValue("white", "#2A3942");
  const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("#d1d7db", "#2A3942");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");
  const iconColor = useColorModeValue("#54656F", "gray.300");

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({ status: "error", title: "Failed to Load Messages", duration: 5000 });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id); // Stop typing when sent
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          { content: newMessage, chatId: selectedChat._id },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({ status: "error", title: "Failed to send Message", duration: 5000 });
      }
    }
  };

  // NEW: Typing Handler Logic
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // Typing Indicator Logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    // Debouncing: Stop showing "typing" if user stops for 3 seconds
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    
    // Listen for typing events
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // notification
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const getSender = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1] : users[0];
  };

  return (
    <>
      {selectedChat ? (
        <>
          {/* HEADER */}
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={4}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            bg={headerBg}
            color={textColor}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            <Box>
                <Text fontSize="xl" fontWeight="500">
                {!selectedChat.isGroupChat
                    ? getSender(user, selectedChat.users).name
                    : selectedChat.chatName.toUpperCase()}
                </Text>
                {/* Typing Indicator in Header (WhatsApp Style) */}
                {isTyping && (
                   <Text fontSize="xs" color="green.400" fontWeight="bold">
                       typing...
                   </Text>
                )}
            </Box>

            <Box display="flex" alignItems="center">
              <Link to={`/video/${selectedChat._id}?audio=true`}>
                <IconButton display={{ base: "flex" }} icon={<PhoneIcon color={iconColor} />} bg="transparent" />
              </Link>
              <Link to={`/video/${selectedChat._id}`}>
                <IconButton display={{ base: "flex" }} icon={<ViewIcon color={iconColor} />} bg="transparent" />
              </Link>
              {!selectedChat.isGroupChat && (
                <ProfileModal user={getSender(user, selectedChat.users)} />
              )}
            </Box>
          </Box>

          {/* CHAT BODY */}
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg={chatBg}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", overflowY: "scroll", scrollbarWidth: "none" }}>
                <ScrollableChat messages={messages} />
                
                {/* ALTERNATIVE: Typing Bubble at bottom (Optional, kept commented out if you prefer header) */}
                {/* {isTyping && (
                  <div style={{ marginBottom: 15, marginLeft: 10 }}>
                     <p style={{backgroundColor: "#fff", padding: "5px 15px", borderRadius: "20px", width: "fit-content"}}>
                        Typing...
                     </p>
                  </div>
                )} */}
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              <Box display="flex" bg={headerBg} p={2} borderRadius="30px">
                <Input
                  variant="unstyled"
                  bg={inputBg}
                  color={textColor}
                  placeholder="Type a message..."
                  _placeholder={{ color: placeholderColor }}
                  onChange={typingHandler} // Changed from setNewMessage to typingHandler
                  value={newMessage}
                  p={3}
                  borderRadius="20px"
                  fontSize="md"
                />
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" h="100%" bg={chatBg}>
          <Text fontSize="3xl" pb={3} fontFamily="Work sans" color="gray.500">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export { SingleChat };