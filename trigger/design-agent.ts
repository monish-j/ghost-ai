import { schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { liveblocks } from "@/lib/liveblocks";
import fs from "fs";

const NodeShapeSchema = z.enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"]);
const ColorPresetSchema = z.enum(["default", "purple", "blue", "green", "amber", "rose", "cyan"]);

const ActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("addNode"),
    id: z.string().describe("Unique ID for the new node, e.g., 'rectangle-123' or 'payment-gateway'"),
    shape: NodeShapeSchema,
    label: z.string().describe("Text label to display inside the node"),
    color: ColorPresetSchema.default("default"),
    x: z.number().describe("X coordinate for the node position"),
    y: z.number().describe("Y coordinate for the node position"),
    width: z.number().describe("Width of the node"),
    height: z.number().describe("Height of the node"),
  }),
  z.object({
    type: z.literal("moveNode"),
    id: z.string().describe("ID of the existing node to move"),
    x: z.number().describe("New X coordinate for the node"),
    y: z.number().describe("New Y coordinate for the node"),
  }),
  z.object({
    type: z.literal("resizeNode"),
    id: z.string().describe("ID of the existing node to resize"),
    width: z.number().describe("New width for the node"),
    height: z.number().describe("New height for the node"),
  }),
  z.object({
    type: z.literal("updateNodeData"),
    id: z.string().describe("ID of the existing node to update"),
    label: z.string().optional().describe("New label for the node"),
    color: ColorPresetSchema.optional().describe("New color preset ID for the node"),
  }),
  z.object({
    type: z.literal("deleteNode"),
    id: z.string().describe("ID of the existing node to delete"),
  }),
  z.object({
    type: z.literal("addEdge"),
    id: z.string().describe("Unique ID for the new edge, e.g., 'edge-123'"),
    source: z.string().describe("Source node ID"),
    target: z.string().describe("Target node ID"),
    label: z.string().optional().describe("Optional text label for the edge"),
  }),
  z.object({
    type: z.literal("deleteEdge"),
    id: z.string().describe("ID of the existing edge to delete"),
  }),
]);

const ResponseSchema = z.object({
  explanation: z.string().describe("Brief explanation of what changes will be performed and why"),
  actions: z.array(ActionSchema),
});

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}



async function postStatusUpdate(roomId: string, message: string) {
  try {
    await liveblocks.createFeedMessage({
      roomId,
      feedId: "ai-status-feed",
      data: { text: message },
    });
  } catch (err) {
    console.warn("Feed message creation failed, trying to create feed:", err);
    // If the feed does not exist yet, attempt to create it first
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

async function updateAiPresence(roomId: string, cursor: { x: number; y: number } | null, thinking: boolean) {
  try {
    await liveblocks.setPresence(roomId, {
      userId: "ghost-ai-agent",
      userInfo: {
        name: "Ghost AI",
        avatar: "",
        color: "#62C073",
      },
      data: {
        cursor,
        thinking,
        isThinking: thinking,
      },
    });
  } catch (err) {
    console.error("Failed to update AI presence:", err);
  }
}

function normalizeColor(color: unknown): string {
  if (typeof color !== "string") return "default";
  const c = color.toLowerCase().trim();
  if (["default", "purple", "blue", "green", "amber", "rose", "cyan"].includes(c)) {
    return c;
  }
  if (c.startsWith("#")) {
    if (c === "#4a90e2") return "blue";
    if (c === "#2ecc71" || c === "#27ae60") return "green";
    if (c === "#e67e22") return "amber";
    if (c === "#9b59b6") return "purple";
    if (c === "#e74c3c") return "rose";
    if (c === "#f1c40f") return "amber";
    if (c === "#1abc9c") return "cyan";
  }
  if (c.includes("blue") || c.includes("sky")) return "blue";
  if (c.includes("green") || c.includes("emerald")) return "green";
  if (c.includes("orange") || c.includes("amber") || c.includes("yellow") || c.includes("gold")) return "amber";
  if (c.includes("purple") || c.includes("violet") || c.includes("indigo")) return "purple";
  if (c.includes("red") || c.includes("rose") || c.includes("pink")) return "rose";
  if (c.includes("cyan") || c.includes("teal")) return "cyan";
  
  return "default";
}

function normalizeShape(shape: unknown): string {
  if (typeof shape !== "string") return "rectangle";
  const s = shape.toLowerCase().trim();
  if (["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"].includes(s)) {
    return s;
  }
  if (s.includes("rect") || s.includes("box") || s.includes("square")) return "rectangle";
  if (s.includes("decision") || s.includes("rhombus")) return "diamond";
  if (s.includes("oval") || s.includes("capsule")) return "pill";
  if (s.includes("db") || s.includes("database") || s.includes("storage") || s.includes("bucket")) return "cylinder";
  
  return "rectangle";
}

export const designAgent = schemaTask({
  id: "design-agent",
  schema: z.object({
    prompt: z.string(),
    roomId: z.string(),
  }),
  run: async (payload, { ctx }) => {
    const { roomId, prompt } = payload;
    console.log(`Starting design-agent run ${ctx.run.id} in Room ${roomId}`);
    console.log(`Prompt: "${prompt}"`);

    // 1. Notify start of task and update AI presence
    await postStatusUpdate(roomId, "Ghost AI is analyzing your design request...");
    await updateAiPresence(roomId, null, true);

    try {
      // 2. Fetch current Storage document
      await postStatusUpdate(roomId, "Retrieving current room canvas state...");
      let currentStorage: Record<string, unknown> = {};
      try {
        currentStorage = (await liveblocks.getStorageDocument(roomId, "json")) as Record<string, unknown>;
      } catch (err) {
        console.warn("Could not retrieve existing room storage. Initializing from empty canvas.", err);
      }

      const flow = (currentStorage?.flow || {}) as Record<string, unknown>;
      const currentNodesMap = (flow.nodes || {}) as Record<string, unknown>;
      const currentEdgesMap = (flow.edges || {}) as Record<string, unknown>;

      const currentNodesList = Object.values(currentNodesMap).map((n) => {
        const node = n as Record<string, unknown>;
        const nodeData = (node.data || {}) as Record<string, unknown>;
        const nodePosition = (node.position || {}) as Record<string, unknown>;
        return {
          id: String(node.id || ""),
          label: String(nodeData.label || ""),
          shape: String(nodeData.shape || "rectangle"),
          color: String(nodeData.color || "default"),
          x: Number(nodePosition.x ?? 0),
          y: Number(nodePosition.y ?? 0),
          width: Number(node.width ?? 120),
          height: Number(node.height ?? 60),
        };
      });

      const currentEdgesList = Object.values(currentEdgesMap).map((e) => {
        const edge = e as Record<string, unknown>;
        return {
          id: String(edge.id || ""),
          source: String(edge.source || ""),
          target: String(edge.target || ""),
          label: String(edge.label || ""),
        };
      });

      // 3. Prepare prompt and call Gemini model
      await postStatusUpdate(roomId, "Calculating visual spacing and node layout...");
      
      const systemPrompt = `You are Ghost AI, the architecture and design collaborator in a collaborative visual canvas app.
Your task is to analyze the user's design request and generate structural changes (adding, moving, resizing, updating, or deleting nodes and edges) to fulfill their request.

Here is the current state of the canvas:
Existing Nodes:
${JSON.stringify(currentNodesList, null, 2)}

Existing Edges:
${JSON.stringify(currentEdgesList, null, 2)}

You must output a structured list of actions to perform.
Your available actions are:
1. "addNode": Creates a new node.
   - "id": string (must be unique, e.g. "payment-service", "auth-check")
   - "shape": "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"
   - "label": text label inside the node
   - "color": "default" | "purple" | "blue" | "green" | "amber" | "rose" | "cyan"
   - "x": number (x coordinate of the position)
   - "y": number (y coordinate of the position)
   - "width": number
   - "height": number
   Note: Choose default dimensions matching the shape:
     - "rectangle": 120 x 60
     - "diamond": 100 x 100
     - "circle": 80 x 80
     - "pill": 120 x 50
     - "cylinder": 90 x 110
     - "hexagon": 100 x 90
2. "moveNode": Moves an existing node.
   - "id": ID of the existing node.
   - "x", "y": new coordinates.
3. "resizeNode": Resizes an existing node.
   - "id": ID of the existing node.
   - "width", "height": new dimensions.
4. "updateNodeData": Updates an existing node's data.
   - "id": ID of the existing node.
   - "label": (optional) new label.
   - "color": (optional) new color preset.
5. "deleteNode": Deletes an existing node (and any edges connected to it).
   - "id": ID of the node to delete.
6. "addEdge": Creates a connection between two nodes.
   - "id": string (must be unique, e.g. "flow-edge-1")
   - "source": ID of the source node (must exist or be added in this response)
   - "target": ID of the target node (must exist or be added in this response)
   - "label": (optional) label text for the edge
7. "deleteEdge": Deletes an existing edge.
   - "id": ID of the edge to delete.

Layout and Spacing Rules:
- Avoid overlapping nodes.
- Leave at least 80-150px gap between nodes.
- For flowchart or system layouts, structure them logically (e.g. left-to-right or top-to-bottom).
- Use distinct shapes: Diamond for decision points, Cylinders for database/storage, Rectangles/Pills for steps/processes, Hexagons for external endpoints.
- Use color presets to categorize layers (e.g., "blue" for frontend, "green" for API, "amber" for database, "purple" for external services).
- Align new nodes relative to existing nodes' positions so they occupy clean workspace zones.

Constraints:
- Only reference node/edge IDs that exist or are created in this response.
- Do not perform invalid operations (like moving a non-existent node).
- Always return a valid JSON object matching the schema.

You must output a JSON object containing an 'explanation' string and 'actions' array.
Your response MUST be valid JSON and contain absolutely no conversational text or other symbols outside the JSON code block.
Your response MUST start with \`\`\`json and end with \`\`\`.`;

      const userPrompt = `User Request: "${prompt}"`;

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
        console.warn("Primary AI completion failed, attempting fallback to Google Gemini:", err);
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
          console.log("Successfully generated response using Gemini fallback.");
        } else {
          throw err;
        }
      }

      let jsonText = text.trim();
      if (jsonText.includes("```json")) {
        jsonText = jsonText.split("```json")[1].split("```")[0].trim();
      } else if (jsonText.includes("```")) {
        jsonText = jsonText.split("```")[1].split("```")[0].trim();
      }

      const rawObject = JSON.parse(jsonText);
      console.log("Raw JSON text from LLM:\n", jsonText);

      // Self-healing mapping to correct common type variations
      if (rawObject && typeof rawObject === "object" && "actions" in rawObject && Array.isArray(rawObject.actions)) {
        const actionsArray = rawObject.actions as unknown[];
        rawObject.actions = actionsArray.map((item) => {
          if (item && typeof item === "object") {
            const act = item as Record<string, unknown>;

            // Infer type if it is missing or undefined
            if (act.type === undefined) {
              if (act.source !== undefined && act.target !== undefined) {
                act.type = "addEdge";
              } else if (act.x !== undefined && act.y !== undefined) {
                act.type = "addNode";
              }
            }

            if (typeof act.type === "string") {
              const t = act.type.toLowerCase().replace(/[-_]/g, "");
              if (t === "addnode" || t === "createnode") {
                act.type = "addNode";
                act.color = normalizeColor(act.color);
                act.shape = normalizeShape(act.shape);

                // Fallback dimensions if missing
                if (act.width === undefined || typeof act.width !== "number") {
                  const s = String(act.shape);
                  if (s === "rectangle") act.width = 120;
                  else if (s === "diamond") act.width = 100;
                  else if (s === "circle") act.width = 80;
                  else if (s === "pill") act.width = 120;
                  else if (s === "cylinder") act.width = 90;
                  else if (s === "hexagon") act.width = 100;
                  else act.width = 120;
                }
                if (act.height === undefined || typeof act.height !== "number") {
                  const s = String(act.shape);
                  if (s === "rectangle") act.height = 60;
                  else if (s === "diamond") act.height = 100;
                  else if (s === "circle") act.height = 80;
                  else if (s === "pill") act.height = 50;
                  else if (s === "cylinder") act.height = 110;
                  else if (s === "hexagon") act.height = 90;
                  else act.height = 60;
                }
              } else if (t === "movenode") {
                act.type = "moveNode";
              } else if (t === "resizenode") {
                act.type = "resizeNode";
              } else if (t === "updatenode" || t === "updatenodedata") {
                act.type = "updateNodeData";
                if (act.color !== undefined) {
                  act.color = normalizeColor(act.color);
                }
              } else if (t === "deletenode" || t === "removenode") {
                act.type = "deleteNode";
              } else if (t === "addedge" || t === "createedge" || t === "connectnodes") {
                act.type = "addEdge";
                if (act.from !== undefined && act.source === undefined) {
                  act.source = act.from;
                }
                if (act.to !== undefined && act.target === undefined) {
                  act.target = act.to;
                }
                if (act.id === undefined) {
                  act.id = `edge-${act.source || "src"}-${act.target || "tgt"}`;
                }
              } else if (t === "deleteedge" || t === "removeedge") {
                act.type = "deleteEdge";
              }
            }
          }
          return item;
        });
      }

      console.log("Preprocessed LLM object:", JSON.stringify(rawObject, null, 2));

      const parsedResponse = ResponseSchema.safeParse(rawObject);
      if (!parsedResponse.success) {
        console.error("Zod Parsing error details:", parsedResponse.error.issues);
        try {
          fs.writeFileSync(
            "c:/Users/monis/OneDrive/Desktop/ghost-ai/debug_llm_response.json",
            JSON.stringify({ rawObject, issues: parsedResponse.error.issues, jsonText }, null, 2)
          );
        } catch (fsErr) {
          console.error("Failed to write debug file:", fsErr);
        }
        throw new Error(`Invalid JSON format generated: ${parsedResponse.error.message}`);
      }
      const object = parsedResponse.data;

      console.log(`Generated explanation: "${object.explanation}"`);
      console.log(`Actions generated: ${object.actions.length}`);

      // 4. Translate actions list into JSON Patch operations
      const patchOps: { op: string; path: string; value?: unknown }[] = [];
      const flowExists = currentStorage && typeof currentStorage === "object" && "flow" in currentStorage;
      if (!flowExists) {
        patchOps.push({
          op: "add",
          path: "/flow",
          value: {
            nodes: {},
            edges: {},
          },
        });
      }

      const existingNodeIds = new Set(Object.keys(currentNodesMap));
      const existingEdgeIds = new Set(Object.keys(currentEdgesMap));
      const actions = object.actions;

      const validActions: z.infer<typeof ActionSchema>[] = [];
      for (const action of actions) {
        if (action.type === "addNode") {
          patchOps.push({
            op: "add",
            path: `/flow/nodes/${action.id}`,
            value: {
              id: action.id,
              type: "canvas",
              position: { x: action.x, y: action.y },
              width: action.width,
              height: action.height,
              style: {
                width: action.width,
                height: action.height,
              },
              data: {
                label: action.label,
                shape: action.shape,
                color: action.color || "default",
              },
              selected: false,
              dragging: false,
              measured: false,
              resizing: false,
            },
          });
          existingNodeIds.add(action.id);
          validActions.push(action);
        } else if (action.type === "moveNode") {
          if (existingNodeIds.has(action.id)) {
            patchOps.push({
              op: "replace",
              path: `/flow/nodes/${action.id}/position`,
              value: { x: action.x, y: action.y },
            });
            validActions.push(action);
          }
        } else if (action.type === "resizeNode") {
          if (existingNodeIds.has(action.id)) {
            patchOps.push({
              op: "replace",
              path: `/flow/nodes/${action.id}/width`,
              value: action.width,
            });
            patchOps.push({
              op: "replace",
              path: `/flow/nodes/${action.id}/height`,
              value: action.height,
            });
            patchOps.push({
              op: "replace",
              path: `/flow/nodes/${action.id}/style/width`,
              value: action.width,
            });
            patchOps.push({
              op: "replace",
              path: `/flow/nodes/${action.id}/style/height`,
              value: action.height,
            });
            validActions.push(action);
          }
        } else if (action.type === "updateNodeData") {
          if (existingNodeIds.has(action.id)) {
            if (action.label !== undefined) {
              patchOps.push({
                op: "replace",
                path: `/flow/nodes/${action.id}/data/label`,
                value: action.label,
              });
            }
            if (action.color !== undefined) {
              patchOps.push({
                op: "replace",
                path: `/flow/nodes/${action.id}/data/color`,
                value: action.color,
              });
            }
            validActions.push(action);
          }
        } else if (action.type === "deleteNode") {
          if (existingNodeIds.has(action.id)) {
            patchOps.push({
              op: "remove",
              path: `/flow/nodes/${action.id}`,
            });
            existingNodeIds.delete(action.id);
            validActions.push(action);

            // Cascade edge deletion to keep flow consistent
            for (const edgeId of Object.keys(currentEdgesMap)) {
              const edge = currentEdgesMap[edgeId] as Record<string, unknown> | undefined;
              if (edge && (edge.source === action.id || edge.target === action.id)) {
                if (existingEdgeIds.has(edgeId)) {
                  patchOps.push({
                    op: "remove",
                    path: `/flow/edges/${edgeId}`,
                  });
                  existingEdgeIds.delete(edgeId);
                }
              }
            }
          }
        } else if (action.type === "addEdge") {
          if (existingNodeIds.has(action.source) && existingNodeIds.has(action.target)) {
            patchOps.push({
              op: "add",
              path: `/flow/edges/${action.id}`,
              value: {
                id: action.id,
                source: action.source,
                target: action.target,
                type: "canvasEdge",
                selected: false,
                label: action.label || "",
                style: {},
              },
            });
            existingEdgeIds.add(action.id);
            validActions.push(action);
          }
        } else if (action.type === "deleteEdge") {
          if (existingEdgeIds.has(action.id)) {
            patchOps.push({
              op: "remove",
              path: `/flow/edges/${action.id}`,
            });
            existingEdgeIds.delete(action.id);
            validActions.push(action);
          }
        }
      }

      // 5. Drawing Animation & Patch Execution
      if (patchOps.length > 0) {
        await postStatusUpdate(roomId, "Drawing design elements on the canvas...");
        
        // Move the cursor to newly created or moved nodes' positions for drawing animation
        const animatedActions = validActions.filter(
          (a) => a.type === "addNode" || a.type === "moveNode"
        );
        for (const act of animatedActions) {
          const x = act.x ?? 0;
          const y = act.y ?? 0;
          await updateAiPresence(roomId, { x, y }, true);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        // Apply mutations using JSON Patch
        const patchUrl = `https://api.liveblocks.io/v2/rooms/${roomId}/storage/json-patch`;
        const patchResponse = await fetch(patchUrl, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.LIVEBLOCKS_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patchOps),
        });

        if (!patchResponse.ok) {
          const errorMsg = await patchResponse.text();
          throw new Error(`Failed to apply canvas patches: ${patchResponse.status} ${errorMsg}`);
        }
      }

      // 6. Success Notification
      await postStatusUpdate(roomId, `Design generation completed: ${object.explanation}`);
      await updateAiPresence(roomId, null, false);

      return {
        success: true,
        message: `Successfully executed prompt. Actions performed: ${validActions.length}. Explanation: "${object.explanation}"`,
        actionsCount: validActions.length,
        explanation: object.explanation,
      };

    } catch (error: unknown) {
      console.error("Error executing design agent task:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      await postStatusUpdate(roomId, `Design generation failed: ${errMsg}`);
      await updateAiPresence(roomId, null, false);
      throw error;
    }
  },
});
