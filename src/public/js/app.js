

const messageList = document.querySelector("ul")
const nickForm = document.querySelector("#nick")
const messageForm = document.querySelector("#chat")
const socket = new WebSocket(`ws://${window.location.host}`)

const makeMessage = (type, payload) => {
    const msg = { type, payload }
    return JSON.stringify(msg)
    //     object를 보낼때
    //     보내기전 JSON.stringify()로 string으로 보낸후
    //     받을때 JSON.parse()로 다시 오브젝트로 변환
}

socket.addEventListener("open", () => {
    console.log("connected")
})
socket.addEventListener("message", (message) => {
    const li = document.createElement("li")
    li.innerText = message.data
    messageList.appendChild(li)
})
socket.addEventListener("close", () => {
    console.log("disconnected")
})

const handleSubmit = (event) => {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value))
    input.value = ""
}

const handleNickSubmit = (event) => {
    event.preventDefault();
    let inputValue = []
    const input = nickForm.querySelector("input")
    input.placeholder = `Your nickname is "${input.value}"`
    inputValue = input.value
    input.value = ""
    socket.send(makeMessage("nickname", inputValue));
}

messageForm.addEventListener("submit", handleSubmit)
nickForm.addEventListener("submit", handleNickSubmit)