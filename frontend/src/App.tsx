import React, { useEffect, useState } from "react";

const gradientBg =
  "bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 min-h-screen flex items-center justify-center";

const glassCard =
  "backdrop-blur-lg bg-white/70 shadow-2xl rounded-3xl px-10 py-12 max-w-lg w-full border border-white/30";

const inputStyle =
  "transition-all duration-200 border-2 border-transparent focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none rounded-lg px-4 py-3 w-full text-lg bg-white/80 shadow-inner mb-4";

const buttonStyle =
  "transition-all duration-200 bg-gradient-to-r from-blue-600 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 hover:from-pink-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg";

const linkBox =
  "mt-6 flex flex-col items-center bg-gradient-to-r from-green-200 via-blue-100 to-purple-100 rounded-xl shadow-inner p-4 animate-fade-in";

const errorBox =
  "mt-6 bg-gradient-to-r from-red-200 via-pink-100 to-yellow-100 text-red-700 rounded-xl shadow-inner p-4 animate-shake";

const App = () => {
  const [url, setUrl] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | undefined>();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [redirectStatus, setRedirectStatus] = useState<
    "loading" | "expired" | "invalid" | "ok" | null
  >(null);

  useEffect(() => {
    const url = window.location.href;
    const vals = url.split("/");
    const size = vals.length;
    if (vals[size - 1].length > 5 && vals[size - 1].length < 9) {
      setCode(vals[size - 1]);
    }
  }, []);

  useEffect(() => {
    const takeItThere = async () => {
      if (code) {
        setRedirectStatus("loading");
        setRedirectUrl(null);
        setError("");
        try {
          const response = await fetch("http://localhost:4000/getUrl", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });
          if (response.status === 410) {
            setRedirectStatus("expired");
            setRedirectUrl(null);
            return;
          }
          if (response.status === 404) {
            setRedirectStatus("invalid");
            setRedirectUrl(null);
            return;
          }
          const data = await response.json();
          if (data.url) {
            let finalUrl = data.url;
            if (
              !finalUrl.startsWith("https://") &&
              !finalUrl.startsWith("http://")
            ) {
              finalUrl = "https://www." + finalUrl;
            }
            setRedirectUrl(finalUrl);
            window.location.href = finalUrl;
            setRedirectStatus("ok");
          } else {
            setRedirectStatus("invalid");
            setRedirectUrl(null);
          }
        } catch {
          setRedirectStatus("invalid");
          setRedirectUrl(null);
        }
      }
    };
    if (code) {
      takeItThere();
    }
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
    } catch {
      setError("Failed to connect to the server.");
    }
  };

  if (code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          {redirectStatus === "loading" && (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-gray-700 text-lg font-medium">
                Redirecting...
              </span>
            </div>
          )}
          {redirectStatus === "ok" && (
            <span className="text-gray-700 text-lg font-medium">
              Redirecting...
            </span>
          )}
          {redirectStatus === "expired" && (
            <div className="flex flex-col items-center">
              <span className="text-red-600 text-lg font-semibold mb-1">
                Link Expired
              </span>
              <span className="text-gray-600 text-base">
                This link has expired. Please generate a new one.
              </span>
            </div>
          )}
          {redirectStatus === "invalid" && (
            <div className="flex flex-col items-center">
              <span className="text-red-600 text-lg font-semibold mb-1">
                Invalid Link
              </span>
              <span className="text-gray-600 text-base">
                This link does not exist or is invalid.
              </span>
            </div>
          )}
          {redirectStatus === "ok" && redirectUrl && (
            <a
              href={redirectUrl}
              className="mt-4 text-blue-600 underline text-base"
              target="_blank"
              rel="noopener noreferrer"
            >
              If you are not redirected, click here
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={gradientBg}>
      <div className={glassCard}>
        <div className="flex flex-col items-center mb-8">
          <svg
            className="w-16 h-16 mb-2 animate-bounce"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path
              stroke="url(#gradient)"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 010 5.656l-3.535 3.535a4 4 0 01-5.657-5.657l1.414-1.414m7.071-7.071a4 4 0 015.657 5.657l-1.414 1.414"
            />
          </svg>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 mb-2 drop-shadow-lg">
            Shorten Your Link
          </h1>
          <p className="text-lg text-gray-700 font-medium text-center">
            Make your URLs beautiful, memorable, and easy to share.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            className={inputStyle}
            placeholder="Paste your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          <button type="submit" className={buttonStyle}>
            ✨ Generate Short Link
          </button>
        </form>
        {generatedCode && (
          <div className={linkBox}>
            <span className="font-semibold text-lg text-gray-800 mb-1">
              Your short link:
            </span>
            <a
              href={generatedCode}
              className="text-xl font-mono text-blue-700 underline break-all hover:text-pink-600 transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {generatedCode}
            </a>
            <button
              className="mt-3 px-4 py-2 bg-white/80 rounded-lg shadow hover:bg-blue-100 text-blue-700 font-semibold text-sm transition-all duration-200"
              onClick={() => {
                navigator.clipboard.writeText(generatedCode);
              }}
              type="button"
            >
              Copy Link
            </button>
          </div>
        )}
        {error && (
          <div className={errorBox}>
            <span className="font-semibold">Oops! </span>
            {error}
          </div>
        )}
      </div>
      {/* Animations */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
          @keyframes shake {
            10%, 90% { transform: translateX(-1px);}
            20%, 80% { transform: translateX(2px);}
            30%, 50%, 70% { transform: translateX(-4px);}
            40%, 60% { transform: translateX(4px);}
          }
        `}
      </style>
    </div>
  );
};

export default App;
