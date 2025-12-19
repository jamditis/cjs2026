/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer, Text } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { X } from 'lucide-react';
import * as THREE from 'three';

// Assets
import cardGLB from '../assets/lanyard/card.glb';
import lanyardTexture from '../assets/lanyard/lanyard.png';

import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  onDismiss
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="lanyard-dismiss-btn"
          aria-label="Dismiss lanyard"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

// Create custom card texture with CJS branding
function createCardTexture(onUpdate) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Card dimensions (matching typical badge aspect ratio)
  canvas.width = 512;
  canvas.height = 720;

  // Background - cream/parchment color
  ctx.fillStyle = '#F5F0E6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add subtle texture pattern
  ctx.strokeStyle = 'rgba(44, 62, 80, 0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.height; i += 8) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Top accent bar - teal
  ctx.fillStyle = '#2A9D8F';
  ctx.fillRect(0, 0, canvas.width, 60);

  const texture = new THREE.CanvasTexture(canvas);

  // Load and draw the CJS logo
  const logo = new Image();
  logo.crossOrigin = 'anonymous';
  logo.onload = () => {
    // Draw logo centered near top
    const logoSize = 120;
    ctx.drawImage(logo, (canvas.width - logoSize) / 2, 80, logoSize, logoSize);

    // Year badge below logo
    ctx.fillStyle = '#2A9D8F';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('2026', canvas.width / 2, 260);

    // Main title
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillText('COLLABORATIVE', canvas.width / 2, 320);
    ctx.fillText('JOURNALISM', canvas.width / 2, 358);
    ctx.fillText('SUMMIT', canvas.width / 2, 396);

    // Decorative line
    ctx.strokeStyle = '#2A9D8F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 430);
    ctx.lineTo(canvas.width - 100, 430);
    ctx.stroke();

    // Anniversary text
    ctx.fillStyle = '#2A9D8F';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText('10th Anniversary', canvas.width / 2, 475);

    // Location and date
    ctx.fillStyle = '#2C3E50';
    ctx.font = '20px sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText('June 8-9, 2026', canvas.width / 2, 530);
    ctx.fillText('Chapel Hill, NC', canvas.width / 2, 558);
    ctx.globalAlpha = 1;

    // Welcome message at bottom
    ctx.fillStyle = '#2C3E50';
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText('Welcome!', canvas.width / 2, 630);

    // Bottom accent bar
    ctx.fillStyle = '#2A9D8F';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    texture.needsUpdate = true;
    if (onUpdate) onUpdate();
  };
  logo.src = '/cjs-logo-iso.png';

  // Draw initial text (without logo, in case image fails to load)
  ctx.fillStyle = '#2A9D8F';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('2026', canvas.width / 2, 180);

  ctx.fillStyle = '#2C3E50';
  ctx.font = 'bold 32px Georgia, serif';
  ctx.fillText('COLLABORATIVE', canvas.width / 2, 260);
  ctx.fillText('JOURNALISM', canvas.width / 2, 298);
  ctx.fillText('SUMMIT', canvas.width / 2, 336);

  ctx.strokeStyle = '#2A9D8F';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 370);
  ctx.lineTo(canvas.width - 100, 370);
  ctx.stroke();

  ctx.fillStyle = '#2A9D8F';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText('10th Anniversary', canvas.width / 2, 420);

  ctx.fillStyle = '#2C3E50';
  ctx.font = '20px sans-serif';
  ctx.globalAlpha = 0.7;
  ctx.fillText('June 8-9, 2026', canvas.width / 2, 480);
  ctx.fillText('Chapel Hill, NC', canvas.width / 2, 508);
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#2C3E50';
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText('Welcome!', canvas.width / 2, 580);

  ctx.fillStyle = '#2A9D8F';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

  texture.needsUpdate = true;
  return texture;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyardTexture);

  // Create custom card texture with CJS branding
  const [, forceUpdate] = useState(0);
  const [cardTexture] = useState(() => createCardTexture(() => forceUpdate(n => n + 1)));

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardTexture}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
