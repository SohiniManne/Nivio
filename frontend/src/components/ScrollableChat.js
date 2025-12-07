import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import { useColorModeValue } from "@chakra-ui/react"; // Added hook

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  // DYNAMIC COLORS
  const myMsgBg = useColorModeValue("#D9FDD3", "#005C4B"); // Light Green vs Dark Green
  const otherMsgBg = useColorModeValue("#FFFFFF", "#202C33"); // White vs Dark Gray
  const textColor = useColorModeValue("black", "white");

  const isSameSender = (messages, m, i, userId) => {
    return (
      i < messages.length - 1 &&
      (messages[i + 1].sender._id !== m.sender._id ||
        messages[i + 1].sender._id === undefined) &&
      messages[i].sender._id !== userId
    );
  };

  const isLastMessage = (messages, i, userId) => {
    return (
      i === messages.length - 1 &&
      messages[messages.length - 1].sender._id !== userId &&
      messages[messages.length - 1].sender._id
    );
  };

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="xs"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? myMsgBg : otherMsgBg
                }`,
                color: textColor,
                marginLeft: isSameSender(messages, m, i, user._id) ? 0 : 33,
                marginTop: isSameSender(messages, m, i, user._id) ? 3 : 10,
                borderRadius: "10px",
                padding: "8px 15px",
                maxWidth: "75%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                fontSize: "15px",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;