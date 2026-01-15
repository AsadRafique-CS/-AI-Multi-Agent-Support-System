import { useState, useRef } from "react";

export default function FileUpload({ onFilesSelected, maxFiles = 5, disabled = false }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Allowed file types
  const ALLOWED_TYPES = {
    images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    documents: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    const allAllowedTypes = [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.documents];

    if (!allAllowedTypes.includes(file.type)) {
      return `${file.name}: Invalid file type. Allowed types are images (jpeg, png, gif, webp) and documents (pdf, doc, docx, txt).`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size exceeds 10MB limit.`;
    }

    return null;
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const validationErrors = [];
    const validFiles = [];

    // Check if adding these files would exceed max files
    if (files.length + fileArray.length > maxFiles) {
      validationErrors.push(`Maximum ${maxFiles} files allowed.`);
      setErrors(validationErrors);
      return;
    }

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Clear errors after 5 seconds
      setTimeout(() => setErrors([]), 5000);
    } else {
      setErrors([]);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const isImage = (file) => {
    return ALLOWED_TYPES.images.includes(file.type);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type === "application/pdf") {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    } else if (file.type.includes("word")) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="10" y1="13" x2="14" y2="13" />
          <line x1="10" y1="17" x2="14" y2="17" />
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    }
  };

  return (
    <div className="w-full">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-4">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 py-2.5 px-3 border rounded-lg-custom mb-2 text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                borderColor: "rgba(239, 68, 68, 0.25)",
                color: "#ef4444",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg-custom p-6 text-center transition-all duration-200 ${
          dragActive ? "border-accent-primary bg-opacity-5" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        style={{
          borderColor: dragActive ? "#f97316" : "var(--border-color)",
          background: dragActive ? "rgba(249, 115, 22, 0.05)" : "var(--bg-tertiary)",
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg-custom flex items-center justify-center"
            style={{ background: "var(--bg-input)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: "var(--text-muted)" }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
              <span className="text-accent-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs mb-0" style={{ color: "var(--text-muted)" }}>
              Images (JPEG, PNG, GIF, WebP) or Documents (PDF, DOC, DOCX, TXT)
            </p>
            <p className="text-xs mt-1 mb-0" style={{ color: "var(--text-muted)" }}>
              Max {maxFiles} files, up to 10MB each
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
          disabled={disabled}
          style={{ display: "none" }}
        />
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 py-2.5 px-3 border rounded-lg-custom transition-all duration-200"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              {/* Preview/Icon */}
              <div
                className="flex-shrink-0 w-12 h-12 rounded-md-custom flex items-center justify-center overflow-hidden"
                style={{ background: "var(--bg-tertiary)" }}
              >
                {isImage(file) ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div style={{ color: "var(--text-secondary)" }}>{getFileIcon(file)}</div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium mb-0.5 truncate"
                  style={{ color: "var(--text-primary)" }}
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs mb-0" style={{ color: "var(--text-muted)" }}>
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                className="flex-shrink-0 w-8 h-8 rounded-md-custom flex items-center justify-center transition-all duration-200 border"
                style={{
                  background: "var(--bg-tertiary)",
                  borderColor: "var(--border-color)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.borderColor = "#ef4444";
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-tertiary)";
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                disabled={disabled}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
