import http from "http";
import WebSocket from "ws";
import express from "express"

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views")
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (req, res) => res.render("home"))
app.get("/*", (req, res) => res.redirect("/"));


const handleListen = () => console.log(`Listening on http://localhost:3000`)

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const sockets = [];



wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("connected")
    socket.on("close", () => console.log("disconnected"))
    socket.on("message", msg => {
        const message = JSON.parse(msg)
        // if (message.type === "new_message") {
        //     sockets.forEach(aSocket => aSocket.send(message.payload))
        // } else if (message.type === "nickname") {
        //     console.log(message.payload)
        // } object를 if문이 아닌 switch로 사용
        switch (message.type) {
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`))
                break                   //return과 같은역활,안해줄경우 다음case까지도 계속 진행됨
            case "nickname":
                socket["nickname"] = message.payload   //object에 요소 추가하는 방식, 
                break                                   //socket.nickname = massage.payload
        }
    })

})



server.listen(3000, handleListen);


