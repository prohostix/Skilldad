import {
  Pen, Eraser, Square, Circle, Minus, Type, MousePointer2,
  Trash2, Undo2, Save, X,
} from 'lucide-react';

/**
 * WhiteboardToolbar
 * Floating dark-themed toolbar for the collaborative whiteboard.
 *
 * @param {string}   activeTool       - Currently selected ToolType
 * @param {string}   color            - Active brush/stroke color
 * @param {number}   brushSize        - Active brush size (1–40)
 * @param {boolean}  isHost           - Whether the current user is the host
 * @param {boolean}  canDraw          - Whether the current user can draw
 * @param {function} onToolChange     - (tool: ToolType) => void
 * @param {function} onColorChange    - (color: string) => void
 * @param {function} onBrushSizeChange- (size: number) => void
 * @param {function} onClear         - () => void  (host only)
 * @param {function} onUndo          - () => void
 * @param {function} onSave          - () => void
 * @param {function} onClose         - () => void
 */
const TOOLS = [
  { id: 'pen',       icon: Pen,           label: 'Pen' },
  { id: 'eraser',    icon: Eraser,        label: 'Eraser' },
  { id: 'rectangle', icon: Square,        label: 'Rectangle' },
  { id: 'circle',    icon: Circle,        label: 'Circle' },
  { id: 'line',      icon: Minus,         label: 'Line' },
  { id: 'text',      icon: Type,          label: 'Text' },
  { id: 'select',    icon: MousePointer2, label: 'Select' },
];

const WhiteboardToolbar = ({
  activeTool, color, brushSize, isHost, canDraw,
  onToolChange, onColorChange, onBrushSizeChange,
  onClear, onUndo, onSave, onClose,
}) => {
  const disabled = !canDraw;

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(20,20,30,0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 40,
      padding: '8px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      zIndex: 100000,
      userSelect: 'none',
    }}>
      {/* Tool buttons */}
      {TOOLS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          title={label}
          disabled={disabled}
          onClick={() => !disabled && onToolChange(id)}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
            background: activeTool === id ? 'rgba(99,102,241,0.35)' : 'transparent',
            color: disabled ? 'rgba(255,255,255,0.25)' : activeTool === id ? '#818cf8' : 'rgba(255,255,255,0.7)',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          <Icon size={18} />
        </button>
      ))}

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

      {/* Color picker */}
      <label title="Color" style={{ position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: color,
          border: '2px solid rgba(255,255,255,0.3)',
          opacity: disabled ? 0.3 : 1,
        }} />
        <input
          type="color"
          value={color}
          disabled={disabled}
          onChange={e => onColorChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        />
      </label>

      {/* Brush size */}
      <input
        type="range"
        min={1} max={40}
        value={brushSize}
        disabled={disabled}
        onChange={e => onBrushSizeChange(Number(e.target.value))}
        title={`Brush size: ${brushSize}`}
        style={{ width: 72, accentColor: '#818cf8', opacity: disabled ? 0.3 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
      {/* Brush size preview dot */}
      <div style={{
        width: Math.max(4, Math.min(brushSize / 2, 20)),
        height: Math.max(4, Math.min(brushSize / 2, 20)),
        borderRadius: '50%',
        background: disabled ? 'rgba(255,255,255,0.15)' : color,
        flexShrink: 0,
        transition: 'width 0.1s, height 0.1s',
      }} />

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

      {/* Undo */}
      <button
        title="Undo"
        disabled={disabled}
        onClick={() => !disabled && onUndo()}
        style={actionBtnStyle(disabled)}
      >
        <Undo2 size={18} />
      </button>

      {/* Clear — host only */}
      {isHost && (
        <button
          title="Clear board"
          onClick={onClear}
          style={actionBtnStyle(false, '#ef4444')}
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* Save */}
      <button
        title="Save whiteboard"
        onClick={onSave}
        style={actionBtnStyle(false, '#22c55e')}
      >
        <Save size={18} />
      </button>

      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

      {/* View-only badge */}
      {disabled && (
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
          color: 'rgba(255,255,255,0.4)',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4, padding: '2px 8px',
          whiteSpace: 'nowrap',
        }}>
          View Only
        </span>
      )}

      {/* Close */}
      <button
        title="Close whiteboard"
        onClick={onClose}
        style={actionBtnStyle(false)}
      >
        <X size={18} />
      </button>
    </div>
  );
};

const actionBtnStyle = (disabled, hoverColor) => ({
  width: 36, height: 36,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 8, border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: 'transparent',
  color: disabled ? 'rgba(255,255,255,0.25)' : hoverColor || 'rgba(255,255,255,0.7)',
  transition: 'background 0.15s, color 0.15s',
});

export default WhiteboardToolbar;
