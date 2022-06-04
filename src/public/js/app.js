const socket = io();

const welcome = document.getElementById("welcome")
const room = document.getElementById("room")
const form = welcome.querySelector("form");

room.hidden = true;
let roomName;


const addMessage = (message) => {
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message
    ul.appendChild(li)
}

const handleMessageSubmit = (event) => {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`)
    });
    input.value = ""
}

const handleNicknameSubmit = (event) => {
    event.preventDefault();
    const input = room.querySelector("#name input")
    socket.emit("nickname", input.value)
    input.placeholder = input.value
    input.value = ""
}

const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName}`
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit)
    nameForm.addEventListener("submit", handleNicknameSubmit)
}


const handleRoomSubmit = (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}


form.addEventListener("submit", handleRoomSubmit)

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${user} joined!`);
})

socket.on("bye", (user, newCount) => {
    const h3 = room.querySelector("h3")
    h3.innerText = `Room ${roomName} (${newCount})`
    addMessage(`${user} left!`);
})


socket.on("new_message", (msg) => {
    addMessage(msg);
})

socket.on("change_room", (rooms) => {
    const roomList = welcome.querySelector("ul")
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li")
        li.innerText = room;
        roomList.append(li);
    })
})