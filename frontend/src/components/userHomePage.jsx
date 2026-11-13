import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import ConversationList from "./ConversationList"
import ChatPage from "./ChatPage"
import UserSearch from "./SearchUser"

function UserHomePage() {
  const token = localStorage.getItem("token")
  const { sub: username } = jwtDecode(token)
  const [selected, setSelected] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [incoming, setIncoming] = useState(null)

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "new_message") {
        setIncoming(data)
        setRefreshKey((k) => k + 1)
      }
    }

    return () => ws.close()
  }, [token])

  return (
    <div className="h-screen flex flex-col">
      <h1 className="p-3 border-b">Hi {username} welcome to the homepage</h1>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/3 border-r overflow-y-auto">
          <UserSearch
            onPick={(u) =>
              setSelected({
                id: null,
                other_user_id: u.id,
                other_username: u.username,
              })
            }
          />
          <ConversationList
            selectedId={selected?.id}
            onSelect={setSelected}
            refreshKey={refreshKey}
          />
        </aside>
        <main className="flex-1 overflow-hidden p-3">
          {selected ? (
            <ChatPage
              key={selected.id ?? `draft-${selected.other_user_id}`}
              conversation={selected}
              incoming={incoming}
              onSent={() => setRefreshKey((k) => k + 1)}
              onCreated={setSelected}
            />
          ) : (
            <p>Select a conversation</p>
          )}
        </main>
      </div>
    </div>
  )
}

export default UserHomePage
