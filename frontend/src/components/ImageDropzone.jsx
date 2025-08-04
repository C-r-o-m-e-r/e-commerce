// frontend/src/components/ImageDropzone.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './ImageDropzone.css';

const ImageDropzone = ({ onFilesChange }) => {
  const [files, setFiles] = useState([]);

  // useCallback allows adding more files instead of replacing them
  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
    onDrop
  });

  // Function to remove a specific file from the preview
  const handleRemoveFile = (fileName) => {
    const updatedFiles = files.filter(file => file.name !== fileName);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const thumbs = files.map(file => (
    <div className="thumb" key={file.name}>
      <div className="thumb-inner">
        <img
          src={file.preview}
          className="thumb-img"
          onLoad={() => { URL.revokeObjectURL(file.preview) }}
        />
      </div>
      {/* This is the remove button with the correct style class */}
      <button type="button" className="thumb-remove-btn" onClick={() => handleRemoveFile(file.name)}>
        ×
      </button>
    </div>
  ));

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <section className="dropzone-container">
      <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Up to 5 images will be accepted)</em>
      </div>
      <aside className="thumbs-container">
        {thumbs}
      </aside>
    </section>
  );
};

export default ImageDropzone;