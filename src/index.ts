import OpenAI from "openai";
import readlineSync from "readline-sync";
import dotenv from "dotenv";

dotenv.config();

// OpenAI API Key
const api_key = process.env.OPEN_AI_API_KEY;

if (!api_key) {
    console.log('Missing API key');
    process.exit(1);
}

// Create OpenAI client
const client = new OpenAI({ apiKey: api_key });

// Weather function
function get_weather_details(city: string): string {
    const weatherData: Record<string, string> = {
        "delhi": "10°C",
        "punjab": "20°C",
        "bangalore": "40°C",
        "bihar": "40°C",
        "rajasthan": "50°C",
        "uttrakhand": "90°C"
    };
    return weatherData[city.toLowerCase()] || "Weather data not available";
}

// System prompt
const SYSTEM_PROMPT = `
You are an AI assistant capable of calling functions to fetch weather details.
Use the function get_weather_details(city) when a user asks for weather in a specific city.
Return only the weather result.
`;

// Interactive message history
const messageHistory: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

// Function to get response from OpenAI
async function getChatResponse(userMessage: string) {
    try {
        // Add user message to history
        messageHistory.push({ role: "user", content: userMessage });

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messageHistory,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "get_weather_details",
                        description: "Get weather details for a given city",
                        parameters: {
                            type: "object",
                            properties: {
                                city: { type: "string", description: "City name" }
                            },
                            required: ["city"]
                        }
                    }
                }
            ],
            tool_choice: "auto"
        });

        const aiResponse = response.choices[0].message;

        if (aiResponse.tool_calls) {
            for (const toolCall of aiResponse.tool_calls) {
                if (toolCall.function.name === "get_weather_details") {
                    const { city } = JSON.parse(toolCall.function.arguments);
                    const weather = get_weather_details(city);
                    const tool_call_id = toolCall.id;

                    // Add AI function request to history
                    messageHistory.push(aiResponse);

                    // Send the tool's result back to the model
                    const finalResponse = await client.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            ...messageHistory,
                            { role: "tool", tool_call_id, content: weather }
                        ]
                    });

                    console.log("AI Response:", finalResponse.choices[0].message.content);

                    // Add final AI response to history
                    messageHistory.push({ role: "assistant", content: finalResponse.choices[0].message.content });
                    return;
                }
            }
        }

        console.log("AI Response:", aiResponse.content);
        messageHistory.push({ role: "assistant", content: aiResponse.content });

    } catch (error) {
        console.error("Error:", error);
    }
}

async function startChat() {
    while (true) {
        const query = readlineSync.question('>> ');
        if (query.toLowerCase() === "exit") {
            console.log("Goodbye!");
            break;
        }
        await getChatResponse(query);
    }
}

// Start the chat
startChat();
