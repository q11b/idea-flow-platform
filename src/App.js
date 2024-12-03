import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges, 
  Background, 
  Controls, 
  MiniMap 
} from 'reactflow';
import 'reactflow/dist/style.css';
import IdeaNode from './components/IdeaNode';
import LoadingState from './components/LoadingState';
import { saveToJson, loadFromJson, deleteSavedIdea, undoDelete } from './utils/jsonHandler';
import { analyzeIdeas, suggestNextIdea } from './utils/aiHandler';

const nodeTypes = {
  ideaNode: IdeaNode,
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showSavedIdeas, setShowSavedIdeas] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [lastSaveTimeout, setLastSaveTimeout] = useState(null);
  
  // حالات التحميل والأخطاء
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // إظهار رسالة نجاح لمدة محددة
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // تنظيف الأخطاء
  const clearError = () => setError(null);

  useEffect(() => {
    loadSavedIdeas();
  }, []);

  useEffect(() => {
    if (lastSaveTimeout) {
      clearTimeout(lastSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      if (nodes.length > 0) {
        try {
          setIsLoading(true);
          const result = await saveToJson(nodes, edges);
          if (result.success) {
            await loadSavedIdeas();
            if (result.warning) {
              console.warn(result.warning);
            }
          } else {
            setError(result.error);
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    }, 2000);

    setLastSaveTimeout(timeout);

    return () => {
      if (lastSaveTimeout) {
        clearTimeout(lastSaveTimeout);
      }
    };
  }, [nodes, edges]);

  const loadSavedIdeas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ideas = await loadFromJson();
      setSavedIdeas(ideas);
    } catch (error) {
      setError(`خطأ في تحميل الأفكار: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdeas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await saveToJson(nodes, edges);
      if (result.success) {
        showSuccessMessage('تم حفظ الأفكار بنجاح');
        await loadSavedIdeas();
        if (result.warning) {
          console.warn(result.warning);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(`خطأ في حفظ الأفكار: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIdea = async (index) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المجموعة من الأفكار؟')) {
      try {
        setIsLoading(true);
        setError(null);
        const result = await deleteSavedIdea(index);
        if (result.success) {
          showSuccessMessage('تم حذف المجموعة بنجاح');
          await loadSavedIdeas();
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError(`خطأ في حذف الأفكار: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUndoDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await undoDelete();
      if (result.success) {
        showSuccessMessage('تم استعادة آخر مجموعة محذوفة');
        await loadSavedIdeas();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(`خطأ في استعادة الأفكار: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSavedIdeas = () => {
    setShowSavedIdeas(!showSavedIdeas);
  };

  const loadIdeaSet = (ideaSet) => {
    if (ideaSet && ideaSet.nodes && ideaSet.edges) {
      setNodes(ideaSet.nodes);
      setEdges(ideaSet.edges);
      setShowSavedIdeas(false);
    }
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const addNewIdea = useCallback((position, initialText = 'فكرة جديدة') => {
    const newNodeId = `node_${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'ideaNode',
      position,
      data: { 
        label: initialText,
        onAddNewIdea: addNewIdea,
        onDelete: deleteIdea,
        onSuggestNext: async (nodeId) => {
          try {
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
              const result = await suggestNextIdea(node.data.label);
              if (result.success) {
                const newPosition = {
                  x: node.position.x + 200,
                  y: node.position.y
                };
                const newNode = addNewIdea(newPosition, result.suggestion);
                setEdges((eds) => [...eds, {
                  id: `edge_${Date.now()}`,
                  source: nodeId,
                  target: newNode.id
                }]);
              }
            }
          } catch (error) {
            console.error('Error suggesting next idea:', error);
            alert('حدث خطأ أثناء اقتراح الفكرة التالية');
          }
        }
      }
    };
    setNodes((nds) => [...nds, newNode]);
    return newNode;
  }, [nodes]);

  const deleteIdea = useCallback((nodeId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفكرة؟')) {
      setNodes((nds) => nds.filter(node => node.id !== nodeId));
      setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    }
  }, []);

  const onPaneClick = useCallback(() => {
  }, []);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    const position = {
      x: event.clientX,
      y: event.clientY
    };
    addNewIdea(position);
  }, [addNewIdea]);

  const analyzeCurrentIdeas = useCallback(async () => {
    try {
      const ideas = nodes.map(node => node.data.label);
      if (ideas.length === 0) {
        alert('الرجاء إضافة بعض الأفكار أولاً');
        return;
      }

      const result = await analyzeIdeas(ideas);
      if (result.success) {
        const analysisNode = {
          id: `analysis_${Date.now()}`,
          type: 'ideaNode',
          position: { x: 100, y: 100 },
          data: { label: result.analysis },
        };
        setNodes((nds) => [...nds, analysisNode]);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('حدث خطأ أثناء تحليل الأفكار');
      console.error(error);
    }
  }, [nodes]);

  return (
    <div className="app-container">
      <LoadingState isLoading={isLoading} error={error}>
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        
        <div className="toolbar">
          <button onClick={handleSaveIdeas} className="save-button" disabled={isLoading}>
            حفظ الأفكار
          </button>
          <button onClick={handleUndoDelete} className="undo-button" disabled={isLoading}>
            تراجع عن الحذف
          </button>
          {error && (
            <button onClick={clearError} className="clear-error-button">
              ✕
            </button>
          )}
        </div>

        <button 
          className="toggle-saved-ideas"
          onClick={toggleSavedIdeas}
          title="عرض الأفكار المحفوظة"
        >
          <span className="arrow-icon">&#8594;</span>
        </button>

        {showSavedIdeas && (
          <div className="saved-ideas-panel">
            <h3>الأفكار المحفوظة</h3>
            <div className="saved-ideas-list">
              {savedIdeas.length === 0 ? (
                <div className="no-ideas">لا توجد أفكار محفوظة</div>
              ) : (
                savedIdeas.map((ideaSet, index) => (
                  <div 
                    key={index} 
                    className="saved-idea-item"
                  >
                    <div className="idea-content" onClick={() => loadIdeaSet(ideaSet)}>
                      <span className="idea-title">
                        {ideaSet.title}
                      </span>
                      <span className="idea-date">
                        {new Date(ideaSet.savedAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <button 
                      className="delete-idea"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIdea(index);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        <div className="controls">
          <button onClick={analyzeCurrentIdeas}>تحليل الأفكار</button>
        </div>
      </LoadingState>
    </div>
  );
}

export default App;
