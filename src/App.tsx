import React, { useEffect, useState } from "react";

interface Message {
  channel: string;
  datum: string;
  action: string;
}

let socket: WebSocket | null = null; // Singleton WebSocket connection

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Store messages with channel info
  const [input, setInput] = useState<string>(""); // Input for the message
  const [channel, setChannel] = useState<string>("test-channel"); // Default channel
  const wsUrl = "ws://localhost:8080"; // Replace with your WebSocket server URL

  useEffect(() => {
    if (!socket) {
      // Establish the WebSocket connection only if not already connected
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connected");
        // Subscribe to the initial channel
        socket?.send(JSON.stringify({ action: "subscribe", channel }));
      };

      // socket.onmessage = (event) => {
      //   try {
      //     const message: Message = JSON.parse(event.data);
      //     setMessages((prevMessages) => [...prevMessages, message]); // Append the new message
      //   } catch (error) {
      //     console.error("Error parsing WebSocket message:", error);
      //   }
      // };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        socket = null; // Reset the singleton on close
      };
    }

    // Send a subscription message when the channel changes
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: "subscribe", channel }));
      console.log(`Subscribed to channel: ${channel}`);
    }

    return () => {
      // Optional: Close WebSocket on component unmount
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close();
        socket = null;
      }
    };
  }, [wsUrl, channel]); // Depend on channel changes to send a new subscription message

  const sendMessage = () => {
    if (input && socket && socket.readyState === WebSocket.OPEN) {
      const payload: Message = { channel: channel, action: "message", datum: input }; // Include channel in the payload
      socket.send(JSON.stringify(payload)); // Send the message
      setInput(""); // Clear the input
    } else {
      console.error("WebSocket is not open or input is empty");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>WebSocket Messaging</h1>
      <div>
        <label>
          Channel:
          <input
            type="text"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="Enter channel name"
          />
        </label>
      </div>
      <div>
        <h2>Messages for Channel: {channel}</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.channel}: </strong>
              {msg.datum}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
    </div>
  );
};

export default App;
