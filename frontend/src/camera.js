import { initializeApp } from "../node_modules/firebase/app";
import { getStorage, ref, uploadBytes } from "../node_modules/firebase/storage";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

var isUserFacing = true;
var stream = null;
var hideTaken = null;

function dataURLtoFile(dataurl, filename) {
  console.log(dataurl);

  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function upload(dataUrl, name, completion) {
  const fileRef = ref(storage, name);
  const file = dataURLtoFile(dataUrl, name);

  uploadBytes(fileRef, file).then((snapshot) => {
    console.log("picture uplaoded!");
    completion();
  });
}

// set constraints on the stream
function constraints() {
  console.log("isUserFacing " + isUserFacing);

  return {
    video: {
      facingMode: isUserFacing ? "user" : "enviroment",
      width: { ideal: 3840, min: 1280 },
      height: { ideal: 2160, min: 720 },
    },
    audio: false,
  };
}
// query elements
const cameraView = document.querySelector("#camera-view"),
  cameraOutput = document.querySelector("#camera-output"),
  cameraSensor = document.querySelector("#camera-sensor"),
  cameraTrigger = document.querySelector("#camera-trigger"),
  cameraSwitch = document.querySelector("#camera-switch");

// Access the device camera and stream to cameraView
function cameraStart() {
  console.log("cameraStart");

  try {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    navigator.mediaDevices
      .getUserMedia(constraints())
      .then((loadedStream) => {
        stream = loadedStream;
        cameraView.srcObject = null;
        cameraView.srcObject = stream;
        cameraView.play();

        checkForTorchOption();
      })
      .catch(function(error) {
        console.error("Oops. Something is broken.", error);
      });
  } catch (e) {
    alert(e);
    return;
  }
}

function checkForTorchOption() {
  setTimeout(() => {
    const track = stream.getVideoTracks()[0];
    const photoCapabilities = track.getCapabilities();
    if (photoCapabilities.torch) {
      track
        .applyConstraints({
          advanced: [{ torch: true }],
        })
        .catch((e) => alert(e));
    }
  }, 500);
}

// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function() {
  console.log("take picture clicked");

  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);

  clearTimeout(hideTaken);

  // todo: cameraOutput classes here
  const dataUrl = cameraSensor.toDataURL("image/jpeg", 1.0);
  cameraOutput.src = dataUrl;
  cameraOutput.classList.add("taken");
  cameraOutput.classList.remove("hidden");

  if (isUserFacing) {
    cameraOutput.classList.remove("camera-output-enviroment");
    cameraOutput.classList.add("camera-output-user");
  } else {
    cameraOutput.classList.add("camera-output-enviroment");
    cameraOutput.classList.remove("camera-output-user");
  }

  // hide taken after 2 seconds?
  hideTaken = setTimeout(() => {
    cameraOutput.classList.add("hidden");
    cameraOutput.classList.remove("taken");
  }, 3000);

  const name =
    "picture_" + Date.now() + "_" + getRandomInt(1000) + "_" + ".jpeg";

  upload(dataUrl, name, function() {
    console.log("okay");
  });
};

cameraSwitch.onclick = function() {
  console.log("camera switch clicked");

  isUserFacing = !isUserFacing;

  if (isUserFacing) {
    cameraView.classList.remove("camera-view-enviroment");
    cameraSensor.classList.remove("camera-sensor-enviroment");
    cameraView.classList.add("camera-view-user");
    cameraSensor.classList.add("camera-sensor-user");
  } else {
    cameraView.classList.add("camera-view-enviroment");
    cameraSensor.classList.add("camera-sensor-enviroment");
    cameraView.classList.remove("camera-view-user");
    cameraSensor.classList.remove("camera-sensor-user");
  }

  cameraStart();
};

// Start the video stream when the window loads
window.addEventListener("load", cameraStart(), false);
