// frontend/src/components/ImageDropzone.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './ImageDropzone.css';

const ImageDropzone = ({ onFilesChange, maxFiles = 5 }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) return;

    const filesToAdd = acceptedFiles.slice(0, remainingSlots);

    // 1. Assign a unique ID and a preview to each new file
    const newFiles = filesToAdd.map(file => Object.assign(file, {
      id: `${file.name}-${file.lastModified}-${Math.random()}`, // Unique ID
      preview: URL.createObjectURL(file)
    }));
    
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
    onDrop,
    disabled: files.length >= maxFiles
  });

  // 2. Remove files by their unique ID, not their name
  const handleRemoveFile = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const thumbs = files.map(file => (
    <div className="thumb" key={file.id}> {/* 3. Use the unique ID for the key */}
      <div className="thumb-inner">
        <img
          src={file.preview}
          className="thumb-img"
        />
      </div>
      <button type="button" className="thumb-remove-btn" onClick={() => handleRemoveFile(file.id)}>
        ×
      </button>
    </div>
  ));

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  const isLimitReached = files.length >= maxFiles;
  const remainingImages = maxFiles - files.length;

  return (
    <section className="dropzone-container">
      <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''} ${isLimitReached ? 'disabled' : ''}` })}>
        <input {...getInputProps()} />
        {isLimitReached ? (
          <p>You have reached the image limit.</p>
        ) : (
          <>
            <p>Drag 'n' drop some files here, or click to select files</p>
            <em>(Up to {remainingImages} more images can be added)</em>
          </>
        )}
      </div>
      <aside className="thumbs-container">
        {thumbs}
      </aside>
    </section>
  );
};

export default ImageDropzone;