const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let roomName;
let myPeerConnection;
let dataChannel;

//welcome form (getting inside of a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

/*초기의 form으로 room name을 입력받아 지정해주며 websocket을 연결함*/

const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;
  makeConnection(); // P2P통신을 위한 연결 실행 RTC 피어 케넥션 연결
};

const handleWelcomeSubmit = async (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  //emit을 이용해 "join_room"이라는 이름으로 input값(room name)을 백엔드로 보낸다.
  roomName = input.value; // 입력받은 room name을 가변변수로 저장
  input.value = "";
};

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

//Data channel
const messageForm = document.getElementById("messageForm");

let messages = [];
const handleMessage = (event) => {
  const text = document.getElementById("text");
  const ul = document.getElementById("ul");
  const li = document.createElement("li");
  event.preventDefault();
  if (event.data) {
    li.innerText = `Candidate: ${event.data}`;
    ul.appendChild(li);
    return;
  }
  if (text.value === "") {
    return;
  }
  li.innerText = `You: ${text.value}`;
  ul.appendChild(li);
  dataChannel.send(text.value);
  text.value = "";
};
messageForm.addEventListener("submit", handleMessage);

//socket

/*RTC연결을 위해 호스트(peer A)에서 게스트(peer B)쪽으로 offer를 전달해준다. */
/*RTC 커넥션에는 각각 offer와 answer가 존재하며 호스트와 게스트를 식별하는데 사용된다. */
/*호스트에서 offer를 생성, 게스트에서 answer를 생성 */
socket.on("welcome", async () => {
  dataChannel = myPeerConnection.createDataChannel("chat"); // 채팅을 위한 데이터채널을 호스트에서 생성 //이후 dataChannel.send()를 통해 메세지가 전송되며
  dataChannel.addEventListener("message", handleMessage); //datachannel을 통해 전달받은 메세지를 브라우저에 표시
  const offer = await myPeerConnection.createOffer(); // 게스트에게 줄 offer를 생성후
  myPeerConnection.setLocalDescription(offer); // 생성된 offer를 호스트의 RTC커넥션에 등록
  socket.emit("offer", offer, roomName); // 이후 생선된 offer를 백엔드로 보낸후 게스트쪽으로 전달받는다.
});

/*게스트쪽에서 offer를 받은후 answer를 만들고 그 answer와 호스트에게 받은 offer를 RTC에 등록, 그후 호스트쪽으로 answer전달*/
socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    // 호스트가 생성한 데이터채널을 RTC를 통해 전달받음
    dataChannel = event.channel;
    dataChannel.addEventListener("message", handleMessage);
  });
  myPeerConnection.setRemoteDescription(offer); // 호스트에게 받은 offer를 RTC에 등록
  const answer = await myPeerConnection.createAnswer(); // 게스트를 위한 answer를 생성
  myPeerConnection.setLocalDescription(answer); // 생성한 answer를 RTC에 등록
  socket.emit("answer", answer, roomName); // 생성한 answer를 백엔드를 통해 호스트로 전달
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
}); // 백엔드를 통해 게스트에게서 받은 answer를 호스트의 RTC에 등록

//ICE 인터넷연결생성, webRTC를 이용하기위한 설정으로 멀리떨어진 장치와 소통하기 위해 필요하다.
socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
}); // 상대방에게 받은 icecandidate을 RTC커넥션에 등록

//RTC code
// RTC를 이용하여 서버를 거치지않고 사용자들간의 P2P통신이 가능하다.
// 서버에 부담이 적은 장점이있지만 데이터가 서버에 저장되지않는다는 단점이 있음.
//구글 STUN서버를 이용하여 일반 기기에서도 외부에서 접근이 가능한 공용IP주소를 갖게 해줌
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: ["stun:ntk-turn-2.xirsys.com"],
      },
      {
        username:
          "bcdsuD0lobDXBFNpGsNIULgJDNNpzEwi9Gz-TfM0FfqvJAQFQFbdQMoLAY9QR62hAAAAAGKiuIx4MTIxMjEy",
        credential: "50a7b9c4-e86c-11ec-9500-0242ac120004",
        urls: [
          "turn:ntk-turn-2.xirsys.com:80?transport=udp",
          "turn:ntk-turn-2.xirsys.com:3478?transport=udp",
          "turn:ntk-turn-2.xirsys.com:80?transport=tcp",
          "turn:ntk-turn-2.xirsys.com:3478?transport=tcp",
          "turns:ntk-turn-2.xirsys.com:443?transport=tcp",
          "turns:ntk-turn-2.xirsys.com:5349?transport=tcp",
        ],
      },
    ],
  }); // stun server offered by google, you need to make own stun server instead of google if you make a real peer to peer comunication service
  myPeerConnection.addEventListener("icecandidate", handleIce);
  //offer와 answer를 교환후 icecandidate라는 이벤트가 실행됨
};

//offer와 answer를 교환후 icecandidate라는 이벤트가 실행되며 각 클라이언트에서 생성된 icecandidate를 상대방에게 전달해주어야함
const handleIce = (data) => {
  socket.emit("ice", data.candidate, roomName);
};
