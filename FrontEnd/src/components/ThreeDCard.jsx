import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D Greeting Card using Vanilla Three.js (no react-three-fiber to avoid React reconciler issues)
 */
const ThreeDCard = ({ message = "", sender = "Bạn", recipient = "Người thương", coverColor = "#ffcdc9", coverImage = null }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const coverMaterialRef = useRef(null);
  const coverTextPlaneRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Target rotation for animation
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Card Group (for overall positioning)
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    
    // Right Panel (Static - "Inside" of card)
    const rightGeometry = new THREE.BoxGeometry(3, 4, 0.05);
    const rightMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const rightPanel = new THREE.Mesh(rightGeometry, rightMaterial);
    rightPanel.position.set(1.5, 0, 0);
    cardGroup.add(rightPanel);
    
    // Create text texture for inside
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 512, 512);
    
    // Text
    ctx.fillStyle = '#ec407a';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Gửi ${recipient},`, 256, 80);
    
    ctx.fillStyle = '#333';
    ctx.font = '22px serif';
    const words = message.split(' ');
    let line = '';
    let y = 140;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > 400 && i > 0) {
        ctx.fillText(line, 256, y);
        line = words[i] + ' ';
        y += 35;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 256, y);
    
    ctx.fillStyle = '#ec407a';
    ctx.font = 'italic 26px serif';
    ctx.fillText(`Từ: ${sender}`, 256, y + 80);
    
    const textTexture = new THREE.CanvasTexture(canvas);
    
    // Inside text plane
    const textGeometry = new THREE.PlaneGeometry(2.8, 3.8);
    const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture });
    const textPlane = new THREE.Mesh(textGeometry, textMaterial);
    textPlane.position.set(1.5, 0, 0.03);
    cardGroup.add(textPlane);
    
    // Left Panel (The Cover - Rotates)
    // Pivot group at x=0
    const coverPivot = new THREE.Group();
    cardGroup.add(coverPivot);
    
    // Cover material (will be updated when coverImage changes)
    const coverColor3 = new THREE.Color(coverColor);
    const leftGeometry = new THREE.BoxGeometry(3, 4, 0.05);
    const leftMaterial = new THREE.MeshStandardMaterial({ color: coverColor3 });
    coverMaterialRef.current = leftMaterial;
    const leftPanel = new THREE.Mesh(leftGeometry, leftMaterial);
    leftPanel.position.set(1.5, 0, 0); // Offset so left edge is at pivot
    coverPivot.add(leftPanel);
    
    // Cover text/image plane (on front of cover)
    const coverTextGeometry = new THREE.PlaneGeometry(2.8, 3.8);
    let coverTexture;
    
    if (coverImage) {
      // Load image texture
      const loader = new THREE.TextureLoader();
      loader.load(coverImage, (texture) => {
        if (coverTextPlaneRef.current) {
          coverTextPlaneRef.current.material.map = texture;
          coverTextPlaneRef.current.material.needsUpdate = true;
        }
      });
      coverTexture = null; // Will be set by loader
    } else {
      // Create canvas texture with text
      const coverCanvas = document.createElement('canvas');
      coverCanvas.width = 512;
      coverCanvas.height = 512;
      const coverCtx = coverCanvas.getContext('2d');
      coverCtx.fillStyle = coverColor;
      coverCtx.fillRect(0, 0, 512, 512);
      coverCtx.fillStyle = '#fff';
      coverCtx.font = 'bold 48px serif';
      coverCtx.textAlign = 'center';
      coverCtx.fillText('Chúc Mừng', 256, 200);
      coverCtx.font = '80px serif';
      coverCtx.fillText('🎂', 256, 320);
      coverTexture = new THREE.CanvasTexture(coverCanvas);
    }
    
    const coverTextMaterial = new THREE.MeshBasicMaterial({ 
      map: coverTexture,
      transparent: !coverTexture // Transparent if no texture yet (loading)
    });
    const coverTextPlane = new THREE.Mesh(coverTextGeometry, coverTextMaterial);
    coverTextPlane.position.set(1.5, 0, 0.03);
    coverTextPlaneRef.current = coverTextPlane;
    coverPivot.add(coverTextPlane);
    
    // Inner white page of cover
    const innerCoverGeometry = new THREE.PlaneGeometry(2.9, 3.9);
    const innerCoverMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.BackSide });
    const innerCover = new THREE.Mesh(innerCoverGeometry, innerCoverMaterial);
    innerCover.position.set(1.5, 0, -0.026);
    innerCover.rotation.y = Math.PI;
    coverPivot.add(innerCover);
    
    // Center the whole group
    cardGroup.position.set(-1.5, 0, 0);
    
    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Smooth lerp to target
      currentRotation.current += (targetRotation.current - currentRotation.current) * 0.08;
      coverPivot.rotation.y = currentRotation.current;
      
      // Slight float animation
      cardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      cardGroup.rotation.z = Math.sin(Date.now() * 0.0005) * 0.02;
      
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [message, sender, recipient, coverColor, coverImage]);
  
  // Update target rotation when isOpen changes
  useEffect(() => {
    targetRotation.current = isOpen ? -2.5 : 0;
  }, [isOpen]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '400px', 
        cursor: 'pointer',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
      title="Di chuột hoặc nhấn để mở thiệp"
    />
  );
};

export default ThreeDCard;
