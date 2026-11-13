import { useEffect, useState } from "react"
import { getMessages, sendMessage, getConversations } from "../api/api"

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
      <div className="flex-1 overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.sender_username}</strong>
            <p>{m.message}</p>
          </div>
        ))}
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
