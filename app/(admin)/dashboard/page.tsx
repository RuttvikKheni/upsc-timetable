"use client";
import React, { useState ,useEffect} from "react";
import {
  FaHome,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import Link from "next/link";

const navLinks = [
  { name: "Home", icon: FaHome },
  { name: "change password", icon: FaUserCircle },
];

import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
interface TimetableData {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  targetYear: string;
  amount: string;
  razorpayPaymentId: string;
  paymentStatus: string;
  downloadStatus: string;
  createdAt: string;
  razorpayOrderId: string;
}
export default function AdminDashboard() {
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [timetableData, setTimetableData] = useState<TimetableData[]>([]);
  const [fetchingLoading, setFetchingLoading] = useState(true);
  const router = useRouter();
  const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
      });
    }
    router.push("/login");
    localStorage.removeItem("userId");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("hello");
    if (!oldPwd || !newPwd || !confirmPwd) {
      setPwdError("All fields are required.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (newPwd.length < 6) {
      setPwdError("Password must be at least 6 characters.");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPwd, newPwd,userId:localStorage.getItem("userId") }),
      });
      const data = await res.json();
      if (data.message) {
        setChangePwdOpen(false);
        setIsLoading(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error logging in:", error);
      setIsLoading(false);
    }

  };

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };
  useEffect(() => {
    const fetchTimetableData = async () => {
      try {
        setFetchingLoading(false); 
        const response = await fetch("/api/alltimetabledata");
        const data = await response.json();
        setTimetableData(data);
        setFetchingLoading(false);
        
      } catch (error) {
        console.error("Error fetching timetable data:", error);
      }
    };
    fetchTimetableData();
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <div>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`fixed top-0  left-0 h-full w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-900 shadow-lg z-40 transform transition-transform duration-200 ease-in-out
            ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 lg:static lg:shadow-none`}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100 dark:border-gray-900">
            <span className="text-xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-blue-400 dark:to-purple-400">
              <Link href="/dashboard">ProxyGyan</Link>
            </span>
            <div className="flex items-center gap-2">
              <button
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
                title={
                  darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                }
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <FaSun className="h-5 w-5" />
                ) : (
                  <FaMoon className="h-5 w-5" />
                )}
              </button>
              <button
                className="lg:hidden text-gray-700 focus:outline-none"
                onClick={() => setSidebarOpen(false)}
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
          </div>
          <nav className="mt-8 flex flex-col gap-2 px-4">
            {navLinks.map((link) =>
              link.name === "change password" ? (
                <button
                  key={link.name}
                  onClick={() => setChangePwdOpen(true)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-100 font-medium hover:bg-blue-100/70 dark:hover:bg-gray-800 transition group w-full text-left"
                >
                  <link.icon className="h-5 w-5 text-blue-500 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                  <span className="group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    {link.name}
                  </span>
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.name === "Logout" ? "/logout" : "/"}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-100 font-medium hover:bg-blue-100/70 dark:hover:bg-gray-800 transition group"
                >
                  <link.icon className="h-5 w-5 text-blue-500 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                  <span className="group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    {link.name}
                  </span>
                </Link>
              )
            )}

            <Dialog.Root open={changePwdOpen} onOpenChange={setChangePwdOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Change Password
                  </Dialog.Title>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                      type="password"
                      placeholder="Old Password"
                      className="rounded-lg border px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={oldPwd}
                      onChange={(e) => setOldPwd(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="rounded-lg border px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={newPwd}
                      onChange={(e) => setNewPwd(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="rounded-lg border px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                    />
                    {pwdError && (
                      <div className="text-red-600 text-sm">{pwdError}</div>
                    )}
                    <div className="flex gap-2 justify-end mt-2">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                        onClick={() => setChangePwdOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      >
                        Change
                      </button>
                    </div>
                  </form>
                  <Dialog.Close asChild>
                    <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-2xl">
                      ×
                    </button>
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </nav>
          <button
            className="fixed bottom-4 left-16 z-50 bg-red-500 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-600 dark:hover:bg-red-700 dark:hover:text-white dark:text-white transition"
            onClick={handleLogout}
          >
            <span className="flex items-center gap-2">
              <FaSignOutAlt className="h-5 w-5" />
              Logout
            </span>
          </button>
        </aside>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="w-full h-16 flex items-center px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10 justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-700 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars className="h-6 w-6" />
            </button>
            <div className="w-full flex items-center justify-between">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="flex items-center gap-4">
                <FaUserCircle className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-950">
          <div className="grid grid-cols-1 gap-6 mb-8 overflow-x-auto">
            <h1 className="text-2xl font-bold text-center mb-2 mt-4 ">
              Time Table Report
            </h1>
            <div className="bg-white overflow-x-auto dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
              <table className="w-full max-w-full">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Target Year
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Razorpay Payment ID
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Payment Status
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Download Status
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Created At
                    </th>
                    <th className="px-4 py-2 text-left break-words font-semibold border-b border-gray-200 dark:border-gray-700">
                      Print PDF
                    </th>
                  </tr>
                </thead>
                <tbody>
                   {
                    fetchingLoading ?
                     Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 12 }).map((_, j) => (
                          <td key={j} className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded skeleton-shimmer"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                   : timetableData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {item.fullName}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {item.email}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {item.contactNumber}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {item.targetYear}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {item.amount}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {item.razorpayOrderId}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {item.paymentStatus}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {item.downloadStatus}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        {new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(item.createdAt))}
                      </td>
                      <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-medium">
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">
                          Print PDF
                        </button>
                      </td>
                    </tr>
                  ))
                   }
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
