'use client'

import { useState, useEffect } from 'react'

const WORDS = ['coffee', 'company', 'conversation', 'laughter', 'music']
const TYPING_SPEED = 100 // ms per character
const BACKSPACE_SPEED = 60 // ms per character
const PAUSE_DURATION = 1500 // ms pause after completing a word

export function TypingAnimation() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 530) // Cursor blinks every 530ms

    return () => clearInterval(cursorInterval)
  }, [])

  // Typing animation effect
  useEffect(() => {
    const currentWord = WORDS[currentWordIndex]
    let timeout: NodeJS.Timeout

    if (!isDeleting && currentText === currentWord) {
      // Finished typing, pause before deleting
      timeout = setTimeout(() => {
        setIsDeleting(true)
      }, PAUSE_DURATION)
    } else if (isDeleting && currentText === '') {
      // Finished deleting, move to next word
      setIsDeleting(false)
      setCurrentWordIndex((prev) => (prev + 1) % WORDS.length)
    } else if (!isDeleting) {
      // Typing characters
      timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + 1))
      }, TYPING_SPEED)
    } else {
      // Deleting characters
      timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length - 1))
      }, BACKSPACE_SPEED)
    }

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentWordIndex])

  return (
    <span className="relative inline-block">
      <span className="inline-block min-w-[280px] text-left">
        {currentText}
        <span
          className={`inline-block w-[3px] h-[1.1em] ml-1 align-middle bg-[#5F7161] transition-opacity duration-100 ${
            cursorVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ verticalAlign: '-0.1em' }}
        />
      </span>
    </span>
  )
}
