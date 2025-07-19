"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, domain: window.location.hostname }),
      });
      const data = await res.json();
      if (data.user) {
        toast.success("Login successful", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        localStorage.setItem("userId", JSON.stringify(data.user._id.toString()));
        router.replace("/dashboard");
      }
      setIsLoading(false);
      setError(data.error);
    } catch (error) {
      toast.error("Failed to log in. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100">
        <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
          <div className="mb-8 w-full flex flex-col items-center">
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-primary mb-2">
              ProxyGyan
            </span>
            <span className="text-sm tracking-wide">
              Welcome back! Please login to your account.
            </span>
            {error && (
              <div className="mt-5 text-red-700 py-3 rounded">
                <strong className="font-bold"></strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>
          <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="relative">
              {/* Use state to track focus for floating label */}
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
                className="peer h-12 w-full border-b-2 border-gray-200 text-gray-900 placeholder-transparent focus:outline-none focus:border-primary bg-transparent transition"
                placeholder="Email address"
                autoComplete="email"
              />
              <label
                htmlFor="email"
                className={`absolute left-0 transition-all text-gray-400 ${email || emailFocused
                    ? "-top-5 text-sm text-blue-500 font-semibold"
                    : "top-3 text-base"
                  } pointer-events-none`}
              >
                Email
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="peer h-12 w-full border-b-2 border-gray-200 text-gray-900 placeholder-transparent focus:outline-none focus:border-primary bg-transparent transition pr-10"
                placeholder="Password"
                autoComplete="current-password"
              />
              <label
                htmlFor="password"
                className={`absolute left-0 transition-all text-gray-400 ${password || (typeof window !== "undefined" && window?.document?.activeElement?.id === "password")
                    ? "-top-5 text-sm text-primary font-semibold"
                    : "top-3 text-base"
                  } pointer-events-none`}
              >
                Password
              </label>
              <span
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0012 6c3.978 0 7.437 2.19 9.02 5.223a1.724 1.724 0 010 1.554A10.477 10.477 0 0112 18c-3.978 0-7.437-2.19-9.02-5.223a1.724 1.724 0 010-1.554z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M9.88 9.88A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .414-.084.81-.232 1.172M6.53 6.53C4.06 8.06 2.53 10.5 2.53 12c0 1.5 1.53 3.94 4 5.47C8.06 19.94 10.5 21.47 12 21.47c1.5 0 3.94-1.53 5.47-4 .53-.7 1.02-1.47 1.47-2.47M6.53 6.53l10.94 10.94"
                    />
                  </svg>
                )}
              </span>
            </div>
            <button
              type="submit"
              className={`mt-4 w-full py-3 rounded-xl bg-primary text-white font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              value="Login"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-6 w-6 relative m-[2px] mx-auto">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </>);
}
