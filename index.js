import React, { useState, useEffect } from 'react';
import { useFields, useFile, useWorld } from 'hyperfy';
import { Dialog } from './Dialog';

export default function App() {
  const world = useWorld();
  const fields = useFields();
  const [fieldState, setFieldState] = useState(fields);

  const {
    apiKey, npcName, initialMessage, vrmFile, aiModel, temperature, system,
    idleEmote, triggeredEmote, thinkingEmote, talkingEmote
  } = fieldState;

  const fileUrl = useFile(vrmFile) || 'default.vrm';
  const idleEmoteSrc = useFile(idleEmote) || 'idle.glb';
  const triggeredEmoteSrc = useFile(triggeredEmote) || 'triggered.glb';
  const thinkingEmoteSrc = useFile(thinkingEmote) || 'thinking.glb';
  const talkingEmoteSrc = useFile(talkingEmote) || 'talking.glb';

  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, name: npcName, text: initialMessage }]);
  const [npcState, setNpcState] = useState('idle');
  let ids = 0;

  useEffect(() => {
    setFieldState(fields);
  }, [fields]);

  useEffect(() => {
    setMessages([{ id: 1, name: npcName, text: initialMessage }]);
  }, [initialMessage, npcName]);

  const getEmoteSrc = () => {
    switch (npcState) {
      case 'idle':
        console.log('Emote: idle', idleEmoteSrc);
        return idleEmoteSrc;
      case 'triggered':
        console.log('Emote: triggered', triggeredEmoteSrc);
        return triggeredEmoteSrc;
      case 'thinking':
        console.log('Emote: thinking', thinkingEmoteSrc);
        return thinkingEmoteSrc;
      case 'talking':
        console.log('Emote: talking', talkingEmoteSrc);
        return talkingEmoteSrc;
      default:
        console.log('Emote: default idle', idleEmoteSrc);
        return idleEmoteSrc;
    }
  };

  const submit = async text => {
    console.log('Submitting text, current state:', npcState);
    setNpcState('thinking');
    const name = world.getAvatar().name;
    setMessages(m => [...m, { id: ++ids, name, text }]);

    try {
      const systemMessage = system || "You are a helpful assistant.";

      const response = await world.http({
        method: 'POST',
        url: `https://api.openai.com/v1/chat/completions`,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        data: {
          model: aiModel,
          messages: [{ role: 'system', content: systemMessage }, { role: 'user', content: text }],
          temperature: temperature,
        },
      });

      const responseString = response.choices[0].message.content.trim();
      setMessages(m => [...m, { id: ++ids, name: npcName, text: responseString }]);
      setNpcState('talking');
    } catch (err) {
      console.error("Error occurred:", err);
      setNpcState('idle');
    }
  };

  return (
    <app>
      <vrm
        src={fileUrl}
        emote={getEmoteSrc()}
        onPointerDown={() => {
          setVisible(!visible);
          setNpcState(visible ? 'idle' : 'triggered');
        }} 
      />
      {visible && (
        <Dialog
          title={npcName}
          messages={messages}
          onSubmit={submit}
          onClose={() => {
            setVisible(false);
            setNpcState('idle');
          }}
        />
      )}
    </app>
  );
}

const initialState = {
  // ...
}

export function getStore(state = initialState) {
  return {
    state,
    actions: {},
    fields: [
      {
        type: "section",
        label: "Avatar Settings"
      },
      {
        type: "text",
        key: "npcName",
        label: "NPC Name",
        initial: "AI NPC", // set an initial value if needed
      },
      {
        type: "text",
        key: "initialMessage",
        label: "Initial Message",
        initial: "Welcome to Hyperfy. How can I help you today?", // set an initial value if needed
      },
      { 
        type: "file",
        key: "vrmFile",
        label: "VRM File",
        accept: ".vrm",
        initial: "default.vrm",
      },
      {
        type: "file",
        key: "idleEmote",
        label: "Idle Emote",
        accept: ".glb",
        initial: "idle.glb",
      },
      {
        type: "file",
        key: "triggeredEmote",
        label: "Triggered Emote",
        accept: ".glb",
        initial: "triggered.glb",
      },
      {
        type: "file",
        key: "thinkingEmote",
        label: "Thinking Emote",
        accept: ".glb",
        initial: "thinking.glb",
      },
      {
        type: "file",
        key: "talkingEmote",
        label: "Talking Emote",
        accept: ".glb",
        initial: "talking.glb",
      },
      {
        type: "section",
        label: "AI Settings"
      },
      {
        type: "dropdown",
        key: "aiModel",
        label: "AI Model",
        options: [
          { label: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
          { label: "gpt-4", value: "gpt-4" },
          { label: "gpt-4-0613", value: "gpt-4-0613" },
          // Additional AI models can be listed here
        ],
        initial: "gpt-3.5-turbo", // Default selection
      },
      {
        type: "text",
        key: "apiKey",
        label: "API Key",
        initial: "", // set an initial value if needed
      },
      {
        type: "text",
        key: "system",
        label: "System",
        initial: "You are a Hyperfy AI assistant.",
      },
      {
        type: "float",
        key: "temperature",
        label: "Temperature",
        initial: 0.7,
      },
      // Other fields here...
    ],
  }
}