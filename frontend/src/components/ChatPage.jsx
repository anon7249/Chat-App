import { useEffect, useState } from "react"
import { getMessages, sendMessage, getConversations } from "../api/api"
import Summarise from "../components/Summarise"


const formatTime = (sentAt) => {
  if (!sentAt) return ""
  const iso = /Z|[+-]\d{2}:\d{2}$/.test(sentAt) ? sentAt : `${sentAt}Z`
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function ChatPage({ conversation, incoming, onSent, onCreated }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!incoming || incoming.conversation_id !== conversation.id) return
    setMessages((prev) =>
      prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
    )
  }, [incoming])

  const loadMessages = () =>
    getMessages(conversation.id)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err))

  useEffect(() => {
    if (conversation.id) loadMessages()
  }, [conversation.id])

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    try {
      await sendMessage(conversation.other_user_id, trimmed)
      setText("")

      if (conversation.id === null) {
        // first message: conversation now exists, find it and switch to it
        const res = await getConversations()
        const created = res.data.find(
          (c) => c.other_user_id === conversation.other_user_id
        )
        if (created) onCreated(created)
      } else {
        await loadMessages()
      }
      onSent()
    } catch (err) {
      console.error(err.response?.data || err.message)
    } finally {
      setSending(false)
    }
  }
  return (
    <div className="flex flex-col h-full">
      <Summarise conversationId={conversation.id} />

      <div className="flex-1 overflow-y-auto">
        {messages.map((m) => {
          const mine = m.sender_username !== conversation.other_username
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`m-1 max-w-[70%] rounded-lg px-3 py-2 ${mine ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
              >
                {!mine && <strong className="text-sm">{m.sender_username}</strong>}
                <p>{m.message}</p>
                <span
                  className={`block text-right text-xs mt-1 ${mine ? "text-blue-100" : "text-gray-500"}`}
                >
                  {formatTime(m.sent_at)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3">
        <input
          className="flex-1 border border-gray-300 p-2 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={sending} className="px-4 rounded bg-blue-500 text-white">
          Send
        </button>
      </form>
    </div>
  )
}
export default ChatPage
