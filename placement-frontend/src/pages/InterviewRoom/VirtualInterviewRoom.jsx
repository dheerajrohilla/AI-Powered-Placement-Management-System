import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Clock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle,
  RefreshCw,
  MessageSquare,
  Send,
  X,
  Volume2
} from 'lucide-react';
import { interviewAPI } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/useAuth';

export default function VirtualInterviewRoom() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [hardwareError, setHardwareError] = useState('');
  
  // Media states
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [remoteCameraOff, setRemoteCameraOff] = useState(false);
  const [remoteScreenSharing, setRemoteScreenSharing] = useState(false);

  // Connection states
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, waiting, connected, disconnected
  const [remotePeer, setRemotePeer] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [completedSummary, setCompletedSummary] = useState(null);

  // Timer & Chat
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteSocketIdRef = useRef(null);
  const queuedIceCandidatesRef = useRef([]);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // Format elapsed time (HH:MM:SS)
  const formatTimer = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Fetch Room Access & Verify Permissions
  useEffect(() => {
    let isMounted = true;

    async function loadRoom() {
      try {
        setLoading(true);
        setAuthError('');
        const res = await interviewAPI.getRoomAccess(interviewId);
        if (!isMounted) return;
        setRoomData(res.data);
      } catch (err) {
        console.error('Failed to access interview room:', err);
        if (!isMounted) return;
        if (err.response?.status === 403) {
          setAuthError(err.response?.data?.error || 'Access denied: You are not authorized to join this interview room.');
        } else if (err.response?.status === 404) {
          setAuthError('Interview session does not exist or has expired.');
        } else {
          setAuthError(err.response?.data?.error || 'Failed to initialize virtual interview session.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [interviewId]);

  // 2. Initialize Media & WebRTC after Room Access is verified
  useEffect(() => {
    if (!roomData || authError) return;

    let cleanupDone = false;
    const socket = getSocket();
    socketRef.current = socket;

    // Start duration timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    async function setupMediaAndWebRTC() {
      try {
        // Setup ICE servers from server
        const iceServers = roomData.iceServers || [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ];

        const pc = new RTCPeerConnection({ iceServers });
        peerConnectionRef.current = pc;

        // Acquire local audio and video
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (mediaErr) {
          console.warn('Full media access failed, trying audio only:', mediaErr);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsCameraOff(true);
            setHardwareError('Camera unavailable or permission denied. Joining with audio only.');
          } catch (audioErr) {
            console.error('Audio access failed:', audioErr);
            setHardwareError('Microphone permission denied. Others will not be able to hear you.');
            stream = new MediaStream();
          }
        }

        if (cleanupDone) return;
        localStreamRef.current = stream;

        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
        }

        // Add tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Remote track handler
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setConnectionStatus('connected');
          }
        };

        // ICE candidate handler
        pc.onicecandidate = (event) => {
          if (event.candidate && remoteSocketIdRef.current) {
            socket.emit('webrtc_signal', {
              targetSocketId: remoteSocketIdRef.current,
              signalData: event.candidate,
              type: 'ice-candidate'
            });
          }
        };

        // Connection state changes
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setConnectionStatus('connected');
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setConnectionStatus('reconnecting');
          }
        };

        // Join room via Socket.IO
        socket.emit('webrtc_join_room', {
          interviewId: roomData.interviewId,
          roomId: roomData.roomId
        });

        // Socket Event: Existing peers in room
        socket.on('webrtc_room_peers', async ({ peers, isInitiator }) => {
          if (peers && peers.length > 0) {
            const peer = peers[0];
            remoteSocketIdRef.current = peer.socketId;
            setRemotePeer(peer);
            setConnectionStatus('connecting');

            // If we are initiator (existing peer is present), create SDP offer
            if (isInitiator) {
              try {
                const offer = await pc.createOffer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: true
                });
                await pc.setLocalDescription(offer);
                socket.emit('webrtc_signal', {
                  targetSocketId: peer.socketId,
                  signalData: offer,
                  type: 'offer'
                });
              } catch (err) {
                console.error('Error creating SDP offer:', err);
              }
            }
          } else {
            setConnectionStatus('waiting');
          }
        });

        // Socket Event: New peer joined after us
        socket.on('webrtc_peer_joined', async ({ socketId, name, role }) => {
          remoteSocketIdRef.current = socketId;
          setRemotePeer({ socketId, name, role });
          setConnectionStatus('connecting');

          // Create offer to newly joined peer
          try {
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            await pc.setLocalDescription(offer);
            socket.emit('webrtc_signal', {
              targetSocketId: socketId,
              signalData: offer,
              type: 'offer'
            });
          } catch (err) {
            console.error('Error creating offer for joined peer:', err);
          }
        });

        // Socket Event: Signaling relay (offer, answer, ice-candidate)
        socket.on('webrtc_signal', async ({ senderSocketId, signalData, type, senderName, senderRole }) => {
          remoteSocketIdRef.current = senderSocketId;
          if (senderName) {
            setRemotePeer((prev) => ({ ...prev, socketId: senderSocketId, name: senderName, role: senderRole }));
          }

          try {
            if (type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signalData));
              // Drain any queued candidates
              while (queuedIceCandidatesRef.current.length > 0) {
                const candidate = queuedIceCandidatesRef.current.shift();
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn);
              }

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              socket.emit('webrtc_signal', {
                targetSocketId: senderSocketId,
                signalData: answer,
                type: 'answer'
              });
            } else if (type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(signalData));
              // Drain any queued candidates
              while (queuedIceCandidatesRef.current.length > 0) {
                const candidate = queuedIceCandidatesRef.current.shift();
                await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn);
              }
            } else if (type === 'ice-candidate') {
              if (pc.remoteDescription && pc.remoteDescription.type) {
                await pc.addIceCandidate(new RTCIceCandidate(signalData)).catch(console.warn);
              } else {
                queuedIceCandidatesRef.current.push(signalData);
              }
            }
          } catch (sigErr) {
            console.error('WebRTC signaling error:', sigErr);
          }
        });

        // Socket Event: Remote media toggles
        socket.on('webrtc_media_toggle', ({ isMuted: peerMuted, isCameraOff: peerCamOff }) => {
          if (peerMuted !== undefined) setRemoteMuted(peerMuted);
          if (peerCamOff !== undefined) setRemoteCameraOff(peerCamOff);
        });

        // Socket Event: Remote screen share toggle
        socket.on('webrtc_screen_share_toggle', ({ isSharing }) => {
          setRemoteScreenSharing(Boolean(isSharing));
        });

        // Socket Event: In-call chat
        socket.on('webrtc_chat_message', (msg) => {
          setChatMessages((prev) => [...prev, msg]);
        });

        // Socket Event: Remote Peer Disconnected
        socket.on('webrtc_peer_disconnected', ({ name }) => {
          setConnectionStatus('waiting');
          setRemotePeer(null);
          remoteSocketIdRef.current = null;
        });

        // Socket Event: Call ended by someone
        socket.on('webrtc_call_ended', ({ endedByName, reason }) => {
          handleCallTermination({ endedByName, reason });
        });

        // Socket Event: General error
        socket.on('webrtc_error', ({ message }) => {
          setAuthError(message);
        });
      } catch (err) {
        console.error('Failed to setup WebRTC session:', err);
      }
    }

    setupMediaAndWebRTC();

    return () => {
      cleanupDone = true;
      if (timerRef.current) clearInterval(timerRef.current);

      // Stop local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      // Remove socket listeners
      if (socket) {
        socket.off('webrtc_room_peers');
        socket.off('webrtc_peer_joined');
        socket.off('webrtc_signal');
        socket.off('webrtc_media_toggle');
        socket.off('webrtc_screen_share_toggle');
        socket.off('webrtc_chat_message');
        socket.off('webrtc_peer_disconnected');
        socket.off('webrtc_call_ended');
        socket.off('webrtc_error');
      }
    };
  }, [roomData, authError]);

  // 3. Audio Mute Toggle
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMuted = !audioTrack.enabled;
        setIsMuted(newMuted);

        if (socketRef.current && roomData) {
          socketRef.current.emit('webrtc_media_toggle', {
            roomId: roomData.roomId,
            isMuted: newMuted,
            isCameraOff
          });
        }
      }
    }
  };

  // 4. Video Camera Toggle
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newCamOff = !videoTrack.enabled;
        setIsCameraOff(newCamOff);

        if (socketRef.current && roomData) {
          socketRef.current.emit('webrtc_media_toggle', {
            roomId: roomData.roomId,
            isMuted,
            isCameraOff: newCamOff
          });
        }
      }
    }
  };

  // 5. Screen Sharing
  const toggleScreenShare = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });

        screenStreamRef.current = screenStream;
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        // Replace video track in peer connection sender
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenVideoTrack);
        }

        // Display on local video ref as preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        if (socketRef.current && roomData) {
          socketRef.current.emit('webrtc_screen_share_toggle', {
            roomId: roomData.roomId,
            isSharing: true
          });
        }

        // When user stops sharing from native browser bar
        screenVideoTrack.onended = () => {
          stopScreenSharing();
        };
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    } else {
      stopScreenSharing();
    }
  };

  const stopScreenSharing = () => {
    const pc = peerConnectionRef.current;
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    if (localStreamRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      if (pc && cameraTrack) {
        const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(cameraTrack);
        }
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }

    setIsScreenSharing(false);

    if (socketRef.current && roomData) {
      socketRef.current.emit('webrtc_screen_share_toggle', {
        roomId: roomData.roomId,
        isSharing: false
      });
    }
  };

  // 6. Send Chat Message
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !roomData) return;

    socketRef.current.emit('webrtc_chat_message', {
      roomId: roomData.roomId,
      message: newMessage
    });
    setNewMessage('');
  };

  // 7. End Call Flow
  const handleEndCallConfirmed = async () => {
    setShowEndModal(false);

    // Stop streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (socketRef.current && roomData) {
      socketRef.current.emit('webrtc_end_call', {
        roomId: roomData.roomId,
        interviewId: roomData.interviewId,
        reason: 'Call completed by participant'
      });
    }

    // Update status in backend
    if (roomData?.interviewId) {
      await interviewAPI.updateStatus(roomData.interviewId, {
        status: 'completed',
        actualEndTime: new Date()
      }).catch(console.warn);
    }

    handleCallTermination({
      endedByName: user?.name || 'You',
      reason: 'Interview session completed'
    });
  };

  const handleCallTermination = ({ endedByName, reason }) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCompletedSummary({
      endedByName,
      reason,
      durationStr: formatTimer(elapsedSeconds),
      timestamp: new Date().toLocaleTimeString()
    });
    setInterviewCompleted(true);
  };

  const returnToDashboard = () => {
    if (user?.role === 'company') {
      navigate('/company/interviews', { replace: true });
    } else if (user?.role === 'tpo') {
      navigate('/tpo/interviews', { replace: true });
    } else {
      navigate('/student/interviews', { replace: true });
    }
  };

  // ==================== RENDER: LOADING STATE ====================
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          border: '4px solid #1e293b',
          borderTopColor: '#38bdf8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <h2 style={{ marginTop: '20px', fontSize: '18px', fontWeight: 600 }}>
          Authenticating Virtual Interview Session...
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
          Verifying security clearance and configuring WebRTC media channels...
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ==================== RENDER: ACCESS DENIED (403) ====================
  if (authError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          background: '#1e1b2e',
          border: '1px solid #7f1d1d',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px'
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#f87171', margin: '0 0 10px' }}>
            Room Access Denied
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
            {authError}
          </p>
          <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', fontSize: '12px', color: '#94a3b8', marginBottom: '24px', textAlign: 'left' }}>
            🔒 <strong>Strict Security Policy:</strong> Virtual interview rooms are encrypted and reserved exclusively for the scheduled candidate and recruiter. Unauthorized users cannot enter.
          </div>
          <button
            onClick={returnToDashboard}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==================== RENDER: INTERVIEW COMPLETED SUMMARY ====================
  if (interviewCompleted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '18px',
          maxWidth: '560px',
          width: '100%',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle size={38} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px' }}>
            Interview Session Completed
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 28px' }}>
            {completedSummary?.reason || 'The audio/video interview has ended.'}
          </p>

          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: '#94a3b8' }}>Session Title:</span>
              <strong style={{ color: '#f8fafc' }}>{roomData?.title}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: '#94a3b8' }}>Company:</span>
              <strong style={{ color: '#38bdf8' }}>{roomData?.companyName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: '#94a3b8' }}>Candidate:</span>
              <strong style={{ color: '#f8fafc' }}>{roomData?.candidateName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: '#94a3b8' }}>Total Duration:</span>
              <strong style={{ color: '#10b981' }}>⏱️ {completedSummary?.durationStr || '00:00'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
              <span style={{ color: '#94a3b8' }}>Concluded At:</span>
              <strong style={{ color: '#f8fafc' }}>{completedSummary?.timestamp}</strong>
            </div>
          </div>

          <button
            onClick={returnToDashboard}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN VIDEO INTERVIEW INTERFACE ====================
  const remoteDisplayName = remotePeer?.name || (roomData?.userRoleInInterview === 'candidate' ? roomData?.interviewerName : roomData?.candidateName);
  const remoteDisplayRole = remotePeer?.role || (roomData?.userRoleInInterview === 'candidate' ? 'Interviewer' : 'Candidate');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090d16',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* TOP BAR */}
      <header style={{
        height: '64px',
        padding: '0 24px',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20
      }}>
        {/* Left: Interview & Company Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '15px'
          }}>
            {roomData?.companyName?.charAt(0) || 'I'}
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              {roomData?.title}
            </h1>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {roomData?.companyName} • {roomData?.driveTitle || 'Campus Recruitment'}
            </div>
          </div>
        </div>

        {/* Center: Connection Status & Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            background: connectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' :
              connectionStatus === 'waiting' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(234, 179, 8, 0.15)',
            color: connectionStatus === 'connected' ? '#10b981' :
              connectionStatus === 'waiting' ? '#38bdf8' : '#eab308',
            border: `1px solid ${
              connectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' :
              connectionStatus === 'waiting' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(234, 179, 8, 0.3)'
            }`
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'currentColor',
              boxShadow: '0 0 8px currentColor'
            }} />
            <span>
              {connectionStatus === 'connected' && 'P2P Encrypted Call'}
              {connectionStatus === 'waiting' && 'Waiting for Peer'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'reconnecting' && 'Reconnecting...'}
            </span>
          </div>

          {/* Duration Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#f8fafc'
          }}>
            <Clock size={14} color="#38bdf8" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Right: Security & End Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.08)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <ShieldCheck size={14} />
            <span>Verified P2P Room</span>
          </div>

          <button
            onClick={() => setShowEndModal(true)}
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PhoneOff size={14} />
            <span>End Call</span>
          </button>
        </div>
      </header>

      {/* HARDWARE WARNING BANNER (IF ANY) */}
      {hardwareError && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.15)',
          borderBottom: '1px solid rgba(234, 179, 8, 0.3)',
          color: '#fef08a',
          padding: '8px 24px',
          fontSize: '12.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 15
        }}>
          <AlertTriangle size={15} color="#facc15" />
          <span>{hardwareError}</span>
        </div>
      )}

      {/* VIDEO STAGE CONTAINER */}
      <div style={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        padding: '16px 20px 84px',
        gap: '16px'
      }}>
        {/* MAIN VIDEO AREA (REMOTE PARTICIPANT OR WAITING ROOM) */}
        <div style={{
          flex: 1,
          background: '#0f172a',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
        }}>
          {/* WAITING ROOM OVERLAY */}
          {connectionStatus === 'waiting' && (
            <div style={{
              textAlign: 'center',
              padding: '30px',
              maxWidth: '460px'
            }}>
              <div style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '2px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'pulseGlow 2s infinite'
              }}>
                <Users size={38} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px', color: '#f8fafc' }}>
                Waiting Room
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5, margin: '0 0 20px' }}>
                Waiting for <strong>{remoteDisplayName}</strong> to join this encrypted session...
              </p>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '12px',
                color: '#cbd5e1',
                textAlign: 'left'
              }}>
                💡 <strong>Pre-call Check:</strong> Your local video and audio preview are active at the bottom right. Test your microphone and camera before the interview begins.
              </div>
              <style>{`
                @keyframes pulseGlow {
                  0% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
                  70% { box-shadow: 0 0 0 20px rgba(56, 189, 248, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
                }
              `}</style>
            </div>
          )}

          {/* REMOTE VIDEO ELEMENT */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: remoteScreenSharing ? 'contain' : 'cover',
              display: connectionStatus === 'connected' && !remoteCameraOff ? 'block' : 'none'
            }}
          />

          {/* REMOTE CAMERA OFF PLACEHOLDER */}
          {connectionStatus === 'connected' && remoteCameraOff && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 700,
                margin: '0 auto 16px',
                border: '3px solid rgba(56, 189, 248, 0.3)'
              }}>
                {remoteDisplayName?.charAt(0) || 'P'}
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
                {remoteDisplayName}
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                Camera turned off
              </p>
            </div>
          )}

          {/* REMOTE PARTICIPANT LABEL */}
          {connectionStatus === 'connected' && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span>{remoteDisplayName} ({remoteDisplayRole})</span>
              {remoteMuted && <MicOff size={14} color="#ef4444" />}
              {remoteScreenSharing && (
                <span style={{ fontSize: '11px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  Presenting
                </span>
              )}
            </div>
          )}
        </div>

        {/* LOCAL VIDEO PIP TILE (FLOATING PREVIEW) */}
        <div style={{
          position: 'absolute',
          bottom: '100px',
          right: '36px',
          width: '260px',
          height: '165px',
          background: '#1e293b',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '2px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isCameraOff ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#334155',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                margin: '0 auto 6px'
              }}>
                {user?.name?.charAt(0) || 'Y'}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Camera Off</span>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: isScreenSharing ? 'contain' : 'cover',
                transform: isScreenSharing ? 'none' : 'scaleX(-1)' // Mirror local camera view
              }}
            />
          )}

          {/* Local participant badge */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>You ({roomData?.userRoleInInterview === 'candidate' ? 'Candidate' : 'Interviewer'})</span>
            {isMuted && <MicOff size={12} color="#ef4444" />}
          </div>
        </div>

        {/* IN-ROOM CHAT DRAWER */}
        {showChat && (
          <div style={{
            width: '320px',
            background: '#0f172a',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>In-Call Messages</span>
              <button
                onClick={() => setShowChat(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '40px' }}>
                  No messages yet. Send a note, link, or code snippet.
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMine = msg.senderId === user?._id || msg.senderName === user?.name;
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        background: isMine ? '#2563eb' : '#1e293b',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        maxWidth: '85%',
                        fontSize: '12.5px'
                      }}
                    >
                      <div style={{ fontSize: '10px', color: isMine ? '#bfdbfe' : '#94a3b8', marginBottom: '2px' }}>
                        {isMine ? 'You' : msg.senderName}
                      </div>
                      <div style={{ wordBreak: 'break-word', color: '#ffffff' }}>{msg.message}</div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={sendChatMessage} style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS TOOLBAR */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '72px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        zIndex: 20
      }}>
        {/* Mic Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: 'none',
            background: isMuted ? '#ef4444' : '#334155',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          title={isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: 'none',
            background: isCameraOff ? '#ef4444' : '#334155',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: 'none',
            background: isScreenSharing ? '#0284c7' : '#334155',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Monitor size={20} />
        </button>

        {/* Chat Drawer Toggle */}
        <button
          onClick={() => setShowChat((prev) => !prev)}
          title="Toggle In-Call Chat"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: 'none',
            background: showChat ? '#2563eb' : '#334155',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <MessageSquare size={20} />
          {chatMessages.length > 0 && !showChat && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#38bdf8'
            }} />
          )}
        </button>

        {/* End Call Button */}
        <button
          onClick={() => setShowEndModal(true)}
          title="End Interview"
          style={{
            background: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '11px 22px',
            borderRadius: '24px',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '12px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
          }}
        >
          <PhoneOff size={18} />
          <span>Leave Room</span>
        </button>
      </footer>

      {/* END CALL CONFIRMATION MODAL */}
      {showEndModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <PhoneOff size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px' }}>
              End Virtual Interview?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.5, margin: '0 0 24px' }}>
              Are you sure you want to conclude this interview session? This will terminate the peer-to-peer connection and record the session duration.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowEndModal(false)}
                style={{
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Continue Interview
              </button>
              <button
                onClick={handleEndCallConfirmed}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)'
                }}
              >
                Yes, End Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
