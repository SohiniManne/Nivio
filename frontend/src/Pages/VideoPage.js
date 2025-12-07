import React from "react";
import { useParams, useLocation } from "react-router-dom"; // Import useLocation
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const VideoPage = () => {
  const { id } = useParams();
  const location = useLocation(); // Get the current URL

  // Check if the URL contains "?audio=true" (means Voice Call)
  const isAudioOnly = new URLSearchParams(location.search).get("audio");

  const myMeeting = async (element) => {
    // Your Real Keys
    const appID = xyz;
    const serverSecret = "abc";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      id,
      Date.now().toString(),
      "Nivio User"
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      showScreenSharingButton: true,
      
      // LOGIC: If it's a Voice Call, start with Camera OFF
      turnOnCameraWhenJoining: !isAudioOnly, 
      turnOnMicrophoneWhenJoining: true,
      
      // Optional: Hide the camera button entirely for Voice Calls so it feels like a normal call
      showMyCameraToggleButton: !isAudioOnly, 
    });
  };

  return (
    <div
      ref={myMeeting}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
};

export default VideoPage;
