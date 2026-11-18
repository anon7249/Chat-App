// currently not in use this is my manual implementation of the typewriter incase the libary does not work


import { useEffect, useState } from "react"

function Typewriter({ text, speed = 15 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id)
          return c
        }
        return c + 1
      })
    }, speed)

    return () => clearInterval(id)
  }, [text, speed])

  return <p className="whitespace-pre-wrap">{text.slice(0, count)}</p>
}

export default Typewriter
