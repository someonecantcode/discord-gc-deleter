let channelId = "964662466124603442";
let authToken = null;   
const messageContent = "test"; // Message text

function waitForAuthData() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (authToken && userId) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

window.webpackChunkdiscord_app.push([
    [Math.random()], {}, (req) => {
        for (const module of Object.values(req.c)) {
            if (module?.exports?.default?.getToken !== undefined) {
                authToken = module.exports.default.getToken();
                console.log("Your Token:", authToken);
            }
            if (module?.exports?.default?.getCurrentUser !== undefined) {
                userId = module.exports.default.getCurrentUser().id;
                console.log("Your User ID:", userId);
            }
        }
    }
]);


async function sendMessageAndDelete() {
    await waitForAuthData();
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
            "Authorization": authToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: messageContent, tts: false })
    });

    const messageData = await response.json();
    
    if (messageData.id) {
        console.log("Message sent:", messageData);

        setTimeout(async () => {
            await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${messageData.id}`, {
                method: "DELETE",
                headers: { "Authorization": authToken }
            });
            console.log("Message deleted:", messageData.id);
        }, 3000); 
    } else {
        console.error("Failed to send message:", messageData);
    }
}

setInterval(sendMessageAndDelete, 2000); // ur choice of delay

