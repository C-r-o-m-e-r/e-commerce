// frontend/src/components/ImageDropzone.jsx

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import './ImageDropzone.css'; // We'll create this file next

const ImageDropzone = ({ onFilesChange }) => {
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
    },
    onDrop: acceptedFiles => {
      const newFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setFiles(newFiles);
      onFilesChange(newFiles); // Pass files to parent component
    }
  });

  const thumbs = files.map(file => (
    <div className="thumb" key={file.name}>
      <div className="thumb-inner">
        <img
          src={file.preview}
          className="thumb-img"
          // Revoke data uri on image load to free up memory
          onLoad={() => { URL.revokeObjectURL(file.preview) }}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks
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