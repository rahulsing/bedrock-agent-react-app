import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { config } from '../config';
import TraceHistory from './TraceHistory';
import './Chat.css';
import { v4 as uuidv4 } from 'uuid';


const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [traceHistory, setTraceHistory] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTraceEnabled, setIsTraceEnabled] = useState(true);
    const messagesEndRef = useRef(null);
    const [sessionId] = useState(uuidv4());

    const client = new BedrockAgentRuntimeClient({
        region: config.region,
        credentials: {
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
        }
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleTraceToggle = () => {
        setIsTraceEnabled(prev => !prev);
    };

    const clearTraceHistory = () => {
        setTraceHistory([]);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setMessages(prev => [...prev, { type: 'user', content: input }]);
        setInput('');

        try {
            // Prepare input with session attributes
            const now = new Date();
            const formattedDate = now.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const formattedTime = now.toLocaleString('en-US', { timeStyle: 'short' });
            const queryUuid = uuidv4();

            const command = new InvokeAgentCommand({
                agentId: config.agentId,
                agentAliasId: config.agentAliasId,
                sessionId: sessionId,
                inputText: input,
                sessionState: {
                    promptSessionAttributes: {
                        currentDate: formattedDate,
                        currentTime: formattedTime,
                        queryUuid: queryUuid
                    }
                },
                enableTrace: isTraceEnabled
            });

            console.log("------- invokeAgent -------");
            console.log('Input:', command.input);

            const response = await client.send(command);
            let fullResponse = '';

            if (!response.completion) {
                throw new Error("Completion is undefined");
            }

            for await (const chunkEvent of response.completion) {
                // Handle chunk data
                if (chunkEvent.chunk?.bytes) {
                    const decodedResponse = new TextDecoder("utf-8").decode(chunkEvent.chunk.bytes);
                    fullResponse += decodedResponse;
                }

                // Handle trace data
                if (chunkEvent.trace) {
                    console.log('Trace received:', chunkEvent.trace);
                    setTraceHistory(prev => [...prev, {
                        ...chunkEvent.trace,
                        timestamp: now.toISOString(),
                        queryUuid
                    }]);
                }
            }

            // Process the complete response
            if (fullResponse) {
                try {
                    // Try to parse as JSON first
                    const parsedResponse = JSON.parse(fullResponse);
                    const finalContent = parsedResponse.content ||
                        parsedResponse.text ||
                        parsedResponse.response ||
                        parsedResponse.message;

                    if (finalContent) {
                        setMessages(prev => [...prev, {
                            type: 'agent',
                            content: finalContent
                        }]);
                    }
                } catch (e) {
                    // If parsing fails, use the raw response
                    setMessages(prev => [...prev, {
                        type: 'agent',
                        content: fullResponse
                    }]);
                }
            }

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'error',
                content: 'Sorry, there was an error processing your request.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-layout">
            <div className="header">
                AI Assistance
            </div>
            <div className="main-content">
                {isTraceEnabled && (
                    <TraceHistory
                        traceHistory={traceHistory}
                        isTraceEnabled={isTraceEnabled}
                        onTraceToggle={handleTraceToggle}
                        onClearTrace={clearTraceHistory}
                    />
                )}
                <div className={`chat-container ${!isTraceEnabled ? 'full-width' : ''}`}>
                    <div className="messages">
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.type}`}>
                                {message.type === 'agent' ? (
                                    <ReactMarkdown
                                        components={{
                                            root: ({ children }) => <div className="markdown-content">{children}</div>
                                        }}
                                    >
                                        {typeof message.content === 'string'
                                            ? message.content
                                            : JSON.stringify(message.content)}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="message-content">{message.content}</div>
                                )}
                            </div>
                        ))}
                        {isLoading && <div className="loading">Agent is typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="input-container">
                        <form onSubmit={handleSubmit} className="input-form">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading}>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Make sure to add the styles to your CSS file or inject them into the document

export default Chat;