import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Node.css';

const Node = ({ 
  value, 
  type,
  isSearched,
  isDragging,
  isStatic,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  dragConstraints,
  isLastNode,
  isFirstNode
}) => {
  const nodeRef = useRef(null);

  return (
    <motion.div
      ref={nodeRef}
      className={`node-wrapper ${type} ${isDragging ? 'dragging' : ''} 
                 ${isDragOver ? 'drag-over' : ''} ${isStatic ? 'static' : ''}`}
      drag={!isStatic}
      dragSnapToOrigin={true}
      dragElastic={0.2}
      dragMomentum={false}
      dragTransition={{ 
        bounceStiffness: 600,
        bounceDamping: 20,
        power: 0.1,
        timeConstant: 50
      }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={(event, info) => onDragEnd(event, info)}
      dragConstraints={dragConstraints}
      whileDrag={{ scale: 1.05, transition: { duration: 0.1 } }}
      layout
      layoutTransition={{
        type: "spring",
        stiffness: 500,
        damping: 25
      }}
    >
      <motion.div 
        className={`node-container ${isSearched ? 'searched' : ''}`}
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        <div className="node-groups">
          {type === 'doubly' && (
            <div className="node-group prev-group">
              <span className="group-label">Prev</span>
              <div className="group-value">
                {isFirstNode ? 'null' : '←'}
              </div>
            </div>
          )}
          <div className="node-group data-group">
            <span className="group-label">Data</span>
            <div className="group-value">{value}</div>
          </div>
          <div className="node-group next-group">
            <span className="group-label">Next</span>
            <div className="group-value">
              {isLastNode ? 'null' : '→'}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Node;