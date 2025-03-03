import OpenAI from "openai";


require('dotenv').config()

//open ai api key
const api_key = process.env.OPEN_AI_API_KEY;

    if(!api_key){
        console.log('missing api key')
    }

//create client
const client = new OpenAI({apiKey:api_key});


//tools -> means functions
function get_weather_details (city=''){
    if(city.toLowerCase()==='delhi')return '10 C'
    if(city.toLowerCase()==='punjab')return '20 C'
    if(city.toLowerCase()==='banglore')return '40 C'
    if(city.toLowerCase()==='bihar')return '40 C'
    if(city.toLowerCase()==='rajasthan')return '50 C'
    if(city.toLowerCase()==='uttrakhand')return '90 C'

}



const user = 'Hey what is weather of delhi?';
// Function to get response from OpenAI
async function getChatResponse(message: string) {
    try {
        const response = await client.chat.completions.create({
            model:"gpt-4o-mini",
            messages: [{ role: "user", content: message }],
        });

        console.log("AI Response:", response.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

getChatResponse(user);
console.log("Hello, Node.js with TypeScript!");
