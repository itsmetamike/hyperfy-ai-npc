import React, { useState, useEffect } from 'react';
import { useFields, useFile, useWorld } from 'hyperfy';
import { Dialog } from './Dialog';

export default function App() {
  const world = useWorld();
  const fields = useFields();
  const [fieldState, setFieldState] = useState(fields);

  // Update state when fields change
  useEffect(() => {
    setFieldState(fields);
  }, [fields]);

  const { apiKey, npcName, initialMessage, vrmFile, aiModel, temperature, system } = fieldState;

  const fileUrl = useFile(vrmFile) || 'default.vrm';
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, name: npcName, text: initialMessage }]);

  // Update messages state when initialMessage changes
  useEffect(() => {
    setMessages([{ id: 1, name: npcName, text: initialMessage }]);
  }, [initialMessage, npcName]);

  let ids = 0;  // Ensure `ids` is defined

  const submit = async text => {
    const name = world.getAvatar().name;
    setMessages(messages => [...messages, { id: ++ids, name, text }]);
    
    try {
      const systemMessage = system || "You are a helpful assistant.";
  
      const openAIUrl = `https://api.openai.com/v1/chat/completions`;
      const openAIHeaders = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      };
      const openAIBody = {
        model: aiModel,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: text }
        ],
        temperature: temperature,
      };

      const response = await world.http({
        method: 'POST',
        url: openAIUrl,
        headers: openAIHeaders,
        data: openAIBody,
      });
  
      const responseString = response.choices[0].message.content.trim();
      setMessages(messages => [...messages, { id: ++ids, name: npcName, text: responseString }]);
    } catch (err) {
      console.error("Error occurred:", err);
    }
  }

  return (
    <app>
      <vrm
        src={fileUrl}
        onPointerDown={() => setVisible(!visible)} 
      />
      {visible && (
        <Dialog
          title={npcName}
          messages={messages}
          onSubmit={submit}
          onClose={() => setVisible(false)}
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
        initial: "",
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
        initial: "",
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