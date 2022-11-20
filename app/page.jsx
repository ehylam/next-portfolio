"use client"
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import styles from './page.module.css'


export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const buttonRef = useRef(null);
  const [image, setImage] = useState(null);
  const [predictedImage, setPredictedImage] = useState(null);
  const [loading, setLoading] = useState(false)

  async function predictImage(image) {
    setLoading(true);

    fetch('https://elambo-minimal.hf.space/run/predict', {
      method: 'POST',
      body: JSON.stringify({
        "data": [image]
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) =>
      response.json()

    ).then((res) => {
      setLoading(false);
      setPredictedImage(res.data[0].label);
    })
  }

  function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function (e) {
      setImage(e.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  }

  useEffect(() => {
    buttonRef.current.onclick = function() {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      canvasRef.current.getContext('2d').drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      const frame = canvasRef.current.toDataURL('image/jpeg', 1.0);
      setImage(frame);
    };

    const constraints = {
      audio: false,
      video: { width: 1280, height: 720 }
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then((mediaStream) => {
      videoRef.current.srcObject = mediaStream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
      };
    })
    .catch((err) => {
      console.error(`${err.name}: ${err.message}`);
    });
  },[videoRef]);


  useEffect(() => {
    image && predictImage(image);
  },[image]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <video ref={videoRef} width="640" height="480"></video>
        <button ref={buttonRef}>Take Photo</button>
        <canvas ref={canvasRef}></canvas>
        {image && <Image src={image} alt="A image" width="375" height="375" />}
        <p>OR</p>
        <input id="photo" type="file" onChange={handleImage.bind(this)}/>

        {loading && <p>It&apos;s a...</p>}
        {!loading && predictedImage && <h2> {predictedImage}</h2>}
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}
