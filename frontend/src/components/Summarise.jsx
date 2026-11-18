import { useState } from "react";
import { summariseConversation } from "../api/api"
import Typewriter from "typewriter-effect"



function SummariseChat({ conversationId }) {
  const [summary, setSummary] = useState("")

  async function handleClick() {
    try {
      const res = await summariseConversation(conversationId)
      setSummary(res.data.summary)

    } catch (error) {
      console.log(error)

    }
  }

  return (
    <div>
      <button className="mb-2 rounded bg-purple-600 px-3 py-1 text-sm text-white" onClick={handleClick}> Summarise with AI</button>
      {summary && (
        <Typewriter
          key={summary}
          options={{ delay: 20, cursor: "" }}
          onInit={(typewriter) => {
            typewriter.typeString(summary).start()
          }}
        />
      )}

    </div>

  )
}

export default SummariseChat
