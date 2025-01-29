import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Node from './Node';
import CodeDisplay from './CodeDisplay';
import '../styles/LinkedListVisualizer.css';
import { useSpring, animated } from '@react-spring/web';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const LinkedListVisualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [listType, setListType] = useState('singly');
  const [inputArray, setInputArray] = useState('');
  const [operation, setOperation] = useState('no_operation');
  const [operationValue, setOperationValue] = useState('');
  const [operationPosition, setOperationPosition] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('cpp');
  const listContainerRef = useRef(null);
  const [searchedValue, setSearchedValue] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [draggedNodeIndex, setDraggedNodeIndex] = useState(null);
  const [dragOverNodeIndex, setDragOverNodeIndex] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [nodeOrder, setNodeOrder] = useState([]);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [originalOrder, setOriginalOrder] = useState([]);
  const [nodePositions, setNodePositions] = useState({});

  const operations = {
    singly: [
      { value: 'no_operation', label: 'No Operation' },
      { value: 'insert_start', label: 'Insert at Start' },
      { value: 'insert_end', label: 'Insert at End' },
      { value: 'insert_at', label: 'Insert at Position' },
      { value: 'delete_start', label: 'Delete from Start' },
      { value: 'delete_end', label: 'Delete from End' },
      { value: 'delete_at', label: 'Delete at Position' },
      { value: 'search', label: 'Search Element' }
    ],
    doubly: [
      { value: 'no_operation', label: 'No Operation' },
      { value: 'insert_start', label: 'Insert at Start' },
      { value: 'insert_end', label: 'Insert at End' },
      { value: 'insert_at', label: 'Insert at Position' },
      { value: 'delete_start', label: 'Delete from Start' },
      { value: 'delete_end', label: 'Delete from End' },
      { value: 'delete_at', label: 'Delete at Position' },
      { value: 'search', label: 'Search Element' }
    ],
    circular: [
      { value: 'no_operation', label: 'No Operation' },
      { value: 'insert_start', label: 'Insert at Start' },
      { value: 'insert_end', label: 'Insert at End' },
      { value: 'insert_at', label: 'Insert at Position' },
      { value: 'delete_start', label: 'Delete from Start' },
      { value: 'delete_end', label: 'Delete from End' },
      { value: 'delete_at', label: 'Delete at Position' },
      { value: 'search', label: 'Search Element' }
    ]
  };

  // Real-time list creation
  useEffect(() => {
    const createListFromInput = () => {
      try {
        if (!inputArray.trim()) {
          setNodes([]);
          setOriginalOrder([]);
          return;
        }

        const array = inputArray.split(',')
          .map(num => num.trim())
          .filter(num => num !== '')
          .map(num => {
            const parsed = parseInt(num);
            if (isNaN(parsed)) {
              throw new Error('Invalid input');
            }
            return parsed;
          });

        // Create nodes with proper connections
        const newNodes = array.map((value, index) => ({
          value,
          next: index < array.length - 1 ? array[index + 1] : (listType === 'circular' ? array[0] : null),
          prev: listType === 'doubly' ? (index > 0 ? array[index - 1] : null) : null
        }));

        setNodes(newNodes);
        setOriginalOrder([...array]); // Store original order
        setError('');
      } catch (error) {
        setError('Please enter valid numbers separated by commas');
      }
    };

    // Debounce the list creation to avoid too frequent updates
    const timeoutId = setTimeout(createListFromInput, 300);
    return () => clearTimeout(timeoutId);
  }, [inputArray, listType]);

  // Update connections when list type changes
  useEffect(() => {
    if (nodes.length === 0) return;

    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      next: index < nodes.length - 1 ? nodes[index + 1].value : (listType === 'circular' ? nodes[0].value : null),
      prev: listType === 'doubly' ? (index > 0 ? nodes[index - 1].value : null) : null
    }));

    setNodes(updatedNodes);
  }, [listType]);

  const handleArrayInput = (e) => {
    setInputArray(e.target.value);
    setShowWelcome(false);
  };

  const calculateNodePosition = (index, total) => {
    if (listType !== 'circular' || total <= 1) return { x: 0, y: 0 };
    
    // Calculate positions in a perfect circle
    const radius = Math.min(200, Math.max(150, total * 40));
    const angle = (2 * Math.PI * index) / total - Math.PI / 2; // Start from top
    
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  };

  const calculateCircularPath = (start, end, isLastToFirst = false) => {
    if (!start || !end) return '';
    
    if (isLastToFirst) {
      // Calculate control points for a smooth curve
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate midpoint with an offset for the curve
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      
      // Add curve offset based on distance
      const curveOffset = distance * 0.2;
      const controlX = midX;
      const controlY = midY - curveOffset;
      
      return `M ${start.x},${start.y} Q ${controlX},${controlY} ${end.x},${end.y}`;
    }
    
    return `M ${start.x},${start.y} L ${end.x},${end.y}`;
  };

  const handleDragStart = (index) => {
    if (operation === 'no_operation') {
      setDraggedNodeIndex(index);
    }
  };

  const handleDragOver = (index) => {
    if (operation === 'no_operation' && draggedNodeIndex !== null && draggedNodeIndex !== index) {
      setDragOverNodeIndex(index);
    }
  };

  const handleDragEnd = (event, info, sourceIndex) => {
    if (!info || !info.point) return;
    if (listType === 'circular' || operation !== 'no_operation') return;

    const container = document.querySelector('.nodes-container');
    const nodeElements = Array.from(container.querySelectorAll('.node-wrapper'));
    const sourceRect = nodeElements[sourceIndex].getBoundingClientRect();
    
    const dragPoint = { x: info.point.x, y: info.point.y };
    let targetIndex = -1;
    let minDistance = Infinity;
    
    nodeElements.forEach((node, index) => {
      if (index !== sourceIndex) {
        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
          Math.pow(dragPoint.x - centerX, 2) + 
          Math.pow(dragPoint.y - centerY, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          targetIndex = index;
        }
      }
    });

    if (targetIndex !== -1 && minDistance < sourceRect.width) {
      const newNodes = [...nodes];
      [newNodes[sourceIndex], newNodes[targetIndex]] = 
      [newNodes[targetIndex], newNodes[sourceIndex]];
      
      const updatedNodes = newNodes.map((node, index) => ({
        ...node,
        next: index < newNodes.length - 1 ? newNodes[index + 1].value : null,
        prev: listType === 'doubly' ? (index > 0 ? newNodes[index - 1].value : null) : null
      }));
      
      setNodes(updatedNodes);
      
      // Update node order after swap
      const newOrder = [...nodeOrder];
      [newOrder[sourceIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[sourceIndex]];
      setNodeOrder(newOrder);
    }
    
    setDraggedNodeIndex(null);
    setDragOverNodeIndex(null);
  };

  const insertAtStart = (value) => {
    const newNode = {
      value,
      next: nodes.length > 0 ? nodes[0].value : null,
      prev: listType === 'doubly' ? null : undefined
    };

    const updatedNodes = [newNode, ...nodes].map((node, index) => ({
      ...node,
      next: index < nodes.length ? nodes[index].value : (listType === 'circular' ? newNode.value : null),
      prev: listType === 'doubly' ? (index > 0 ? nodes[index - 1].value : null) : undefined
    }));

    setNodes(updatedNodes);
    setOperation('insert_start');
  };

  const insertAtEnd = (value) => {
    const newNode = {
      value,
      next: listType === 'circular' ? nodes[0]?.value || null : null,
      prev: listType === 'doubly' ? (nodes.length > 0 ? nodes[nodes.length - 1].value : null) : undefined
    };

    const updatedNodes = [...nodes, newNode].map((node, index, array) => ({
      ...node,
      next: index < array.length - 1 ? array[index + 1].value : (listType === 'circular' ? array[0].value : null),
      prev: listType === 'doubly' ? (index > 0 ? array[index - 1].value : null) : undefined
    }));

    setNodes(updatedNodes);
    setOperation('insert_end');
  };

  const insertAtPosition = (value, position) => {
    const newNode = {
      value,
      next: nodes[position]?.value || null,
      prev: listType === 'doubly' ? (position > 0 ? nodes[position - 1].value : null) : undefined
    };

    const updatedNodes = [
      ...nodes.slice(0, position),
      newNode,
      ...nodes.slice(position)
    ].map((node, index, array) => ({
      ...node,
      next: index < array.length - 1 ? array[index + 1].value : (listType === 'circular' ? array[0].value : null),
      prev: listType === 'doubly' ? (index > 0 ? array[index - 1].value : null) : undefined
    }));

    setNodes(updatedNodes);
    setOperation('insert_at');
  };

  const deleteFromStart = () => {
    if (nodes.length === 0) return;

    const updatedNodes = nodes.slice(1).map((node, index, array) => ({
      ...node,
      next: index < array.length - 1 ? array[index + 1].value : (listType === 'circular' ? array[0].value : null),
      prev: listType === 'doubly' ? (index > 0 ? array[index - 1].value : null) : undefined
    }));

    setNodes(updatedNodes);
    setOperation('delete_start');
  };

  const deleteFromEnd = () => {
    if (nodes.length === 0) return;

    const updatedNodes = nodes.slice(0, -1).map((node, index, array) => ({
      ...node,
      next: index < array.length - 1 ? array[index + 1].value : (listType === 'circular' ? array[0].value : null),
      prev: listType === 'doubly' ? (index > 0 ? array[index - 1].value : null) : undefined
    }));

    setNodes(updatedNodes);
    setOperation('delete_end');
  };

  const deleteAtPosition = (position) => {
    if (position < 0 || position >= nodes.length) return;

    const updatedNodes = [
      ...nodes.slice(0, position),
      ...nodes.slice(position + 1)
    ].map((node, index, array) => ({
      ...node,
      next: index < array.length - 1 ? array[index + 1].value : (listType === 'circular' ? array[0].value : null),
      prev: listType === 'doubly' ? (index > 0 ? array[index - 1].value : null) : undefined
    }));

    setNodes(updatedNodes);
    setOperation('delete_at');
  };

  const searchNode = (value) => {
    const found = nodes.some(node => node.value === value);
    setSearchedValue(found ? value : null);
    setPrompt(found ? `Found ${value} in the list` : `${value} not found in the list`);
    setOperation('search');
  };

  const handleOperation = () => {
    if (!operationValue && !operation.startsWith('delete')) {
      setError('Please enter a value');
      return;
    }

    const value = parseInt(operationValue);
    if (!operation.startsWith('delete') && isNaN(value)) {
      setError('Please enter a valid number');
      return;
    }

    switch (operation) {
      case 'insert_start':
        insertAtStart(value);
        setPrompt(`Inserted ${value} at the start of the list`);
        break;
      case 'insert_end':
        insertAtEnd(value);
        setPrompt(`Inserted ${value} at the end of the list`);
        break;
      case 'insert_at':
        if (operationPosition < 0 || operationPosition > nodes.length) {
          setError('Invalid position');
          return;
        }
        insertAtPosition(value, operationPosition);
        setPrompt(`Inserted ${value} at position ${operationPosition}`);
        break;
      case 'delete_start':
        deleteFromStart();
        setPrompt('Deleted node from the start');
        break;
      case 'delete_end':
        deleteFromEnd();
        setPrompt('Deleted node from the end');
        break;
      case 'delete_at':
        if (operationPosition < 0 || operationPosition >= nodes.length) {
          setError('Invalid position');
          return;
        }
        deleteAtPosition(operationPosition);
        setPrompt(`Deleted node at position ${operationPosition}`);
        break;
      case 'search':
        searchNode(value);
        break;
      default:
        break;
    }

    if (operation !== 'search') {
      setSearchedValue(null);
    }

    setOperationValue('');
    setOperationPosition(0);
    setError('');
  };

  const getOperationCode = (operation, value, position = null) => {
    switch (operation) {
      case 'insert_start':
        return `list.insertFront(${value});`;
      case 'insert_end':
        return `list.insertEnd(${value});`;
      case 'insert_at':
        return `list.insertAt(${value}, ${position});`;
      case 'delete_start':
        return `list.deleteFront();`;
      case 'delete_end':
        return `list.deleteEnd();`;
      case 'delete_at':
        return `list.deleteAt(${position});`;
      case 'search':
        return `list.search(${value});`;
      default:
        return '';
    }
  };

  const handleWheel = (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      const container = document.querySelector('.nodes-container');
      if (container) {
        container.scrollLeft += e.deltaY;
      }
    }
  };

  // Generate random initial list
  useEffect(() => {
    // Generate random list only on initial load
    if (nodes.length === 0 && !inputArray) {
      const randomNodes = Array.from({ length: 4 }, () => ({
        value: Math.floor(Math.random() * 90 + 10),
        next: null,
        prev: null
      }));

      const initialNodes = randomNodes.map((node, index) => ({
        ...node,
        next: index < randomNodes.length - 1 ? randomNodes[index + 1].value : null,
        prev: listType === 'doubly' ? (index > 0 ? randomNodes[index - 1].value : null) : null
      }));

      setNodes(initialNodes);
      setNodeOrder(Array.from({ length: initialNodes.length }, (_, i) => i));
    }
  }, []);

  const handleArrayInputFocus = () => {
    setShowWelcome(false);
    setNodes([]);
    setInputArray('');
  };

  // Add this function to sort nodes based on values
  const sortNodesByValue = (nodes) => {
    return [...nodes].sort((a, b) => a.value - b.value);
  };

  // Update the operation change handler
  const handleOperationChange = (e) => {
    const newOperation = e.target.value;
    setOperation(newOperation);
    
    if (newOperation === 'no_operation' && nodes.length > 0) {
      // Restore original order
      const restoredNodes = originalOrder.map((value, index) => ({
        value,
        next: index < originalOrder.length - 1 ? originalOrder[index + 1] : (listType === 'circular' ? originalOrder[0] : null),
        prev: listType === 'doubly' ? (index > 0 ? originalOrder[index - 1] : null) : null
      }));
      setNodes(restoredNodes);
    }
  };

  // Update the operation select in JSX
  <select 
    value={operation} 
    onChange={handleOperationChange}
    className="operation-select"
  >
    {operations[listType].map(op => (
      <option key={op.value} value={op.value}>
        {op.label}
      </option>
    ))}
  </select>

  // Remove or modify the operation useEffect since we handle it in handleOperationChange
  useEffect(() => {
    if (nodes.length > 0 && operation === 'no_operation') {
      const sortedNodes = sortNodesByValue(nodes);
      const updatedNodes = sortedNodes.map((node, index) => ({
        ...node,
        next: index < nodes.length - 1 ? sortedNodes[index + 1].value : (listType === 'circular' ? sortedNodes[0].value : null),
        prev: listType === 'doubly' ? (index > 0 ? sortedNodes[index - 1].value : null) : null
      }));
      setNodes(updatedNodes);
      setNodeOrder(Array.from({ length: nodes.length }, (_, i) => i));
    }
  }, [operation]);

  // Add the sorting function
  const handleSort = (order) => {
    if (nodes.length === 0) return;
    
    const sortedNodes = [...nodes].sort((a, b) => {
      return order === 'asc' ? a.value - b.value : b.value - a.value;
    });

    const updatedNodes = sortedNodes.map((node, index) => ({
      ...node,
      next: index < sortedNodes.length - 1 ? sortedNodes[index + 1].value : (listType === 'circular' ? sortedNodes[0].value : null),
      prev: listType === 'doubly' ? (index > 0 ? sortedNodes[index - 1].value : null) : null
    }));

    setNodes(updatedNodes);
    setShowSortOptions(false);
    setSortOrder(order);
  };

  // Add this useEffect to calculate node positions
  useEffect(() => {
    const calculateNodePositions = () => {
      const positions = {};
      const container = document.querySelector('.nodes-container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const nodeElements = document.querySelectorAll('.node-wrapper');
      
      nodeElements.forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        
        // Get the right center point of current node
        const startX = rect.right - containerRect.left;
        const startY = rect.top + (rect.height / 2) - containerRect.top;
        
        const nextNode = nodeElements[index + 1];
        let endX = startX + 100;  // default end position
        let endY = startY;
        
        if (nextNode) {
          const nextRect = nextNode.getBoundingClientRect();
          // Get the left center point of next node
          endX = nextRect.left - containerRect.left;
          endY = nextRect.top + (nextRect.height / 2) - containerRect.top;
        }
        
        positions[index] = {
          start: { x: startX, y: startY },
          end: { x: endX, y: endY }
        };
      });
      
      setNodePositions(positions);
    };

    // Calculate positions after a short delay to ensure DOM is updated
    const timeoutId = setTimeout(calculateNodePositions, 100);
    return () => clearTimeout(timeoutId);
  }, [nodes, draggedNodeIndex]);

  // Update the getNodePosition function
  const getNodePosition = (index) => {
    const nodeElement = document.querySelector(`.node-wrapper:nth-child(${index + 1}) .node-container`);
    const nextElement = document.querySelector(`.node-wrapper:nth-child(${index + 2}) .node-container`);
    const container = document.querySelector('.nodes-container');
    
    if (!nodeElement || !container) return null;
    
    const containerRect = container.getBoundingClientRect();
    const rect = nodeElement.getBoundingClientRect();
    
    // Get right edge of current node
    const startX = rect.right - containerRect.left;
    const startY = rect.top + (rect.height / 2) - containerRect.top;
    
    // If no next element, create a short arrow
    if (!nextElement) {
      return {
        start: { x: startX, y: startY },
        end: { x: startX + 30, y: startY }
      };
    }
    
    // Get left edge of next node
    const nextRect = nextElement.getBoundingClientRect();
    const endX = nextRect.left - containerRect.left;
    const endY = nextRect.top + (nextRect.height / 2) - containerRect.top;
    
    return {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY }
    };
  };

  // Update the ElasticConnection component
  const ElasticConnection = ({ startNode, endNode, isDragging }) => {
    // Move useSpring hook before any conditional returns
    const springProps = useSpring({
      from: {
        startX: startNode?.start?.x || 0,
        startY: startNode?.start?.y || 0,
        endX: startNode?.start?.x || 0,
        endY: startNode?.start?.y || 0,
        controlOffset: 0,
      },
      to: {
        startX: startNode?.start?.x || 0,
        startY: startNode?.start?.y || 0,
        endX: endNode?.end?.x || 0,
        endY: endNode?.end?.y || 0,
        controlOffset: startNode && endNode ? Math.min(
          Math.sqrt(
            Math.pow((endNode.end.x - startNode.start.x), 2) + 
            Math.pow((endNode.end.y - startNode.start.y), 2)
          ) * 0.25,
          40
        ) : 0,
      },
      config: {
        tension: 180,
        friction: 12,
        mass: 1,
      },
      immediate: !isDragging,
    });

    // Return null after the hook if needed
    if (!startNode?.start?.x || !startNode?.start?.y || !endNode?.end?.x || !endNode?.end?.y) {
      return null;
    }

    return (
      <svg
        className="elastic-connection"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        <animated.path
          d={springProps.to((props) => `
            M ${props.startX},${props.startY} 
            C ${props.startX + props.controlOffset},${props.startY}
              ${props.endX - props.controlOffset},${props.endY}
              ${props.endX},${props.endY}
          `)}
          stroke="#2c3e50"
          strokeWidth={2}
          fill="none"
          className={`connection-path ${isDragging ? 'stretching' : ''}`}
        />
        <animated.path
          d={springProps.to((props) => `
            M ${props.endX},${props.endY}
            l -8,-4
            l 0,8
            z
          `)}
          fill="#2c3e50"
        />
      </svg>
    );
  };

  return (
    <div className="visualizer-container">
      <div className="visualization-section">
        {showWelcome && (
          <motion.div 
            className="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="welcome-message"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <h1>Welcome to Linked List Visualizer</h1>
              <p>Start with this random list or create your own by entering numbers</p>
              <motion.button
                className="welcome-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWelcome(false)}
              >
                OK
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        <div className="controls">
          <input
            type="text"
            value={inputArray}
            onChange={handleArrayInput}
            onFocus={handleArrayInputFocus}
            placeholder="Enter numbers separated by commas"
            className={error ? 'error' : ''}
          />
          <select value={listType} onChange={(e) => setListType(e.target.value)}>
            <option value="singly">Singly Linked List</option>
            <option value="doubly">Doubly Linked List</option>
            <option value="circular">Circular Linked List</option>
          </select>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="operation-controls">
          <select 
            value={operation} 
            onChange={handleOperationChange}
            className="operation-select"
          >
            {operations[listType].map(op => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
          
          <div className="sort-controls">
            {!showSortOptions ? (
              <button 
                className="sort-button"
                onClick={() => setShowSortOptions(true)}
              >
                Sort List
              </button>
            ) : (
              <div className="sort-options">
                <button 
                  className="sort-option"
                  onClick={() => handleSort('asc')}
                >
                  Ascending
                </button>
                <button 
                  className="sort-option"
                  onClick={() => handleSort('desc')}
                >
                  Descending
                </button>
                <button 
                  className="sort-option cancel"
                  onClick={() => setShowSortOptions(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {operation !== 'no_operation' && (
            <>
              <input
                type="text"
                value={operationValue}
                onChange={(e) => setOperationValue(e.target.value)}
                placeholder="Enter value"
                className="operation-input"
              />
              
              {operation.includes('_at') && (
                <input
                  type="number"
                  value={operationPosition}
                  onChange={(e) => setOperationPosition(parseInt(e.target.value))}
                  placeholder="Position"
                  className="position-input"
                />
              )}
              
              <button 
                onClick={handleOperation}
                className="operation-button"
              >
                Execute
              </button>
            </>
          )}
        </div>

        {prompt && (
          <div className="prompt-box">
            <p>{prompt}</p>
            <div className="code-snippet">
              {getOperationCode(operation, operationValue, operationPosition)}
            </div>
          </div>
        )}

        <div 
          className="visualization-area"
          ref={listContainerRef}
          onWheel={handleWheel}
        >
          <div 
            className={`nodes-container ${operation !== 'no_operation' ? 'static' : ''}`}
            onWheel={handleWheel}
          >
            {nodes.map((node, index) => (
              <React.Fragment key={node.id || index}>
                <Node
                  value={node.value}
                  type={listType}
                  isSearched={searchedValue === node.value}
                  isDragging={draggedNodeIndex === index}
                  isStatic={operation !== 'no_operation'}
                  isDragOver={dragOverNodeIndex === index}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={() => handleDragOver(index)}
                  onDragEnd={(event, info) => handleDragEnd(event, info, index)}
                  dragConstraints={listContainerRef}
                  isLastNode={index === nodes.length - 1}
                  isFirstNode={index === 0}
                />
                {listType === 'singly' && index < nodes.length - 1 && (
                  <ElasticConnection
                    startNode={getNodePosition(index)}
                    endNode={getNodePosition(index + 1)}
                    isDragging={draggedNodeIndex === index || draggedNodeIndex === index + 1}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="code-section">
        <div className="code-header">
          <button 
            className={`code-tab ${codeLanguage === 'cpp' ? 'active' : ''}`}
            onClick={() => setCodeLanguage('cpp')}
          >
            C++
          </button>
          <button 
            className={`code-tab ${codeLanguage === 'python' ? 'active' : ''}`}
            onClick={() => setCodeLanguage('python')}
          >
            Python
          </button>
          <button 
            className={`code-tab ${codeLanguage === 'java' ? 'active' : ''}`}
            onClick={() => setCodeLanguage('java')}
          >
            Java
          </button>
          <button 
            className={`code-tab ${codeLanguage === 'javascript' ? 'active' : ''}`}
            onClick={() => setCodeLanguage('javascript')}
          >
            JavaScript
          </button>
        </div>
        <div className="code-content">
          <CodeDisplay 
            listType={listType} 
            language={codeLanguage} 
            operation={operation}
          />
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualizer;
