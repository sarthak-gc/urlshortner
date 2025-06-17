import React, { useEffect, useState } from "react";

const App = () => {
  const [url, setUrl] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | undefined>();
  useEffect(() => {
    const url = window.location.href;
    const vals = url.split("/");
    const size = vals.length;
    if (vals[size - 1].length > 5 && vals[size - 1].length < 9) {
      setCode(vals[size - 1]);
    }
    console.log(vals);
  }, []);
  useEffect(() => {
    const takeItThere = async () => {
      if (code) {
        const response = await fetch("http://localhost:4000/getUrl", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });
        const data = await response.json();
        if (data.url) {
          if (data.url.startsWith("https://") || data.url.startsWith("http://"))
            window.location.href = data.url;
          else {
            window.location.href = "https://www." + data.url;
          }
        }
      }
    };
    takeItThere();
  }, [code]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGeneratedCode("");
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (data.workingCode) {
        setGeneratedCode(`${window.location.origin}/${data.workingCode}`);
      } else if (data.message) {
        setError(data.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } catch (err) {
      console.log(err);
      setError("Failed to connect to the server.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Generate a Short Link</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          className="border p-2 w-full mb-2"
          placeholder="Enter your URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Link
        </button>
      </form>
      {generatedCode && (
        <div className="mt-4 p-2 bg-green-100 rounded">
          <span className="font-semibold">Your link: </span>
          <a
            href={generatedCode}
            className="text-blue-700 underline break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {generatedCode}
          </a>
        </div>
      )}
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
    </div>
  );
};

export default App;
