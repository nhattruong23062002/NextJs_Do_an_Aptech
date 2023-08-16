import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BsMessenger } from "react-icons/bs";
import io from "socket.io-client";
import jwt_decode from "jwt-decode";

import styles from "./ChatOnline.module.css";
import { getTokenFromLocalStorage } from "@/utils/tokenUtils";

const ChatOnline = () => {
  const [customerId, setCustomerId] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const socket = useMemo(() => io("https://do-an-aptech-nodejs.onrender.com/"), []);
  const [receiverId, setReceiverId] = useState("647efdae66502ca93f65d13d");

  console.log('««««« messages »»»»»', messages);

  useEffect(() => {
    const token = getTokenFromLocalStorage();

    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        const { _id: customerId } = decodedToken;
        setCustomerId(customerId);
      } catch (error) {
        console.error("Error decoding token:", error);
        setCustomerId(null);
      }
    }
  }, []);


  const handleMessengerClick = useCallback(() => {
    setIsChatVisible(!isChatVisible);
  }, [isChatVisible]);


  const handleSendMessage = useCallback(() => {
    if (messageInput.trim() !== "") {
      const roomId = `${customerId}-${receiverId}`;
      const message = {
        content: messageInput,
        senderId: customerId,
        receiverId: "647efdae66502ca93f65d13d", // Người nhận cố định
      };
      socket.emit("joinRoom", { roomId });
      socket.emit("chat", {roomId, message });
      socket.emit("on-update", {roomId });
      setMessageInput("");
    }
  }, [customerId, messageInput, socket]);


  useEffect(() => {
    const handleReceiveMessage = ({ content }) => {
      setMessages(prevMessages => [...prevMessages, { content }]);
    };
    socket.on("message", handleReceiveMessage);
    return () => {
      socket.off("message", handleReceiveMessage);
    };
  }, [socket]);


  return (
    <>
      {!isChatVisible && (
        <div>
          <BsMessenger
            className={styles.iconMessager}
            onClick={handleMessengerClick}
          />
        </div>
      )}
      {isChatVisible && (
        <div className="page-content page-container" id="page-content">
          <div className="padding">
            <div className="row container d-flex justify-content-center">
              <div className="col-md-6">
                <div className="card card-bordered">
                  <div className="card-header">
                    <h4 className="card-title">
                      <strong>Chat</strong>
                    </h4>
                    <a
                      onClick={handleMessengerClick}
                      className="btn btn-xs btn-secondary"
                      href="#"
                      data-abc="true"
                    >
                      Close
                    </a>
                  </div>
                  <div
                    className="ps-container ps-theme-default ps-active-y"
                    id="chat-content"
                  >
                    {messages.map((message, index) => (
                      <div
                      key={index}
                      className={`media media-chat ${
                      message.content.senderId === customerId ? 'media-chat-reverse' : ''
                      }`}
                      >
                        <div className="media-body">
                          <p>{message.content.content}</p>
                        </div>
                      </div>
                    ))}
                    {/* <div className="media media-chat">
                      <img
                        className="avatar"
                        src="https://img.icons8.com/color/36/000000/administrator-male.png"
                        alt="..."
                      />
                      <div className="media-body">
                        <p>Hi</p>
                        <p>How are you ...???</p>
                        <p>
                          What are you doing tomorrow?
                          <br /> Can we come up a bar?
                        </p>
                        <p className="meta">
                          <time dateTime={2018}>23:58</time>
                        </p>
                      </div>
                    </div>
                    <div className="media media-meta-day">Today</div>
                    <div className="media media-chat media-chat-reverse">
                      <div className="media-body">
                        <p>Hiii, I'm good.</p>
                        <p>How are you doing?</p>
                        <p>
                          Long time no see! Tomorrow office. will be free on
                          sunday.
                        </p>
                        <p className="meta">
                          <time dateTime={2018}>00:06</time>
                        </p>
                      </div>
                    </div> */}
                    <div
                      className="ps-scrollbar-x-rail"
                      style={{ left: 0, bottom: 0 }}
                    >
                      <div
                        className="ps-scrollbar-x"
                        tabIndex={0}
                        style={{ left: 0, width: 0 }}
                      />
                    </div>
                    <div
                      className="ps-scrollbar-y-rail"
                      style={{ top: 0, height: 0, right: 2 }}
                    >
                      <div
                        className="ps-scrollbar-y"
                        tabIndex={0}
                        style={{ top: 0, height: 2 }}
                      />
                    </div>
                  </div>
                  <div className="publisher bt-1 border-light">
                    <img
                      className="avatar avatar-xs"
                      src="https://img.icons8.com/color/36/000000/administrator-male.png"
                      alt="..."
                    />
                    <input
                      className="publisher-input"
                      type="text"
                      placeholder="Write something"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <span className="publisher-btn file-group">
                      <i className="fa fa-paperclip file-browser" />
                      <input type="file" />
                    </span>
                    <a className="publisher-btn" href="#" data-abc="true">
                      <i className="fa fa-smile" />
                    </a>
                    <button
                      className="publisher-btn text-info"
                      onClick={handleSendMessage}
                    >
                      <i className="fa fa-paper-plane" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatOnline;
