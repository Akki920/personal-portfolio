import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, AlertCircle, CheckCircle2, XCircle, Clock, Wifi, WifiOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

const FR_API_BASE = '/fr-api';

type Tab = 'add' | 'session';
type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

interface FaceResult {
  name: string | null;
  confidence: number;
  distance: number;
  match_found: boolean;
  bbox: number[];
}

export default function FacialRecognition() {
  const [tab, setTab] = useState<Tab>('add');
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('checking');
  const [serverInfo, setServerInfo] = useState<any>(null);

  // Add Face state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [faceName, setFaceName] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerResult, setRegisterResult] = useState<{ success: boolean; message: string; debugImage?: string } | null>(null);

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(90);
  const [sessionFrame, setSessionFrame] = useState<string | null>(null);
  const [sessionResults, setSessionResults] = useState<FaceResult[]>([]);
  const [sessionFps, setSessionFps] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameLoopRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Check FR API connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${FR_API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          setConnStatus('connected');
          setServerInfo(data);
        } else {
          setConnStatus('disconnected');
        }
      } catch {
        setConnStatus('disconnected');
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => clearInterval(interval);
  }, []);

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRegisterResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRegisterResult(null);
    }
  };

  // Register face
  const handleRegister = async () => {
    if (!selectedFile || !faceName.trim()) return;
    setRegistering(true);
    setRegisterResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('name', faceName.trim());
      formData.append('debug_mode', 'true');

      const res = await fetch(`${FR_API_BASE}/faces/register`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRegisterResult({
          success: true,
          message: `Face registered successfully as "${faceName.trim()}" (ID: ${data.data.face_id})`,
          debugImage: data.debug_image_base64,
        });
        setFaceName('');
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setRegisterResult({
          success: false,
          message: data.error || data.detail || 'Registration failed',
          debugImage: data.debug_image_base64,
        });
      }
    } catch (err) {
      setRegisterResult({
        success: false,
        message: `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setRegistering(false);
    }
  };

  // Session controls
  const startSession = useCallback(async () => {
    setSessionEnded(false);
    setSessionResults([]);
    setSessionFrame(null);
    setSessionTime(90);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setSessionActive(true);

      // Countdown
      sessionTimerRef.current = setInterval(() => {
        setSessionTime((prev) => {
          if (prev <= 1) {
            stopSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Frame loop
      const processFrame = async () => {
        if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/jpeg', 0.8)
        );

        if (!blob) {
          frameLoopRef.current = requestAnimationFrame(processFrame);
          return;
        }

        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');
        formData.append('debug_mode', 'true');
        formData.append('save_debug', 'false');

        try {
          const res = await fetch(`${FR_API_BASE}/faces/search`, {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();

          if (data.debug_image_base64) {
            setSessionFrame(`data:image/png;base64,${data.debug_image_base64}`);
          }
          if (data.data?.faces) {
            setSessionResults(data.data.faces);
          }

          const now = performance.now();
          if (lastFrameTime.current > 0) {
            const elapsed = (now - lastFrameTime.current) / 1000;
            setSessionFps(Math.round(1 / elapsed));
          }
          lastFrameTime.current = now;
        } catch {
          // API error, continue loop
        }

        if (streamRef.current) {
          frameLoopRef.current = requestAnimationFrame(processFrame);
        }
      };

      frameLoopRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error('Camera access error:', err);
    }
  }, []);

  const stopSession = useCallback(() => {
    setSessionActive(false);
    setSessionEnded(true);

    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (frameLoopRef.current) {
      cancelAnimationFrame(frameLoopRef.current);
      frameLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#0a0a0f', paddingTop: '64px' }}>
      {/* Background aurora */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 30% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="content-container relative z-10 py-12 md:py-20">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#a78bfa')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>

        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-label text-neon-violet tracking-widest">LIVE DEMO</span>
          <h1 className="text-section-h2 mt-3" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
            FACIAL RECOGNITION SYSTEM
          </h1>
          <p className="mt-4" style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(255, 255, 255, 0.5)' }}>
            Real-time face detection and recognition powered by ONNX Runtime with CUDA GPU acceleration.
            Register faces via photo upload, then start a live webcam session to see recognition in action.
            The system uses MongoDB as a vector store for face embeddings with sub-second search latency.
          </p>

          {/* Connection status */}
          <div className="mt-4 flex items-center gap-2">
            {connStatus === 'connected' ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  FR API Connected · {serverInfo?.vector_store_faces ?? 0} face(s) registered
                </span>
              </>
            ) : connStatus === 'checking' ? (
              <>
                <Wifi className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  Checking FR API connection...
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  FR API not available — start the server on port 8000
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'add' as Tab, label: 'ADD FACE', icon: Upload },
            { id: 'session' as Tab, label: 'LIVE SESSION', icon: Video },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                if (sessionActive) stopSession();
                setTab(id);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-pill text-cta transition-all duration-300"
              style={{
                background: tab === id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${tab === id ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                color: tab === id ? '#a78bfa' : 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-4xl">
          {tab === 'add' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="liquid-glass p-8 md:p-10">
                <h2 className="text-section-h3 mb-6" style={{ fontSize: '20px' }}>
                  REGISTER A NEW FACE
                </h2>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Upload zone */}
                  <div className="flex-1">
                    <div
                      className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 min-h-[240px] flex flex-col items-center justify-center"
                      style={{
                        borderColor: previewUrl ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                        background: previewUrl ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('face-upload')?.click()}
                    >
                      <input
                        id="face-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-52 rounded-lg object-contain"
                        />
                      ) : (
                        <>
                          <Upload className="w-10 h-10 mb-4" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
                          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)' }}>
                            Drag & drop a face photo here
                          </p>
                          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.2)', marginTop: '4px' }}>
                            or click to browse — JPG, PNG, WebP
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div>
                      <label
                        className="text-label tracking-widest block mb-2"
                        style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.35)' }}
                      >
                        PERSON'S NAME
                      </label>
                      <input
                        type="text"
                        value={faceName}
                        onChange={(e) => setFaceName(e.target.value)}
                        placeholder="Enter name..."
                        className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all duration-300 focus:ring-1 focus:ring-purple-500"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      />
                    </div>

                    <button
                      onClick={handleRegister}
                      disabled={!selectedFile || !faceName.trim() || registering || connStatus !== 'connected'}
                      className="btn-classic-filled text-cta mt-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {registering ? 'REGISTERING...' : 'REGISTER FACE'}
                    </button>

                    {/* Result */}
                    {registerResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 rounded-xl mt-2"
                        style={{
                          background: registerResult.success
                            ? 'rgba(34, 197, 94, 0.08)'
                            : 'rgba(239, 68, 68, 0.08)',
                          border: `1px solid ${registerResult.success ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        }}
                      >
                        {registerResult.success ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
                          {registerResult.message}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Debug image */}
                {registerResult?.debugImage && (
                  <div className="mt-6">
                    <span
                      className="text-label tracking-widest block mb-3"
                      style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      DEBUG OUTPUT
                    </span>
                    <img
                      src={`data:image/png;base64,${registerResult.debugImage}`}
                      alt="Debug"
                      className="rounded-xl max-w-full"
                      style={{ border: '1px solid rgba(255, 255, 255, 0.06)' }}
                    />
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {tab === 'session' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="liquid-glass p-8 md:p-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-section-h3" style={{ fontSize: '20px' }}>
                    LIVE RECOGNITION SESSION
                  </h2>
                  {sessionActive && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-label tracking-widest"
                          style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}
                        >
                          FPS
                        </span>
                        <span className="font-mono text-neon-violet" style={{ fontSize: '14px' }}>
                          {sessionFps}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" style={{ color: sessionTime <= 10 ? '#ef4444' : '#a78bfa' }} />
                        <span
                          className="text-label tracking-widest"
                          style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', marginRight: '4px' }}
                        >
                          TIME REMAINING:
                        </span>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: sessionTime <= 10 ? '#ef4444' : '#a78bfa',
                          }}
                        >
                          {formatTime(sessionTime)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video/Canvas area */}
                <div className="relative rounded-2xl overflow-hidden" style={{ background: '#000', minHeight: '360px' }}>
                  <video ref={videoRef} className="hidden" playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />

                  {sessionFrame ? (
                    <img
                      src={sessionFrame}
                      alt="Recognition output"
                      className="w-full h-auto"
                    />
                  ) : sessionActive ? (
                    <div className="flex items-center justify-center h-80">
                      <p style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Waiting for first frame...</p>
                    </div>
                  ) : sessionEnded ? (
                    <div className="flex flex-col items-center justify-center h-80 gap-4">
                      <AlertCircle className="w-12 h-12 text-neon-violet" />
                      <p className="text-section-h3" style={{ fontSize: '20px' }}>SESSION ENDED</p>
                      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)' }}>
                        The 90-second session has completed.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-80 gap-4">
                      <Video className="w-12 h-12" style={{ color: 'rgba(255, 255, 255, 0.15)' }} />
                      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.3)' }}>
                        Start a session to begin live face recognition
                      </p>
                      <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.15)' }}>
                        Maximum session duration: 90 seconds
                      </p>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="mt-6 flex items-center gap-4">
                  {!sessionActive ? (
                    <button
                      onClick={startSession}
                      disabled={connStatus !== 'connected'}
                      className="btn-classic-filled text-cta disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {sessionEnded ? 'RESTART SESSION' : 'START SESSION'}
                    </button>
                  ) : (
                    <button
                      onClick={stopSession}
                      className="px-6 py-3 rounded-pill text-cta transition-all duration-300"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                      }}
                    >
                      STOP SESSION
                    </button>
                  )}
                </div>

                {/* Detected faces info */}
                {sessionResults.length > 0 && (
                  <div className="mt-6">
                    <span
                      className="text-label tracking-widest block mb-3"
                      style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)' }}
                    >
                      DETECTED FACES ({sessionResults.length})
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {sessionResults.map((face, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 rounded-xl"
                          style={{
                            background: face.match_found
                              ? 'rgba(34, 197, 94, 0.08)'
                              : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${face.match_found ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                          }}
                        >
                          <span style={{ fontSize: '13px', color: face.match_found ? '#22c55e' : 'rgba(255, 255, 255, 0.4)' }}>
                            {face.match_found ? face.name : 'Unknown'}{' '}
                            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.25)' }}>
                              ({(face.confidence * 100).toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

