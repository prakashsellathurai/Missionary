import { useState } from 'react';
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
      // Use latexonline.cc API
      // Note: GET request has length limits. For now this is MVP.
      const encodedLatex = encodeURIComponent(latex);
      const url = `https://latexonline.cc/compile?text=${encodedLatex}&force=true`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Conversion failed. Please checks your syntax or try shorter content.');
      }

      const blob = await response.blob();
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
      // Base64 encode the LaTeX content
      // We need to handle UTF-8 characters correctly
      const base64Latex = btoa(unescape(encodeURIComponent(latex)));
      const dataUrl = `data:application/x-tex;base64,${base64Latex}`;

      // Create a form to post data to Overleaf
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.overleaf.com/docs';
      form.target = '_blank';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'snip_uri';
      input.value = dataUrl;

      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
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
