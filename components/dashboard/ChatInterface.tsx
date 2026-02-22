"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Contact {
    id: string;
    name: string;
    image?: string;
    role: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
}

export default function ChatInterface() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: contacts = [], isLoading: loadingContacts } = useQuery<Contact[]>({
        queryKey: ['chat-contacts'],
        queryFn: async () => {
            const res = await fetch('/api/chat/contacts');
            if (!res.ok) throw new Error('Failed to fetch contacts');
            return res.json();
        }
    });

    useEffect(() => {
        if (contacts.length > 0 && !selectedContact) {
            setSelectedContact(contacts[0]);
        }
    }, [contacts, selectedContact]);

    const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
        queryKey: ['chat-messages', selectedContact?.id],
        queryFn: async () => {
            if (!selectedContact) return [];
            const res = await fetch(`/api/chat/messages?recipientId=${selectedContact.id}`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            return res.json();
        },
        enabled: !!selectedContact,
        refetchInterval: 5000,
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact || sending) return;

        setSending(true);
        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: selectedContact.id,
                    content: newMessage
                }),
            });

            if (res.ok) {
                const msg = await res.json();
                queryClient.setQueryData(['chat-messages', selectedContact.id], (old: Message[] = []) => [...old, msg]);
                setNewMessage('');
            }
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };

    if (loadingContacts) {
        return (
            <div className="flex items-center justify-center h-[600px] bg-white rounded-xl shadow-sm border border-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
            </div>
        );
    }

    if (contacts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <MessageSquare size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No care connections yet</h3>
                <p className="text-gray-500 max-w-sm mt-2">
                    Once a carer is assigned to your family member, they will appear here and you can start chatting with them.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-[75vh] min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Contacts Sidebar */}
            <div className="w-1/3 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Care Connections</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contacts.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={cn(
                                "w-full flex items-center p-4 transition-colors hover:bg-gray-50",
                                selectedContact?.id === contact.id ? "bg-kera-vibrant/5 border-r-2 border-kera-vibrant" : ""
                            )}
                        >
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                {contact.image ? (
                                    <img src={contact.image} alt={contact.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-500 font-bold">
                                        {contact.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="ml-3 text-left overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{contact.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{contact.role.toLowerCase()}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center bg-white">
                            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                                {selectedContact.image ? (
                                    <img src={selectedContact.image} alt={selectedContact.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <User size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold text-gray-900">{selectedContact.name}</p>
                                <p className="text-[10px] text-green-500 font-medium">Online</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === session?.user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full",
                                            isMe ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                                                isMe
                                                    ? "bg-kera-vibrant text-white rounded-tr-none"
                                                    : "bg-white text-gray-900 border border-gray-100 rounded-tl-none"
                                            )}
                                        >
                                            <p>{msg.content}</p>
                                            <p className={cn(
                                                "text-[10px] mt-1",
                                                isMe ? "text-white/70" : "text-gray-400"
                                            )}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kera-vibrant/20 focus:border-kera-vibrant"
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="shrink-0 rounded-lg"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                        <MessageSquare size={48} className="text-gray-200 mb-4" />
                        <p>Select a care connection to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
