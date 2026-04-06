import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Canvas, Rect, Circle, Line, IText, 
  PencilBrush, util 
} from 'fabric';
import axios from 'axios';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../context/SocketContext';
import WhiteboardToolbar from './WhiteboardToolbar';

/**
 * Whiteboard
 * Real-time collaborative whiteboard overlay above the Zoom meeting.
 *
 * @param {string}   sessionId  - Live session ID
 * @param {boolean}  isHost     - Whether the current user is the host
 * @param {boolean}  canDraw    - Whether the current user can draw
 * @param {function} onClose    - Callback to close the whiteboard
 */

const TOOLBAR_HEIGHT = 80;
const STROKE_FIELDS  = ['id','type','path','stroke','fill','strokeWidth','left','top','scaleX','scaleY'];

function getCurrentUserId() {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return info._id || info.id || null;
  } catch { return null; }
}

const Whiteboard = ({ sessionId, isHost, canDraw, onClose }) => {
  const canvasElRef  = useRef(null);
  const fabricRef    = useRef(null);
  const strokesRef   = useRef([]);   // [{ id, userId, obj }]
  const isRemoteRef  = useRef(false); // suppress emit for remote-applied objects

  const [initError,    setInitError]    = useState(false);
  const [activeTool,   setActiveTool]   = useState('pen');
  const [color,        setColor]        = useState('#ffffff');
  const [brushSize,    setBrushSize]    = useState(4);
  const [localCanDraw, setLocalCanDraw] = useState(canDraw);

  const { socket }    = useSocket();
  const currentUserId = getCurrentUserId();

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const applyPermissions = useCallback((tool, draw) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const effective = isHost ? true : draw;
    if (!effective) {
      canvas.isDrawingMode = false;
      canvas.selection     = false;
    } else {
      canvas.isDrawingMode = tool === 'pen' || tool === 'eraser';
      canvas.selection     = tool === 'select';
    }
  }, [isHost]);

  // ── Task 3.1: Initialize Fabric.js canvas on mount ───────────────────────────

  useEffect(() => {
    if (!canvasElRef.current) {
      setInitError(true);
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight - TOOLBAR_HEIGHT;

    const canvas = new Canvas(canvasElRef.current, {
      isDrawingMode: false,
      selection:     canDraw,
      width:  w,
      height: h,
      backgroundColor: '#1a1a2e',
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = '#ffffff';
    canvas.freeDrawingBrush.width = 4;

    fabricRef.current = canvas;

    // ── Task 3.2: Emit whiteboard:join on mount ──────────────────────────────
    if (socket) socket.emit('whiteboard:join', { sessionId });

    return () => {
      // ── Task 3.2: Emit whiteboard:leave on unmount ───────────────────────
      if (socket) socket.emit('whiteboard:leave', { sessionId });
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Task 4: Tool selection wired to canvas ───────────────────────────────────

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    const effective = isHost ? true : localCanDraw;
    console.log('[Whiteboard] apply-permissions:', { activeTool, isHost, localCanDraw, effective });

    if (!effective) {
      canvas.isDrawingMode = false;
      canvas.selection     = false;
      canvas.requestRenderAll();
      return;
    }

    if (activeTool === 'pen') {
      canvas.isDrawingMode = true;
      canvas.selection     = false;
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = brushSize;

    } else if (activeTool === 'eraser') {
      canvas.isDrawingMode = true;
      canvas.selection     = false;
      // Note: EraserBrush often requires separate import or package in v7.
      // Defaulting to pen with background color if not available.
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = '#1a1a2e';
      canvas.freeDrawingBrush.width = brushSize;

    } else if (activeTool === 'select') {
      canvas.isDrawingMode = false;
      canvas.selection     = true;

    } else if (activeTool === 'text') {
      canvas.isDrawingMode = false;
      canvas.selection     = false;
      canvas.on('mouse:down', (opt) => {
        const p = canvas.getScenePoint(opt.e);
        const text = new IText('Type here', {
          left: p.x, top: p.y,
          fill: color, fontSize: Math.max(12, brushSize * 4),
          selectable: true,
        });
        isRemoteRef.current = false;
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        canvas.requestRenderAll();
      });

    } else if (['rectangle', 'circle', 'line'].includes(activeTool)) {
      canvas.isDrawingMode = false;
      canvas.selection     = false;

      let isDown = false, origX = 0, origY = 0, activeShape = null;

      canvas.on('mouse:down', (opt) => {
        isDown = true;
        const p = canvas.getScenePoint(opt.e);
        origX = p.x; origY = p.y;

        if (activeTool === 'rectangle') {
          activeShape = new Rect({
            left: origX, top: origY, width: 0, height: 0,
            stroke: color, strokeWidth: brushSize, fill: 'transparent', selectable: false,
          });
        } else if (activeTool === 'circle') {
          activeShape = new Circle({
            left: origX, top: origY, radius: 0,
            stroke: color, strokeWidth: brushSize, fill: 'transparent', selectable: false,
          });
        } else if (activeTool === 'line') {
          activeShape = new Line([origX, origY, origX, origY], {
            stroke: color, strokeWidth: brushSize, selectable: false,
          });
        }

        if (activeShape) {
          isRemoteRef.current = true; // suppress object:added emit during draw
          canvas.add(activeShape);
        }
      });

      canvas.on('mouse:move', (opt) => {
        if (!isDown || !activeShape) return;
        const p = canvas.getScenePoint(opt.e);
        if (activeTool === 'rectangle') {
          activeShape.set({
            left: Math.min(p.x, origX), top: Math.min(p.y, origY),
            width: Math.abs(p.x - origX), height: Math.abs(p.y - origY),
          });
        } else if (activeTool === 'circle') {
          const r = Math.sqrt(Math.pow(p.x - origX, 2) + Math.pow(p.y - origY, 2)) / 2;
          activeShape.set({ left: Math.min(p.x, origX), top: Math.min(p.y, origY), radius: r });
        } else if (activeTool === 'line') {
          activeShape.set({ x2: p.x, y2: p.y });
        }
        canvas.requestRenderAll();
      });

      canvas.on('mouse:up', () => {
        if (!activeShape) return;
        isDown = false;
        activeShape.setCoords();
        activeShape.selectable = true;
        isRemoteRef.current = false;
        emitStroke(activeShape);
        activeShape = null;
      });
    }
    
    canvas.requestRenderAll();
  }, [activeTool, color, brushSize, localCanDraw, isHost]);

  // Sync brush color/size when they change in pen mode
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas?.freeDrawingBrush) return;
    if (activeTool === 'pen') {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = brushSize;
    } else if (activeTool === 'eraser') {
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [color, brushSize, activeTool]);

  // ── Task 5.1: Emit stroke on path:created ────────────────────────────────────

  const emitStroke = useCallback((fabricObj) => {
    if (!socket) return;
    const effective = isHost ? true : localCanDraw;
    if (!effective) return;
    const serialized    = fabricObj.toObject(STROKE_FIELDS);
    serialized.id       = uuidv4();
    serialized.userId   = currentUserId;
    strokesRef.current.push({ id: serialized.id, userId: currentUserId, obj: fabricObj });
    socket.emit('whiteboard:stroke', { sessionId, stroke: serialized, userId: currentUserId });
  }, [socket, sessionId, currentUserId, isHost, localCanDraw]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const onPathCreated = (opt) => {
      if (isRemoteRef.current) return;
      emitStroke(opt.path);
    };
    canvas.on('path:created', onPathCreated);
    return () => canvas.off('path:created', onPathCreated);
  }, [emitStroke]);

  // ── Task 5.2: Receive remote strokes ─────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;
    const onRemoteStroke = async ({ stroke, userId }) => {
      if (userId === currentUserId) return; // echo prevention
      const canvas = fabricRef.current;
      if (!canvas) return;
      try {
        const objects = await util.enlivenObjects([stroke]);
        isRemoteRef.current = true;
        objects.forEach(obj => {
          canvas.add(obj);
          strokesRef.current.push({ id: stroke.id, userId, obj });
        });
        isRemoteRef.current = false;
        canvas.requestRenderAll();
      } catch (err) {
        console.error('[Whiteboard] Remote stroke error:', err);
      }
    };
    socket.on('whiteboard:stroke', onRemoteStroke);
    return () => socket.off('whiteboard:stroke', onRemoteStroke);
  }, [socket, currentUserId]);

  // ── Task 6: State replay on join ─────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;
    const onState = async ({ strokes, permissions }) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.clear();
      strokesRef.current = [];
      if (strokes?.length) {
        try {
          const objects = await util.enlivenObjects(strokes);
          isRemoteRef.current = true;
          objects.forEach((obj, i) => {
            canvas.add(obj);
            strokesRef.current.push({ id: strokes[i]?.id || uuidv4(), userId: strokes[i]?.userId || null, obj });
          });
          isRemoteRef.current = false;
        } catch (err) {
          console.error('[Whiteboard] State replay error:', err);
        }
      }
      canvas.renderAll();
      if (permissions) {
        const draw = isHost ? true : permissions.canStudentsDraw !== false;
        setLocalCanDraw(draw);
        applyPermissions(activeTool, draw);
      }
    };
    socket.on('whiteboard:state', onState);
    return () => socket.off('whiteboard:state', onState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isHost]);

  // ── Task 7: Undo ─────────────────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    if (!socket) return;
    socket.emit('whiteboard:undo', { sessionId, userId: currentUserId });
    const canvas = fabricRef.current;
    if (!canvas) return;
    const mine = strokesRef.current.filter(s => s.userId === currentUserId);
    if (!mine.length) return;
    const last = mine[mine.length - 1];
    canvas.remove(last.obj);
    strokesRef.current = strokesRef.current.filter(s => s !== last);
    canvas.renderAll();
  }, [socket, sessionId, currentUserId]);

  useEffect(() => {
    if (!socket) return;
    const onUndo = ({ userId }) => {
      if (userId === currentUserId) return;
      const canvas = fabricRef.current;
      if (!canvas) return;
      const userStrokes = strokesRef.current.filter(s => s.userId === userId);
      if (!userStrokes.length) return;
      const last = userStrokes[userStrokes.length - 1];
      canvas.remove(last.obj);
      strokesRef.current = strokesRef.current.filter(s => s !== last);
      canvas.renderAll();
    };
    socket.on('whiteboard:undo', onUndo);
    return () => socket.off('whiteboard:undo', onUndo);
  }, [socket, currentUserId]);

  // ── Task 7: Clear ────────────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    if (!isHost || !socket) return;
    socket.emit('whiteboard:clear', { sessionId });
  }, [isHost, socket, sessionId]);

  useEffect(() => {
    if (!socket) return;
    const onClear = () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.clear();
      strokesRef.current = [];
      canvas.renderAll();
    };
    socket.on('whiteboard:clear', onClear);
    return () => socket.off('whiteboard:clear', onClear);
  }, [socket]);

  // ── Task 7: Permission events ────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;
    const onPermission = ({ canStudentsDraw }) => {
      if (isHost) return;
      const draw = canStudentsDraw !== false;
      setLocalCanDraw(draw);
      applyPermissions(activeTool, draw);
    };
    socket.on('whiteboard:permission', onPermission);
    return () => socket.off('whiteboard:permission', onPermission);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isHost, activeTool]);

  // ── Task 16: Reconnection Resilience ─────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => {
      console.log('[Whiteboard] Reconnected to server, re-syncing state...');
      socket.emit('whiteboard:join', { sessionId });
    };
    socket.on('connect', onConnect);
    return () => socket.off('connect', onConnect);
  }, [socket, sessionId]);

  // ── Task 9: Save snapshot ────────────────────────────────────────────────────

  const saveWhiteboard = useCallback(async (format = 'png') => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    try {
      let payload;
      if (format === 'png') {
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
        payload = { format: 'png', data: dataUrl.split(',')[1] };
      } else {
        payload = { format: 'json', data: JSON.stringify(canvas.toJSON()) };
      }
      await axios.post(`/api/sessions/${sessionId}/whiteboard/save`, payload);
      toast.success('Whiteboard saved');
    } catch (err) {
      console.error('[Whiteboard] Save failed:', err);
      toast.error('Failed to save whiteboard');
    }
  }, [sessionId]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      pointerEvents: 'auto', // Ensure overlay catches all events
    }}>
      {initError ? (
        <div style={{ color: '#f87171', textAlign: 'center', padding: 32, marginTop: 80 }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Whiteboard failed to initialize.</p>
          <button onClick={onClose} style={{
            marginTop: 16, padding: '8px 20px',
            background: '#374151', color: '#fff',
            border: 'none', borderRadius: 6, cursor: 'pointer',
          }}>
            Close
          </button>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas ref={canvasElRef} style={{ background: '#1a1a2e', display: 'block' }} />
          </div>
          <WhiteboardToolbar
            activeTool={activeTool}
            color={color}
            brushSize={brushSize}
            isHost={isHost}
            canDraw={localCanDraw}
            onToolChange={setActiveTool}
            onColorChange={setColor}
            onBrushSizeChange={setBrushSize}
            onClear={handleClear}
            onUndo={handleUndo}
            onSave={() => saveWhiteboard('png')}
            onClose={onClose}
          />
        </>
      )}
    </div>
  );
};

export default Whiteboard;
