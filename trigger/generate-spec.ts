import { schemaTask, metadata } from "@trigger.dev/sdk";
import { z } from "zod";
import { liveblocks } from "@/lib/liveblocks";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const generateSpecSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(z.any()),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

async function postStatusUpdate(roomId: string, message: string) {
  try {
    await liveblocks.createFeedMessage({
      roomId,
      feedId: "ai-status-feed",
      data: { text: message },
    });
  } catch (err) {
    console.warn("Feed message creation failed, trying to create feed:", err);
    try {
      await liveblocks.createFeed({
        roomId,
        feedId: "ai-status-feed",
      });
      await liveblocks.createFeedMessage({
        roomId,
        feedId: "ai-status-feed",
        data: { text: message },
      });
    } catch (feedErr) {
      console.error("Failed to write to status feed:", feedErr);
    }
  }
}

async function updateAiPresence(roomId: string, thinking: boolean) {
  try {
    await liveblocks.setPresence(roomId, {
      userId: "ghost-ai-agent",
      userInfo: {
        name: "Ghost AI",
        avatar: "",
        color: "#62C073",
      },
      data: {
        cursor: null,
        thinking,
        isThinking: thinking,
      },
    });
  } catch (err) {
    console.error("Failed to update AI presence:", err);
  }
}

export const generateSpec = schemaTask({
  id: "generate-spec",
  schema: generateSpecSchema,
  run: async (payload, { ctx }) => {
    const { projectId, roomId, chatHistory, nodes, edges } = payload;
    console.log(`Starting generate-spec run ${ctx.run.id} in Room ${roomId}`);

    // 1. Notify start of task and update AI presence
    metadata.set("status", "generating");
    await postStatusUpdate(roomId, "Ghost AI is preparing the technical specification...");
    await updateAiPresence(roomId, true);

    try {
      // 2. Format inputs for the prompt
      const formattedHistory = chatHistory
        .map(
          (msg: any) =>
            `[${msg.sender || (msg.role === "user" ? "User" : "Assistant")}] (${msg.role}): ${msg.content}`
        )
        .join("\n");

      const formattedNodes = nodes
        .map(
          (node: any) =>
            `- ID: ${node.id}, Label: ${node.data?.label || "Untitled"}, Shape: ${node.data?.shape || "rectangle"}, Color Preset: ${node.data?.color || "default"}`
        )
        .join("\n");

      const formattedEdges = edges
        .map(
          (edge: any) =>
            `- ID: ${edge.id}, Connection: ${edge.source} -> ${edge.target}${edge.label ? ` (Label: ${edge.label})` : ""}`
        )
        .join("\n");

      // 3. Formulate prompts
      const systemPrompt = `You are a Principal Software Architect AI.
Your job is to generate a comprehensive, production-ready technical specification in Markdown format.
You will analyze the current system design (from canvas nodes and edges representing components and connections) and the conversation history between the user and the AI collaborator.

Generate a Markdown document with clear sections such as:
1. Executive Summary & Overview
2. System Architecture & Component Diagram Description
3. Detailed Component Breakdown (based on the canvas nodes, shapes, and properties)
4. Data Flow, Communications, and Interactions (based on edges, connections, and labels)
5. Interface Specifications & API Contracts (if applicable)
6. Non-Functional Requirements (Performance, Security, Reliability)
7. Development Roadmap & Next Steps

Ensure the spec is highly detailed, well-structured, professional, and directly incorporates the design choices and feedback discussed in the chat history.`;

      const userPrompt = `
Here is the context for the specification:

### Room/Project Details
Project ID: ${projectId}
Room ID: ${roomId}

### Canvas State
#### Nodes (Components)
${formattedNodes || "No components on canvas."}

#### Edges (Connections)
${formattedEdges || "No connections on canvas."}

### Chat History
${formattedHistory || "No chat history."}

Please generate the Markdown technical specification based on this information. Return ONLY the Markdown specification itself. Do not wrap it in a code block or prepend/append any conversational text.
`;

      // 4. Generate the spec text using the custom paid completions API
      await postStatusUpdate(roomId, "Analyzing diagram structures and chat context...");
      
      let text = "";
      try {
        const modelName = process.env.CUSTOM_AI_MODEL || "step-3.7-flash";
        const response = await fetch(`${process.env.CUSTOM_AI_BASE_URL || "https://api.hcnsec.cn/v1"}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.CUSTOM_AI_API_KEY || "sk-2z7DHFxt0HojEJVUrjV3dChflTbcS9ijTzlwP9br5E3yoh0Y"}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        text = data.choices?.[0]?.message?.content;
        if (!text) {
          throw new Error("No response content returned from completions API");
        }
      } catch (err: any) {
        console.warn("Primary AI spec generation failed, attempting fallback to Google Gemini:", err);
        if (process.env.GOOGLE_AI_API_KEY) {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
          const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: `${systemPrompt}\n\n${userPrompt}` }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.2
              }
            })
          });

          if (!geminiResponse.ok) {
            const errBody = await geminiResponse.text();
            throw new Error(`Gemini fallback also failed: ${geminiResponse.status} ${errBody}. Primary error: ${err.message}`);
          }

          const geminiData = await geminiResponse.json();
          text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error(`Gemini fallback returned empty content. Primary error: ${err.message}`);
          }
          console.log("Successfully generated spec using Gemini fallback.");
        } else {
          throw err;
        }
      }

      // 5. Save the generated spec to Vercel Blob and Prisma
      await postStatusUpdate(roomId, "Saving technical specification to secure storage...");
      const blob = await put(`spec-${projectId}.md`, text, {
        access: "private",
        contentType: "text/markdown",
        addRandomSuffix: true,
      });

      await prisma.projectSpec.create({
        data: {
          projectId,
          filePath: blob.url,
        },
      });

      // 6. Update status and metadata upon completion
      metadata.set("status", "completed");
      await postStatusUpdate(roomId, "Ghost AI successfully generated the technical specification.");
      await updateAiPresence(roomId, false);

      return text;

    } catch (error: unknown) {
      console.error("Error executing generate spec task:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      metadata.set("status", "failed");
      await postStatusUpdate(roomId, `Spec generation failed: ${errMsg}`);
      await updateAiPresence(roomId, false);
      throw error;
    }
  },
});
