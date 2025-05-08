const url = "https://script.google.com/macros/s/AKfycbwxQaa_tvaiLL_yk6rOznoonmW2ocf9KZCI5dTfYJ1ZlcTaAheja3kPZqLrKq2GD1zX/exec";

const data = {
    action: "append",  // Add method field so the server knows what to do
    requestTime: new Date().getTime(),
    patientName: "Dac Binh",
    patientAge: 12,
    spO2: 75,
    HR: 120,
    bodyTemp: 38,
    wimonMAC: "ASDF:ASDF"
};

async function sendData(data) {
    try {
        const response = await fetch(url, {
            method: "POST",  // Use "POST" instead of "APPEND"
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Response:", result);
    } catch (error) {
        console.error("Error:", error);
    }
}

sendData(data);
