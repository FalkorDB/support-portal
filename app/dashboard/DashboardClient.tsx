"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Conversation, User } from "@/types";
import { formatDate, getStatusColor } from "@/lib/utils";
import NewCaseModal from "./NewCaseModal";

interface DashboardClientProps {
  initialConversations: Conversation[];
  user: User;
  error: string | null;
}

export default function DashboardClient({
  initialConversations,
  user,
  error,
}: DashboardClientProps) {
  const router = useRouter();
  const [conversations] = useState<Conversation[]>(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/login", redirect: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  const handleCaseCreated = () => {
    // Refresh the page to show the new case
    router.refresh();
  };

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      // Status filter (map 'resolved' to Zendesk's 'solved' and 'closed')
      if (statusFilter !== "all") {
        if (statusFilter === "resolved") {
          if (
            conversation.status !== "solved" &&
            conversation.status !== "closed"
          ) {
            return false;
          }
        } else if (statusFilter === "open") {
          if (conversation.status !== "open" && conversation.status !== "new") {
            return false;
          }
        } else if (conversation.status !== statusFilter) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const lastMessage = conversation.messages?.[0];
        const messageContent = lastMessage?.content?.toLowerCase() || "";
        const conversationId = conversation.id.toString();

        return conversationId.includes(query) || messageContent.includes(query);
      }

      return true;
    });
  }, [conversations, searchQuery, statusFilter]);

  // Count by status (Zendesk uses 'solved' and 'closed' for resolved tickets)
  const statusCounts = useMemo(() => {
    const counts = {
      open: 0,
      pending: 0,
      resolved: 0,
    };

    conversations.forEach((conv) => {
      if (conv.status === "open" || conv.status === "new") {
        counts.open++;
      } else if (conv.status === "pending") {
        counts.pending++;
      } else if (conv.status === "solved" || conv.status === "closed") {
        counts.resolved++;
      }
    });

    return counts;
  }, [conversations]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/falkordb-logo.svg"
                alt="FalkorDB"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Support Cases
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user.name || user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Status Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Total Cases</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {conversations.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Open</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {statusCounts.open || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {statusCounts.pending || 0}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Resolved</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {statusCounts.resolved || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="snoozed">Snoozed</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            title="Create new case"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">New Case</span>
          </button>
        </div>

        {/* Cases List */}
        {filteredConversations.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">
              {conversations.length === 0
                ? "No support cases found."
                : "No cases match your filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => {
              const lastMessage = conversation.messages?.[0];
              const messagePreview = lastMessage?.content || "No messages yet";

              return (
                <Link
                  key={conversation.id}
                  href={`/cases/${conversation.id}`}
                  className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Case #{conversation.id}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                            conversation.status,
                          )}`}
                        >
                          {conversation.status}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {messagePreview}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Created {formatDate(conversation.created_at)}
                        </span>
                        <span>•</span>
                        <span>
                          Updated {formatDate(conversation.updated_at)}
                        </span>
                        {conversation.meta?.assignee && (
                          <>
                            <span>•</span>
                            <span>
                              Assigned to {conversation.meta.assignee.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* New Case Modal */}
      <NewCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCaseCreated}
      />
    </div>
  );
}
