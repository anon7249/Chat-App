import { useEffect, useState } from "react"

import { getConversations } from "../api/api"


function ConversationList({ selectedId, onSelect, refreshKey }) {

  const [conversations, setConversations] = useState([])


  useEffect(() => {
    getConversations()
      .then((res) => setConversations(res.data))
      .catch((err) => console.error(err))
  }, [refreshKey])

  if (conversations.length === 0) return <p>No conversations yet</p>


  return (
    <ul>
      {conversations.map((c) => (
        <li key={c.id} onClick={() => onSelect(c)} className={`cursor-pointer p-3 border-b ${c.id === selectedId ? "bg-blue-100" : "hover:bg-gray-100"}`}>
          <strong>{c.other_username}</strong>
          <p>{c.last_message ?? "No messages yet"}</p>
        </li>
      ))}


    </ul>
  )


}



export default ConversationList
