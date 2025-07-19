"use client";
import React, { useState, useEffect } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

const navLinks = [{ name: "Home", icon: FaHome }];

import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Download } from "lucide-react";
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
  razorpayPaymentStatus: string;
}
export default function AdminDashboard() {
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [timetableData, setTimetableData] = useState<TimetableData[]>([]);
  const [fetchingLoading, setFetchingLoading] = useState(true);
  const router = useRouter();
   const handleLogout = () => {
    if (typeof document !== "undefined") {
      document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/;domain=${window.location.hostname}`;
    }
    localStorage.removeItem("userId");
    router.replace("/login");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(typeof window !== "undefined" && localStorage.getItem("theme") === "dark");

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        body: JSON.stringify({
          oldPwd,
          newPwd,
          userId: localStorage.getItem("userId"),
        }),
      });
      const data = await res.json();
      if (data.message) {
        setChangePwdOpen(false);
        toast.success(data.message);
        setIsLoading(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Failed to change password. Please try again.");
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const storedTheme = typeof window !== "undefined" && localStorage.getItem("theme");
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
    <>
      <ToastContainer
        autoClose={5000}
        position="top-center"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
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
              <span className="text-xl font-bold text-gradient bg-primary bg-clip-text text-transparent dark:text-gray-100">
                <Link href="/dashboard">ProxyGyan</Link>
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="text-gray-700 hover:text-primary dark:hover:text-gray-100 focus:outline-none"
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
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.name === "Logout" ? "/logout" : "/dashboard"}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-100 font-medium hover:bg-primary/15 dark:hover:bg-gray-800 transition group"
                >
                  <link.icon className="h-5 w-5 text-primary dark:text-blue-400 group-hover:text-primary dark:group-hover:text-blue-300" />
                  <span className="group-hover:text-primary dark:group-hover:text-blue-300">
                    {link.name}
                  </span>
                </Link>
              ))}
              <Dialog.Root open={logoutOpen} onOpenChange={setLogoutOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      Confirm Logout
                    </Dialog.Title>
                    <p className="text-gray-700 dark:text-gray-300">
                      Are you sure you want to logout?
                    </p>
                    <div className="flex gap-2 justify-end mt-6">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                        onClick={() => setLogoutOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                    <Dialog.Close asChild>
                      <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 text-2xl">
                        ×
                      </button>
                    </Dialog.Close>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              <Dialog.Root open={changePwdOpen} onOpenChange={setChangePwdOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-900 p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                    <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      Change Password
                    </Dialog.Title>
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-4"
                    >
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
          </aside>
        </div>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="w-full h-16 flex items-center px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
            <div className="flex items-center w-full">
              <button
                className="lg:hidden text-gray-700 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <FaBars className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold flex-1 text-start dark:text-white">
                Dashboard
              </h1>
              <div className="relative">
                <FaUserCircle
                  className="h-8 w-8 text-primary/80 dark:text-gray-100 cursor-pointer"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                />
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-lg z-50">
                    <ul className="border-b border-gray-200 dark:border-gray-700">
                      <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-100">
                        <button
                          className="block w-full text-left"
                          onClick={() => {
                            setUserMenuOpen(false);
                            setChangePwdOpen(true);
                          }}
                        >
                          Change Password
                        </button>
                      </li>
                    </ul>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-700 dark:hover:text-gray-100 text-red-500"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setLogoutOpen(true);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-6 mb-8 overflow-x-auto">
              <h1 className="text-2xl font-bold text-center mb-2 mt-4 dark:text-white">
                Time Table Report
              </h1>
              <div className="bg-white overflow-x-auto dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
                <table className="w-full max-w-full min-h-[500px]">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      {[
                        "S.No",
                        "Name",
                        "Email",
                        "Phone",
                        "Target Year",
                        "Amount (₹)",
                        "Razorpay Payment ID",
                        "Payment Status",
                        "Download Status",
                        "Time",
                        "Print PDF",
                      ].map((item, index) => (
                        <th
                          key={index}
                          className={[
                            "px-4 py-2 text-left break-words font-medium text-foreground border-b border-gray-200 dark:border-gray-700 dark:text-white whitespace-nowrap",
                            [
                              "w-12", // S.No
                              "w-40", // Name
                              "w-56", // Email
                              "w-32", // Phone
                              "w-32", // Target Year
                              "w-20", // Amount
                              "w-56", // Razorpay Payment ID
                              "w-32", // Payment Status
                              "w-32", // Download Status
                              "w-56", // Time
                              "w-32", // Print PDF
                            ][index],
                          ].join(" ")}
                        >
                          {item}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fetchingLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            {Array.from({ length: 12 }).map((_, j) => (
                              <td
                                key={j}
                                className={[
                                  "px-4 py-2 border-t border-gray-200 dark:border-gray-700 dark:text-white whitespace-nowrap",
                                  [
                                    "w-12", // S.No
                                    "w-40", // Name
                                    "w-56", // Email
                                    "w-32", // Phone
                                    "w-32", // Target Year
                                    "w-20", // Amount
                                    "w-56", // Razorpay Payment ID
                                    "w-32", // Payment Status
                                    "w-32", // Download Status
                                    "w-56", // Time
                                    "w-32", // Print PDF
                                  ][j],
                                ].join(" ")}
                              >
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded skeleton-shimmer w-full"></div>
                              </td>
                            ))}
                          </tr>
                        ))
                      : timetableData.map((item, index) => {
                          const createdAt = new Date(item.createdAt);
                          return (
                            <tr
                              key={index}
                              className="hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 whitespace-nowrap dark:text-[#64E9F8]">
                                {index + 1}
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap dark:text-[#C9F7F5]">
                                {item.fullName}
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap dark:text-[#34D399]">
                                {item.email}
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap dark:text-[#FFD700]">
                                {item.contactNumber}
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap dark:text-[#FF99CC]">
                                {item.targetYear}
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap dark:text-[#FFC107]">
                                299
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap dark:text-[#A7FFEB]">
                                {item.razorpayOrderId}
                              </td>
                              <td className="px-4 py-2 flex items-center justify-center border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full ${
                                    item.razorpayPaymentStatus === "success"
                                      ? "bg-green-100 dark:bg-green-200 text-green-500"
                                      : "bg-red-100 dark:bg-red-200 text-red-500"
                                  }`}
                                >
                                  {" "}
                                  {item.razorpayPaymentStatus === "failed"
                                    ? "Failed"
                                    : "Success"}
                                </span>
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full ${
                                    item.downloadStatus === "downloaded failed"
                                      ? "bg-red-100 dark:bg-red-200 text-red-500"
                                      : "bg-green-100 dark:bg-green-200 text-green-500"
                                  }`}
                                >
                                  {" "}
                                  {item.downloadStatus === "downloaded failed"
                                    ? "Failed"
                                    : "Success"}
                                </span>
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap dark:text-[#99E1D9]">
                                {new Intl.DateTimeFormat("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }).format(createdAt)}
                              </td>
                              <td className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 break-words font-normal whitespace-nowrap dark:text-[#6EE7BC]">
                                <button className="flex items-center gap-1 text-primary dark:text-blue-400 hover:underline">
                                  <Download className="h-4 w-4" />
                                  Download
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
