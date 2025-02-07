let authToken = null;
let userId = null;
const SPEED = 1250; //1000ms is good for avoid rate limiting. if you have 50-100 messages, you could go 750ms before getting rate limited.
const channelId = "820124577849016320"; // Replace with ur own gc id 

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

async function getMessages(beforeMessageId = null) {
    let url = `https://discord.com/api/v9/channels/${channelId}/messages?limit=50`;
    if (beforeMessageId) {
        url += `&before=${beforeMessageId}`;  // Get messages before the last one
    }
    const response = await fetch(url, {
        headers: { "Authorization": authToken }
    });
    return response.json();
}

async function deleteMessage(messageId) {
    const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Authorization": authToken }
    });
    console.log(`Deleted message: ${messageId}, Status: ${response.status}`);
}

async function deleteAllMessages() {
    await waitForAuthData();

    let messages = await getMessages();  
    let messagesToDelete = messages;

    while (messagesToDelete.length > 0) {
        for (const message of messagesToDelete) {
            if (message.author.id === userId) { 
                await deleteMessage(message.id);
                await new Promise(r => setTimeout(r, SPEED)); // Prevent rate-limiting
            }
        }

  
        const lastMessageId = messagesToDelete[messagesToDelete.length - 1].id;
        messagesToDelete = await getMessages(lastMessageId);  // Get next batch before the last message
    }

    console.log("All messages deleted!");
}

deleteAllMessages();
