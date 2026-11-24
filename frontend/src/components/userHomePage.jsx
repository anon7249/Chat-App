import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import ConversationList from "./ConversationList"
import ChatPage from "./ChatPage"
import UserSearch from "./SearchUser"
import { useNavigate } from "react-router-dom"
import { getConversations } from "../api/api"
import CreateGroupModal from "./CreateGroupModal"

function UserHomePage() {
  const token = localStorage.getItem("token")
  const { sub: username } = jwtDecode(token)
  const [selected, setSelected] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [incoming, setIncoming] = useState(null)
  const navigate = useNavigate()
  const [showGroupModal, setShowGroupModal] = useState(false)

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
  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const handleGroupCreated = (group) => {
    setShowGroupModal(false)
    setRefreshKey((k) => k + 1)
    setSelected({
      id: group.id,
      type: "group",
      name: group.name,
      other_user_id: null,
      other_username: null,


    })

  }


  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between border-b p-3">
        <h1 className="text-lg font-semibold">Hi {username}, welcome to the homepage</h1>
        <button
          onClick={handleLogout}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
        >
          Log out
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/3 border-r overflow-y-auto">
          <button
            onClick={() => setShowGroupModal(true)}
            className="m-2 rounded bg-blue-500 px-3 py-1 text-sm text-white"
          >
            New group
          </button>
          <UserSearch
            onPick={async (u) => {
              const res = await getConversations()
              const existing = res.data.find((c) => c.other_user_id === u.id)
              setSelected(
                existing ?? { id: null, other_user_id: u.id, other_username: u.username }
              )
            }}
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

      {showGroupModal && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </div>
  )
}

export default UserHomePage
