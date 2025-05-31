// const url = "https://script.google.com/macros/s/AKfycbwxQaa_tvaiLL_yk6rOznoonmW2ocf9KZCI5dTfYJ1ZlcTaAheja3kPZqLrKq2GD1zX/exec";

// const data = {
//     action: "append",  // Add method field so the server knows what to do
//     requestTime: new Date().getTime(),
//     patientName: "Dac Binh",
//     patientAge: 12,
//     spO2: 75,
//     HR: 120,
//     bodyTemp: 38,
//     wimonMAC: "ASDF:ASDF"
// };

// async function sendData(data) {
//     try {
//         const response = await fetch(url, {
//             method: "POST",  // Use "POST" instead of "APPEND"
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(data)
//         });

//         const result = await response.json();
//         console.log("Response:", result);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// sendData(data);


const url = "https://graph.facebook.com/v22.0/979169530806683/posts"

const GROUP_ID = "979169530806683";

const PAGE_ID = "141152749077588"

const CLONE = "122096927402798091";

const APP_ID = "646189147801670"
const APP_SECRET = "07071c33867e996809ea80d9cd4c7733"


const response = await fetch(url, {
    method: "GET"
})

console.log(response);
const data = await response.json();

console.log(data);
