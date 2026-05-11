export default function LoadingForge({ message = 'Forging...', fullPage = false }) {
  const content = (
    <div className="loading-forge">
      <div className="forge-spinner">
        <div className="forge-spinner-icon">
          <i className="bi bi-fire"></i>
        </div>
      </div>
      <span className="loading-text">{message}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {content}
      </div>
    );
  }
  return content;
}
