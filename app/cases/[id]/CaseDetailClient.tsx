"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Conversation, Message, User } from "@/types";
import { formatDateTime, getStatusColor } from "@/lib/utils";

interface CaseDetailClientProps {
  conversation: Conversation;
  initialMessages: Message[];
  user: User;
  error: string | null;
}

export default function CaseDetailClient({
  conversation,
  initialMessages,
  user: _user,
  error,
}: CaseDetailClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [currentStatus, setCurrentStatus] = useState(conversation.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use `_user` in a no-op to avoid unused variable lint warnings
  void _user;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;

    const previousStatus = currentStatus;
    setIsUpdatingStatus(true);
    setStatusError("");
    setCurrentStatus(newStatus as typeof currentStatus); // Optimistically update

    try {
      const response = await fetch(
        `/api/conversations/${conversation.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const data = await response.json();
      setCurrentStatus(data.status);

      // Refresh to get updated conversation
      router.refresh();
    } catch (err) {
      console.error("Status update error:", err);
      // Revert to previous status on error
      setCurrentStatus(previousStatus);
      setStatusError("Failed to update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!newMessage.trim()) return;

    setIsSending(true);
    setSendError("");

    try {
      const response = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newMessage }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const sentMessage = await response.json();

      // Add message to list
      setMessages([...messages, sentMessage]);
      setNewMessage("");

      // Refresh to get updated conversation
      router.refresh();
    } catch (err) {
      setSendError("Failed to send message. Please try again.");
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Case #{conversation.id}
                </h1>
                <p className="text-sm text-gray-500">
                  Created {formatDateTime(conversation.created_at)}
                </p>
              </div>
            </div>
            <div className="relative">
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus || currentStatus === "closed"}
                title={currentStatus === "closed" ? "Closed tickets cannot be reopened" : ""}
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium ${getStatusColor(
                  currentStatus,
                )} cursor-pointer appearance-none pr-8 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <option value="new">new</option>
                <option value="open">open</option>
                <option value="pending">pending</option>
                <option value="solved">solved</option>
                <option value="closed">closed</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Status Update Error */}
          {statusError && (
            <div className="mt-3 rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-800">{statusError}</p>
            </div>
          )}
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mx-auto w-full max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                <p className="text-gray-500">
                  No messages in this conversation yet.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isFromUser =
                  message.sender?.type === "contact" ||
                  message.message_type === "outgoing";
                const isActivity = message.message_type === "activity";

                if (isActivity) {
                  return (
                    <div key={message.id} className="flex justify-center py-2">
                      <span className="rounded-full bg-gray-100 px-4 py-1 text-xs text-gray-600">
                        {message.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isFromUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-3 ${
                        isFromUser
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-900 shadow-sm"
                      }`}
                    >
                      {!isFromUser && message.sender && (
                        <p className="mb-1 text-xs font-semibold text-gray-600">
                          {message.sender.name}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {message.content}
                      </p>
                      <p
                        className={`mt-2 text-xs ${
                          isFromUser ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatDateTime(message.created_at)}
                      </p>

                      {/* Attachments */}
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.data_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block text-xs underline ${
                                  isFromUser ? "text-blue-100" : "text-blue-600"
                                }`}
                              >
                                {attachment.file_type === "image" ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={attachment.data_url}
                                    alt="Attachment"
                                    className="mt-2 max-h-48 rounded"
                                  />
                                ) : (
                                  `View ${attachment.file_type}`
                                )}
                              </a>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Message Input */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          {sendError && (
            <div className="mb-3 rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-800">{sendError}</p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              rows={3}
              disabled={isSending}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="self-end rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending
                </span>
              ) : (
                "Send"
              )}
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
