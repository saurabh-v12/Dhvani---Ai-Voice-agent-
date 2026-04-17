import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export const ORB_STATE_CONFIG = {
  idle:      { color: '#7C3AED', accent: '#0EA5E9', rotation: 0.15, pulse: false },
  listening: { color: '#DB2777', accent: '#7C3AED', rotation: 0.65, pulse: true  },
  thinking:  { color: '#F59E0B', accent: '#DB2777', rotation: 0.35, pulse: false },
  speaking:  { color: '#10B981', accent: '#0EA5E9', rotation: 0.65, pulse: true  },
}

function OrbMesh({ intensity, color, accent, rotation, pulse }) {
  const group = useRef(null)

  const palette = useMemo(
    () => ({
      core: new THREE.Color(color),
      accent: new THREE.Color(accent),
    }),
    [color, accent],
  )

  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * rotation
    group.current.rotation.x += delta * (rotation * 0.35)

    const t = state.clock.getElapsedTime()
    group.current.position.y = Math.sin(t * 0.9) * 0.08

    const base = 1
    const pulseScale = pulse ? 1 + Math.sin(t * 4.5) * 0.05 : base
    group.current.scale.setScalar(pulseScale)
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          color={palette.core}
          emissive={palette.accent}
          emissiveIntensity={0.65 * intensity}
          roughness={0.25}
          metalness={0.35}
        />
      </mesh>

      <mesh scale={1.08}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={0.2 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.2}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshBasicMaterial
          color={palette.core}
          transparent
          opacity={0.1 * intensity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function GlowingOrb({ className, intensity = 1, state = 'idle' }) {
  const cfg = ORB_STATE_CONFIG[state] || ORB_STATE_CONFIG.idle

  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 2, 2]} intensity={18} color={cfg.color} />
        <pointLight position={[-2, -1, 2]} intensity={12} color={cfg.accent} />
        <pointLight position={[0, -3, -2]} intensity={10} color={cfg.color} />

        <OrbMesh
          intensity={intensity}
          color={cfg.color}
          accent={cfg.accent}
          rotation={cfg.rotation}
          pulse={cfg.pulse}
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
