async function main() {
  const headers = {
    Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
    "Content-Type": "application/json",
  };

  const body: any = {
    model: "anthropic/claude-opus-4.1",
    messages: [
      {
        role: "user",
        content:
          "Hello, what is the whether today in Beijing and what is the temperature? Use the get_weather and get_temperature tools to get the weather and temperature.",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Get the weather in a given city",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string" },
            },
            required: ["city"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "get_temperature",
          description: "Get the temperature in a given city",
          parameters: {
            type: "object",
            properties: {
              city: { type: "string" },
            },
            required: ["city"],
          },
        },
      },
    ],
    reasoning: {
      enabled: true,
      max_tokens: 4096,
    },
    stream: true,
  };

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let bufferAll = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Append new chunk to buffer
      buffer += decoder.decode(value, { stream: true });
      bufferAll += decoder.decode(value, { stream: true });
      // console.log("Buffer:", buffer);
      // console.log("BufferAll:", bufferAll);
      // Process complete lines from buffer
      while (true) {
        const lineEnd = buffer.indexOf("\n");
        if (lineEnd === -1) break;
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const reasoningContent = parsed.choices[0].delta.reasoning;
            if (reasoningContent) {
              console.log("Reasoning Content:", reasoningContent);
            }
            const content = parsed.choices[0].delta.content;
            if (content) {
              console.log("Content:", content);
            }
            const toolCalls = parsed.choices[0].delta.tool_calls;
            if (toolCalls) {
              console.log("Tool Calls:", toolCalls);
            }
          } catch (e) {
            // Ignore invalid JSON
          }
        }
      }
    }
  } finally {
    reader.cancel();
  }
}

main();
