export default function FilePreview({ attachments }) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const isImage = (mimeType) => {
    return mimeType && mimeType.startsWith("image/");
  };

  const getFileIcon = (mimeType) => {
    if (mimeType === "application/pdf") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    } else if (mimeType && mimeType.includes("word")) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="10" y1="13" x2="14" y2="13" />
          <line x1="10" y1="17" x2="14" y2="17" />
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    }
  };

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
      <div className="text-[0.6875rem] font-semibold uppercase tracking-widest mb-2.5" style={{ color: "var(--text-muted)" }}>
        Attachments ({attachments.length})
      </div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment, index) => {
          const downloadUrl = `http://localhost:4000/uploads/${attachment.stored_name}`;

          return (
            <a
              key={index}
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group no-underline"
            >
              <div
                className="flex items-center gap-2.5 py-2 px-3 border rounded-lg-custom transition-all duration-200 hover:shadow-sm-dark"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  maxWidth: "250px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#f97316";
                  e.currentTarget.style.background = "rgba(249, 115, 22, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.background = "var(--bg-secondary)";
                }}
              >
                {/* Preview/Icon */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-md-custom flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  {isImage(attachment.mime_type) ? (
                    <img
                      src={downloadUrl}
                      alt={attachment.original_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div style={{ color: "var(--text-secondary)" }}>
                      {getFileIcon(attachment.mime_type)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium mb-0.5 truncate group-hover:text-accent-primary transition-colors duration-200"
                    style={{ color: "var(--text-primary)" }}
                    title={attachment.original_name}
                  >
                    {attachment.original_name}
                  </p>
                  <p className="text-[0.65rem] mb-0" style={{ color: "var(--text-muted)" }}>
                    {formatFileSize(attachment.size)}
                  </p>
                </div>

                {/* Download Icon */}
                <div className="flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="group-hover:stroke-accent-primary transition-colors duration-200"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
