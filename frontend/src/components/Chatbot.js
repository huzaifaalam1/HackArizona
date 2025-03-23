import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import wildcatLogo from '../assets/wildcat.jpg'; // Import the Wildcat image

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your campus rewards assistant. How can I help you?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get response from AWS Bedrock
      console.log("Sending question to chatbot:", input);
      const botResponse = await getBotResponse(input);
      
      // Add bot response
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: botResponse, sender: 'bot' }
      ]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: "Sorry, I couldn't process your request. Please try again.", sender: 'bot' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get response from AWS Bedrock using the backend proxy
  const getBotResponse = async (userInput) => {
    console.log("Getting bot response via backend proxy...");
    try {
      // Prepare the full prompt with context
      const fullPrompt = `You are a helpful assistant for a campus rewards app at the University of Arizona. 
        The app allows students to earn points by checking in at campus locations, attending events, and completing challenges. 
        Students can redeem points for rewards like campus store discounts, event tickets, and exclusive experiences.
        There are different badge levels (Bronze, Silver, Gold, Diamond) that provide point multipliers (1.0x, 1.1x, 1.25x, 1.3x respectively).
        
        Answer the following question in a helpful, concise manner:
        ${userInput}`;
      
      // Call your backend proxy endpoint
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/bedrock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: fullPrompt })
      });
      
      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${response.status} - ${errorData}`);
      }
      
      // Extract the AI response
      const data = await response.json();
      console.log("Received AI response:", data);
      return data.text;
    } catch (error) {
      console.error("Error calling Bedrock API via proxy:", error);
      // Fall back to simulated responses if the API fails
      return simulateBotResponse(userInput);
    }
  };

  // Fallback function with simulated responses
  const simulateBotResponse = (userInput) => {
    console.log("Using fallback response system for:", userInput);
    // Convert input to lowercase for easier matching
    const input = userInput.toLowerCase();
    
    // Simple response dictionary for demo purposes
    if (input.includes('point') && (input.includes('earn') || input.includes('get'))) {
      return "You can earn points by checking in at campus locations, attending events, participating in surveys, or completing challenges. Each check-in gives you 10 points!";
    } 
    else if (input.includes('redeem') || input.includes('spend') || input.includes('use point')) {
      return "You can redeem your points in the Rewards Shop. Go to the 'Redeem' section to see what's available. Options include campus store discounts, event tickets, and exclusive experiences.";
    }
    else if (input.includes('check in') || input.includes('checking in')) {
      return "You can check in using the 'Check In Now' button on your dashboard. Make sure location services are enabled on your device. You'll earn 10 points for each valid check-in!";
    }
    else if (input.includes('badge') || input.includes('level')) {
      return "Badges show your loyalty level. Start at Bronze, then progress to Silver, Gold, and Diamond. Higher badges give you better point multipliers and unlock exclusive rewards!";
    }
    else if (input.includes('multiplier')) {
      return "Your points multiplier increases as you earn higher badges. Bronze gives 1.0x, Silver 1.1x, Gold 1.25x, and Diamond 1.3x points on all activities!";
    }
    else if (input.includes('help') || input.includes('support')) {
      return "I can help with information about earning points, redeeming rewards, checking in, badges, and more. Just ask me what you'd like to know!";
    }
    else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello there! How can I assist you with Campus Rewards today?";
    }
    else {
      return "I'm not sure I understand your question. You can ask me about earning points, redeeming rewards, check-ins, badges, or multipliers. How can I help you?";
    }
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={toggleChat}>
        {isOpen ? (
          '✕'
        ) : (
          <img 
            src={wildcatLogo} 
            alt="Wildcat logo" 
            className="wildcat-logo"
          />
        )}
      </button>
      
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Campus Rewards Assistant</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="bot-message loading">
                <div className="dot-typing"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your question..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || input.trim() === ''}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;