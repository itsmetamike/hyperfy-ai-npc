// Dialog.js

import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { useScreen, useWorld } from 'hyperfy'

export function Dialog({ title, messages, onSubmit, onClose }) {
  const world = useWorld()
  const screen = useScreen()
  const initRef = useRef()
  const listRef = useRef()
  const [waiting, setWaiting] = useState(false)

  let width = 340
  let height = 600
  let top
  let left
  if (screen.width > 880) {
    top = screen.height / 2 - height / 2
    left = screen.width - (screen.width / 2 - width / 2)
  } else {
    top = screen.height - height - 20
    left = screen.width / 2 - width / 2
  }

  useEffect(() => {
    world.blur()
    return world.on('focus', () => {
      onClose()
    })
  }, [])

  useLayoutEffect(() => {
    const init = initRef.current
    const list = listRef.current
    const scrollHeight = list.getScrollHeight()
    list.scroll({
      top: scrollHeight,
      behavior: init ? 'smooth' : 'instant',
    })
    if (!init) initRef.current = true
  }, [messages])

  const submit = async text => {
    try {
      setWaiting(true)
      await onSubmit(text)
    } catch (err) {
      setWaiting(false)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <gui
      style={{
        top: top + 'px',
        left: left + 'px',
        width: width + 'px',
        height: height + 'px',
        backgroundColor: '#16161c',
        borderRadius: '22px',
      }}
    >
      <guiview style={{ padding: '30px', flex: '1', minHeight: '0' }}>
        <guiview
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <guiimage
            src="chat.png"
            style={{ width: '30px', marginRight: '4px' }}
          />
          <guitext
            style={{
              fontSize: '26px',
              fontWeight: '500',

              lineHeight: '1',
            }}
          >
            {title}
          </guitext>
        </guiview>
        <guiview
          ref={listRef}
          style={{ flex: '1', overflowY: 'auto', marginBottom: '12px' }}
        >
          {messages.map(message => (
            <guiview key={message.id} style={{ margin: '0 0 16px' }}>
              <guitext style={{ fontWeight: '500', margin: '0 0 5px' }}>
                {message.name}
              </guitext>
              <guitext style={{ color: 'rgba(255,255,255,0.6)' }}>
                {message.text}
              </guitext>
            </guiview>
          ))}
        </guiview>
        {!waiting && <Input onSubmit={submit} />}
        {waiting && (
          <guiview
            style={{
              height: '38px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <guiimage src="waiting.gif" style={{ width: '60px' }} />
          </guiview>
        )}
      </guiview>
    </gui>
  )
}

function Input({ onSubmit }) {
  const [value, setValue] = useState(null)
  return (
    <guiinput
      style={{
        background: '#252630',
        borderRadius: '10px',
        height: '38px',
        padding: '0 12px',
      }}
      placeholder="Send message"
      value={value}
      onChange={value => {
        setValue(value)
      }}
      onEnter={() => {
        if (!value) return
        setValue('')
        onSubmit(value)
      }}
    />
  )
}