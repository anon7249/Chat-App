import { useState } from "react"
import UserSearch from "./SearchUser"
import { createGroup } from "../api/api"

function CreateGroupModal({ onClose, onCreated }) {
  const [name, setName] = useState("")
  const [members, setMembers] = useState([])   // [{ id, username }]
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  const addMember = (u) =>
    setMembers((prev) => (prev.some((m) => m.id === u.id) ? prev : [...prev, u]))

  const removeMember = (id) =>
    setMembers((prev) => prev.filter((m) => m.id !== id))

  const handleCreate = async () => {
    setCreating(true)
    setError("")
    try {
      const res = await createGroup(name.trim(), members.map((m) => m.id))
      onCreated(res.data)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === "string" ? detail : "Could not create group")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">New group</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="mb-3 w-full rounded border p-2"
        />

        <UserSearch onPick={addMember} />

        <div className="my-3 flex flex-wrap gap-2">
          {members.map((m) => (
            <span key={m.id} className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm">
              {m.username}
              <button type="button" onClick={() => removeMember(m.id)}>✕</button>
            </span>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose}>Cancel</button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || members.length === 0 || creating}
            className="rounded bg-blue-500 px-3 py-1 text-white disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateGroupModal
