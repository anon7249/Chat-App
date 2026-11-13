import { useEffect, useState } from "react"
import { searchUsers } from "../api/api"

function UserSearch({ onPick }) {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState([])

  useEffect(() => {
    if (query.trim().length < 2) return

    const timer = setTimeout(() => {
      searchUsers(query.trim())
        .then((res) => setResult(res.data))
        .catch((err) => console.error(err))
    }, 300)

    return () => clearTimeout(timer)
  }, [query])
  console.log(result)
  console.log(query)

  const visibleResults = query.trim().length < 2 ? [] : result

  return (
    <div className="p-3 border-b">
      <input
        className="w-full border border-gray-300 p-2 rounded"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul>
        {visibleResults.map((u) => (
          <li
            key={u.id}
            className="cursor-pointer p-2 hover:bg-gray-100"
            onClick={() => {
              onPick(u)
              setQuery("")
              setResult([])
            }}
          >
            {u.username}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default UserSearch
