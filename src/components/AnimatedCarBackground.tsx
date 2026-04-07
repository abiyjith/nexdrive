import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

function Car() {
  const carRef = useRef<any>()

  useFrame(() => {
    if (carRef.current) {
      carRef.current.rotation.y += 0.002
    }
  })

  return (
    <mesh ref={carRef} position={[0, -1, 0]}>
      <boxGeometry args={[3, 0.6, 1.5]} />
      <meshStandardMaterial color="#facc15" />
    </mesh>
  )
}

export default function AnimatedCarBackground() {
  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -1
    }}>
      <Canvas camera={{ position: [0, 2, 6] }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} />

        <Car />

        <Environment preset="city" />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  )
}
