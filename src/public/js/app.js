const socket = io();

const myFace = document.getElementById("myFace")
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const cameraSelect = document.getElementById("cameras")

let myStream;
let muted = false
let blind = false


const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter((device) => device.kind === "videoinput")
        const currentCamera = myStream.getVideoTracks()[0]
        cameras.forEach((camera) => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label
            if (currentCamera.label == camera.label) {
                option.selected = true;
            }
            cameraSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e)
    }
}


const getMedia = async (deviceId) => {
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" }
    }
    const cameraConstrains = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    }


    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras()
        }
    } catch (e) {
        console.log(e);
    }
}

getMedia();

const handleMute = () => {
    console.log(myStream.getAudioTracks())
    myStream.getAudioTracks().forEach((track) => track.enabled = !track.enabled)
    // myStream.getAudioTracks()가 array이기때문에 forEach를 사용
    //video.muted 는 비디오 재생에서 소리를끄는것이며 getAudioTracks는 마이크를 제어
    if (!muted) {
        muteBtn.innerText = "Unmute"
        muted = true;
    } else {
        muteBtn.innerText = "Mute"
        muted = false
    }
}
const handleBlind = () => {
    myStream.getVideoTracks().forEach((track) => track.enabled = !track.enabled)
    if (blind) {
        cameraBtn.innerText = "Camera off"
        blind = false
    } else {
        cameraBtn.innerText = "Camera on"
        blind = true
    }
}

const handleCameraChange = async () => {
    await getMedia(cameraSelect.value)
}

muteBtn.addEventListener("click", handleMute)
cameraBtn.addEventListener("click", handleBlind)
cameraSelect.addEventListener("input", handleCameraChange)