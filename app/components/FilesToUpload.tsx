import React from "react";

interface FilesToUploadProps {
  files: File | File[];
  removeFile: (index: number) => void;
}

const FilesToUpload: React.FC<FilesToUploadProps> = ({ files, removeFile }) => {
  // Normalize files to always be an array
  const fileArray = Array.isArray(files) ? files : files ? [files] : [];

  return (
    <div className="uploaded-files">
      <h4>Files To Upload:</h4>
      <div className="file-list">
        {fileArray.map((file, index) => (
          <div key={index} className="file-item">
            <span className="file-name">{file.name}</span>
            <span className="file-size">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <button
              type="button"
              className="remove-file"
              onClick={() => removeFile(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesToUpload;