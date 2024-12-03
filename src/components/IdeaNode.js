import React, { useState, memo, useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { suggestCompletion } from '../utils/aiHandler';

const IdeaNode = ({ data, id, isConnectable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0 });
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyPress = (evt) => {
    if (evt.key === 'Enter') {
      if (suggestion) {
        setLabel(prev => prev + ' ' + suggestion);
        setSuggestion('');
      }
      setIsEditing(false);
      data.label = label;
    } else if (evt.key === 'Tab' && suggestion) {
      evt.preventDefault();
      setLabel(prev => prev + ' ' + suggestion);
      setSuggestion('');
    }
  };

  const handleChange = useCallback(async (e) => {
    const newText = e.target.value;
    setLabel(newText);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(async () => {
      try {
        const result = await suggestCompletion(newText);
        if (result.success) {
          setSuggestion(result.completion);
        } else {
          setSuggestion('');
        }
      } catch (error) {
        console.error('Error getting suggestion:', error);
        setSuggestion('');
      }
    }, 500);

    setTypingTimeout(newTimeout);
  }, [typingTimeout]);

  const handleBlur = () => {
    setIsEditing(false);
    data.label = label;
  };

  const handleAddNewIdea = (e) => {
    e.stopPropagation();
    const position = { x: contextMenu.x, y: contextMenu.y };
    data.onAddNewIdea && data.onAddNewIdea(position);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleEditIdea = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleDeleteIdea = (e) => {
    e.stopPropagation();
    data.onDelete && data.onDelete(id);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleSuggestNext = async () => {
    try {
      setIsLoading(true);
      if (data.onSuggestNext) {
        await data.onSuggestNext(id);
      }
    } catch (error) {
      console.error('Error in handleSuggestNext:', error);
      alert('حدث خطأ أثناء اقتراح الفكرة التالية');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div 
        onContextMenu={handleContextMenu}
        className="idea-node"
        style={{ position: 'relative' }}
      >
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            autoFocus
          />
        ) : (
          <div className="idea-content" onDoubleClick={handleDoubleClick}>
            <div>{label}</div>
            {suggestion && <div className="suggestion">{suggestion}</div>}
            {isLoading && <div className="loading-indicator">جاري التحميل...</div>}
          </div>
        )}
        {contextMenu.visible && (
          <div 
            className="context-menu"
            style={{
              position: 'absolute',
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              zIndex: 1000
            }}
            onClick={e => e.stopPropagation()}
          >
            <div onClick={handleAddNewIdea} className="menu-item">إضافة فكرة جديدة</div>
            <div onClick={handleEditIdea} className="menu-item">تحرير</div>
            <div onClick={handleDeleteIdea} className="menu-item">حذف</div>
          </div>
        )}
      </div>
      <div className="node-buttons">
        <button 
          onClick={handleSuggestNext}
          disabled={isLoading}
          style={{
            background: isLoading ? '#ccc' : '#4a90e2',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '12px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginTop: '5px',
            width: '100%'
          }}
        >
          {isLoading ? 'جاري الاقتراح...' : 'اقتراح فكرة تالية'}
        </button>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </>
  );
};

export default memo(IdeaNode);
