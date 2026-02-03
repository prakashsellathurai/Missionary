import { useState } from 'react';
import { convertLatexToPdf, openLatexInOverleaf } from './utils/pdf-service';
import './App.css';

function App() {
  const [latex, setLatex] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!latex.trim()) {
      setError('Please enter some LaTeX code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blob = await convertLatexToPdf(latex);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'document.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOverleaf = () => {
    if (!latex.trim()) {
      setError('Please enter some LaTeX code.');
      return;
    }

    try {
      openLatexInOverleaf(latex);
    } catch (err) {
      console.error('Overleaf error:', err);
      setError('Failed to open in Overleaf');
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Missionary</h1>
        <p className="subtitle">Convert LaTeX to PDF instantly</p>
      </header>

      <div className="editor-container">
        <textarea
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          placeholder="\documentclass{article}
\begin{document}
  Hello World!
\end{document}"
          disabled={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <button onClick={handleConvert} disabled={loading} className="convert-btn">
          {loading ? 'Converting...' : 'Convert to PDF'}
        </button>
        <button onClick={handleOverleaf} disabled={loading} className="overleaf-btn" style={{ marginLeft: '10px', backgroundColor: '#47ba5d' }}>
          Open in Overleaf
        </button>
      </div>
    </div>
  );
}

export default App;
