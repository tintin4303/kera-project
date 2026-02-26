"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader2, MessageSquare, Image, X, ChevronLeft } from 'lucide-react';
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
    mediaType?: string | null;
    mediaUrl?: string | null;
}

export default function ChatInterface() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showContacts, setShowContacts] = useState(true); // For mobile toggle
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isFirstLoad = useRef(true);

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

    // Reset first load flag when contact changes
    useEffect(() => {
        isFirstLoad.current = true;
    }, [selectedContact?.id]);

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
        if (messages.length > 0 && messagesEndRef.current) {
            setTimeout(() => {
                if (isFirstLoad.current) {
                    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
                    isFirstLoad.current = false;
                } else {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedFile || !selectedContact || sending) return;

        setSending(true);
        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('recipientId', selectedContact.id);
                if (newMessage.trim()) {
                    formData.append('content', newMessage);
                }

                const res = await fetch('/api/chat/media', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    const msg = await res.json();
                    queryClient.setQueryData(['chat-messages', selectedContact.id], (old: Message[] = []) => [...old, msg]);
                    setNewMessage('');
                    setSelectedFile(null);
                    setPreviewUrl(null);
                }
            } else {
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
            }
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setSending(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
            if (!allowedTypes.includes(file.type)) {
                alert('Invalid file type. Only images and videos are allowed.');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert('File too large. Maximum size is 10MB.');
                return;
            }

            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSelectContact = (contact: Contact) => {
        setSelectedContact(contact);
        setShowContacts(false);
    };

    const handleBackToContacts = () => {
        setShowContacts(true);
    };

    if (loadingContacts) {
        return (
            <div className="flex items-center justify-center h-full bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-kera-vibrant" />
            </div>
        );
    }

    if (contacts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white p-6 text-center">
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
        <div className="flex h-full bg-white md:rounded-xl md:border md:border-gray-100 overflow-hidden relative">
            {/* Contacts Sidebar */}
            <div className={cn(
                "w-full md:w-1/3 md:border-r border-gray-100 flex flex-col bg-white shrink-0",
                showContacts ? "flex" : "hidden md:flex"
            )}>
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Search connections..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-kera-vibrant focus:ring-1 focus:ring-kera-vibrant transition-all"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contacts
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((contact) => (
                            <button
                                key={contact.id}
                                onClick={() => handleSelectContact(contact)}
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
                                <div className="ml-3 text-left overflow-hidden flex-1">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{contact.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{contact.role.toLowerCase()}</p>
                                </div>
                            </button>
                        ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className={cn(
                "flex-1 flex flex-col bg-white min-w-0 h-full",
                showContacts ? "hidden md:flex" : "flex fixed inset-0 z-60 md:static md:z-auto"
            )}>
                {selectedContact ? (
                    <>
                        {/* Chat Header - Fixed */}
                        <div className="h-14 px-4 border-b border-gray-100 flex items-center bg-white flex-shrink-0">
                            {/* Back button for mobile */}
                            <button
                                onClick={handleBackToContacts}
                                className="md:hidden mr-3 p-1 -ml-1 text-gray-500 hover:text-gray-700"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {selectedContact.image ? (
                                    <img src={selectedContact.image} alt={selectedContact.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <User size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{selectedContact.name}</p>
                                <p className="text-[10px] text-green-500 font-medium">Online</p>
                            </div>
                        </div>

                        {/* Messages Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-kera-vibrant" />
                                </div>
                            ) : (
                                messages.map((msg) => {
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
                                                {msg.mediaUrl && (
                                                    <div className="mb-2">
                                                        {msg.mediaType === 'video' ? (
                                                            <video
                                                                src={msg.mediaUrl}
                                                                controls
                                                                className="rounded-lg max-w-full"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={msg.mediaUrl}
                                                                alt="Shared media"
                                                                className="rounded-lg max-w-full"
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                {msg.content && <p>{msg.content}</p>}
                                                <p className={cn(
                                                    "text-[10px] mt-1",
                                                    isMe ? "text-white/70" : "text-gray-400"
                                                )}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area - Fixed */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex-shrink-0 md:mb-0">
                            {selectedFile && (
                                <div className="mb-3 relative inline-block">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                                            <span className="text-xs text-gray-500">Video</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={removeSelectedFile}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*,video/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                >
                                    <Image size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kera-vibrant/20 focus:border-kera-vibrant"
                                />
                                <Button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedFile) || sending}
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
