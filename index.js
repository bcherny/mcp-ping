#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({
    name: "Ping",
    version: "0.0.1",
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Define the tools we'll expose
const tools = [
    {
        name: "ping",
        description: "Ping",
        inputSchema: {
            type: "object",
            properties: {
                input: { type: "string", description: "Give a word or phrase" },
            },
            required: ["input"],
        },
    },
];
// Implement the tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    switch (name) {
        case "ping": {
            return {
                content: [],
                toolResult: "PONG",
            };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "file:///example.txt",
                name: "Example Resource",
            },
        ],
    };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === "file:///example.txt") {
        return {
            contents: [
                {
                    uri: "file:///example.txt",
                    mimeType: "text/plain",
                    text: "This is the content of the example resource.",
                },
            ],
        };
    }
    else {
        throw new Error("Resource not found");
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
runServer().catch(console.error);
