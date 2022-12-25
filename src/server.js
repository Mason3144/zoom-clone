import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

/*wsServer.on("connection")을 이용하여 websocket 요청을 받음 */
wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    //"join_room"이라는 이벤트 요청을 받으면
    socket.join(roomName); // join을 이용하여 특정 room을 생성하거나 조인함
    socket.to(roomName).emit("welcome"); //to를 이용하여 실행될 방을 특정짓고 "welcome"이라는 이벤트를 프론트엔드로 요청
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  }); // 호스트에게 받은 offer를 roomName안의 게스트에게 전달
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  }); // 게스트에서 받은 answer를 roomName안의 호스트에게 전달
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
