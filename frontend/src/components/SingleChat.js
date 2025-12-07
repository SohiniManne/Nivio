import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { IconButton, Spinner, useToast, useColorModeValue } from "@chakra-ui/react";
import { ArrowBackIcon, PhoneIcon, AttachmentIcon } from "@chakra-ui/icons";
import { FaVideo } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // IMAGE UPLOAD STATE
  const [picLoading, setPicLoading] = useState(false);
  const inputFile = useRef(null);

  const { user, selectedChat, setSelectedChat } = ChatState();
  const toast = useToast();

  const headerBg = useColorModeValue("#F0F2F5", "#202C33");
  const chatBg = useColorModeValue("#EFEAE2", "#0B141A");
  const inputBg = useColorModeValue("white", "#2A3942");
  const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("#d1d7db", "#2A3942");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");
  const iconColor = useColorModeValue("#54656F", "gray.300");

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({ status: "error", title: "Failed to Load Messages", duration: 5000 });
    }
  };

  const sendMessage = async (event, imageContent = null) => {
    if ((event && event.key === "Enter" && newMessage) || imageContent) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        };
        
        const contentToSend = imageContent || newMessage;
        setNewMessage("");
        
        const { data } = await axios.post("/api/message", { content: contentToSend, chatId: selectedChat._id }, config);
        
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({ status: "error", title: "Failed to send Message", duration: 5000 });
      }
    }
  };

  // -----------------------------------------------------------------------
  // IMAGE ONLY HANDLER (Restricted to Images < 10MB)
  // -----------------------------------------------------------------------
  const imageHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. STRICT CHECK: Is this an image?
      if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/webp") {
         toast({
            title: "File not supported",
            description: "Please upload an image (JPEG, PNG, WEBP)",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "bottom",
         });
         return;
      }
      
      // 2. CHECK SIZE (10MB Limit)
      if (file.size > 10485760) {
         toast({
            title: "File too large",
            description: "Please select an image smaller than 10MB",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "bottom",
         });
         return;
      }

      setPicLoading(true);
      const data = new FormData();
      data.append("file", file);
      
      // YOUR REAL KEYS
      data.append("upload_preset", "abc"); 
      data.append("cloud_name", "xyz");       

      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dlzixmoox/image/upload", { 
          method: "post",
          body: data,
        });
        
        const jsonData = await res.json();
        
        if (jsonData.error) {
            throw new Error(jsonData.error.message);
        }

        setPicLoading(false);
        sendMessage(null, jsonData.secure_url.toString());
        
      } catch (error) {
        setPicLoading(false);
        toast({ title: "Upload Failed", description: error.message, status: "error", duration: 5000 });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
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
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
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
              {isTyping && (
                <div style={{ width: 40, height: 20, marginLeft: 0 }}>
                  <Lottie options={defaultOptions} width={40} />
                </div>
              )}
            </Box>

            <Box display="flex" alignItems="center">
              <Link to={`/video/${selectedChat._id}?audio=true`}>
                <IconButton display={{ base: "flex" }} icon={<PhoneIcon color={iconColor} />} bg="transparent" />
              </Link>
              <Link to={`/video/${selectedChat._id}`}>
                <IconButton display={{ base: "flex" }} icon={<FaVideo color={iconColor} />} bg="transparent" />
              </Link>
              {!selectedChat.isGroupChat ? (
                <ProfileModal user={getSender(user, selectedChat.users)} />
              ) : (
                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
              )}
            </Box>
          </Box>

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
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              <Box display="flex" alignItems="center" bg={headerBg} p={2} borderRadius="30px">
                {/* 1. HIDDEN FILE INPUT (IMAGES ONLY) */}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  style={{ display: "none" }} 
                  ref={inputFile} 
                  onChange={imageHandler} 
                />

                {/* 2. PAPERCLIP ICON */}
                <Box 
                   onClick={() => inputFile.current.click()} 
                   cursor="pointer" 
                   px={3}
                >
                    {picLoading ? <Spinner size="sm" /> : <AttachmentIcon color={iconColor} w={5} h={5} />}
                </Box>

                <Input
                  variant="unstyled"
                  bg={inputBg}
                  color={textColor}
                  placeholder="Type a message..."
                  _placeholder={{ color: placeholderColor }}
                  onChange={typingHandler}
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
