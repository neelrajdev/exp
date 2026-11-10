import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Ardia3DCanvas Component
 * Inspired by https://ardia.dev/
 * Implements:
 * 1. Procedural painterly 3D terrain with impressionist rolling hills
 * 2. Radiant atmospheric sun with warm glowing sunset/sunrise tones
 * 3. Floating pollen/fireflies particles that sway in 3D space
 * 4. Cursor reactivity: Camera smooth-lerps with mouse pointer coordinates
 * 5. Scroll reactivity: Camera orbits, dollys and pitches along a 3D path based on window scroll progress
 */
export function Ardia3DCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf1ece2, 0.022); // Warm Ardia atmosphere fog

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffecd2, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xff9e3d, 2.5);
    sunLight.position.set(2, 6, -10);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xa5c9ff, 0.8);
    fillLight.position.set(-5, 4, 5);
    scene.add(fillLight);

    // 1. Radiant Glowing Sun
    const sunGeometry = new THREE.SphereGeometry(2.4, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7b00,
      transparent: true,
      opacity: 0.95
    });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(3.5, 3.2, -22);
    scene.add(sunMesh);

    // Sun Outer Halo Glow
    const haloGeometry = new THREE.RingGeometry(2.4, 5.8, 48);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffad42,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
    haloMesh.position.copy(sunMesh.position);
    haloMesh.position.z += 0.1;
    scene.add(haloMesh);

    // 2. Rolling Painterly Hills Terrain
    const terrainWidth = 60;
    const terrainDepth = 50;
    const terrainGeo = new THREE.PlaneGeometry(terrainWidth, terrainDepth, 80, 80);
    terrainGeo.rotateX(-Math.PI / 2);

    // Procedural Elevation for painterly hills
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Dual sin/cos waves to create organic rolling meadow hills
      const y = Math.sin(x * 0.18) * 1.5 + Math.cos(z * 0.14) * 1.8 + Math.sin((x + z) * 0.08) * 2.2 - (z * 0.1);
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    // Custom Canvas Texture mimicking oil-painting brush strokes
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 512;
    canvasTexture.height = 512;
    const ctx = canvasTexture.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#4d6828');   // Olive moss
    grad.addColorStop(0.4, '#5b7b32'); // Meadow green
    grad.addColorStop(0.7, '#738e3e'); // Sunlit grass
    grad.addColorStop(1, '#8fa64c');   // Golden weed
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Paint subtle stipples / dabs
    ctx.fillStyle = 'rgba(255, 230, 160, 0.12)';
    for (let i = 0; i < 600; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 4 + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(30, 45, 10, 0.15)';
    for (let i = 0; i < 400; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const groundTex = new THREE.CanvasTexture(canvasTexture);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(6, 6);

    const terrainMat = new THREE.MeshLambertMaterial({
      map: groundTex,
      roughness: 0.9,
      metalness: 0.1
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.set(0, -1.8, -5);
    scene.add(terrainMesh);

    // 3. Floating Light Particles / Fireflies
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 35;
      particlePositions[i + 1] = Math.random() * 8 + 0.2;
      particlePositions[i + 2] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffd580,
      size: 0.18,
      transparent: true,
      opacity: 0.85
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Cursor Movement Reactive Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e) => {
      // Normalize to -1 to 1
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // 5. Scroll Reactive Tracking
    let scrollY = window.scrollY || 0;
    let targetScrollY = scrollY;
    const onScroll = () => {
      targetScrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop with smooth LERP
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth cursor lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Smooth scroll lerp
      scrollY += (targetScrollY - scrollY) * 0.08;
      const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const scrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));

      // 3D Camera updates based on cursor + scroll
      // Camera dollies forward, tilts down, and follows cursor parallax
      const baseCamX = mouse.x * 1.5;
      const baseCamY = 3.5 + mouse.y * 0.8 - scrollProgress * 2.8;
      const baseCamZ = 14 - scrollProgress * 10;

      camera.position.x = baseCamX;
      camera.position.y = baseCamY;
      camera.position.z = baseCamZ;

      // Look at horizon, tilting down as you scroll
      camera.lookAt(
        mouse.x * 0.5,
        1.5 - scrollProgress * 3.5,
        -15
      );

      // Subtle pulsing of the sun and floating fireflies
      sunMesh.position.y = 3.2 + Math.sin(elapsedTime * 0.5) * 0.15 - scrollProgress * 1.5;
      haloMesh.position.copy(sunMesh.position);
      haloMesh.position.z += 0.1;
      haloMesh.rotation.z += 0.002;

      // Drift particles gently
      const pPos = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        pPos[i + 1] += Math.sin(elapsedTime + pPos[i]) * 0.005;
        pPos[i] += Math.cos(elapsedTime + pPos[i + 2]) * 0.003;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      // Clean up Three.js resources
      sunGeometry.dispose();
      sunMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      groundTex.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
}
