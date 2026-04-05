import React from "react";
import { useRef, useState, useEffect } from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../context/useAuth";
import AuthForm from "./AuthForm";

const API = "http://localhost:3000";

const Manager = () => {
  const { token, user, ready } = useAuth();
  const ref = useRef();
  const passwordRef = useRef();
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);

  const authHeaders = (extra = {}) => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  });

  async function fetchPasswordList(signal) {
    if (!token) {
      setPasswordArray([]);
      return;
    }
    const req = await fetch(`${API}/api/passwords`, {
      headers: authHeaders(),
      signal,
    });
    if (!req.ok) {
      setPasswordArray([]);
      return;
    }
    const passwords = await req.json();
    setPasswordArray(passwords);
  }

  useEffect(() => {
    if (!ready) return;
    const ac = new AbortController();
    const run = async () => {
      try {
        await fetchPasswordList(ac.signal);
      } catch {
        if (!ac.signal.aborted) setPasswordArray([]);
      }
    };
    void run();
    return () => ac.abort();
  }, [ready, token]); // eslint-disable-line react-hooks/exhaustive-deps -- refetch when auth only

  const copyText = (text) => {
    toast("Copied to clipboard!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    });
    navigator.clipboard.writeText(text);
  };

  const showPassword = () => {
    // alert("show the password")
    passwordRef.current.type = "text";
    if (ref.current.src.includes("Icons/closed.png")) {
      ref.current.src = "Icons/opened.png";
      passwordRef.current.type = "password";
    } else {
      ref.current.src = "Icons/closed.png";
      passwordRef.current.type = "text";
    }
  };
  const savePassword = async () => {
    if (!token || !user) {
      toast.error("Sign in to save passwords", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
      return;
    }
    if (
      form.site.length > 3 &&
      form.username.length > 3 &&
      form.password.length > 6
    ) {
      const entryId = form.id || uuidv4();
      const payload = { ...form, id: entryId };

      await fetch(`${API}/api/passwords`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ id: entryId }),
      });

      setPasswordArray((prev) => {
        const without = prev.filter((p) => p.id !== entryId);
        return [...without, payload];
      });
      const saveRes = await fetch(`${API}/api/passwords`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) {
        toast.error("Could not save — try signing in again", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Slide,
        });
        fetchPasswordList().catch(() => setPasswordArray([]));
        return;
      }
      // localStorage.setItem(
      //   "passwords",
      //   JSON.stringify([...passwordArray, { ...form, id: uuidv4() }]),
      // );
      // console.log([...passwordArray, form]);
      setForm({ site: "", username: "", password: "" });
      toast.success("Password is saved", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    } else {
      toast.error("Invalid parameters!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    }
  };
  const deletePassword = async (id) => {
    if (!token) return;
    console.log("Deleting password with Id : ", id);
    let c = confirm("Are you sure you want to delete this password?");
    if (c) {
      setPasswordArray(passwordArray.filter((item) => item.id !== id));
      await fetch(`${API}/api/passwords`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      // localStorage.setItem(
      //   "passwords",
      //   JSON.stringify(passwordArray.filter((item) => item.id !== id)),
      // );
      toast.success("Password deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    }
  };
  const editPassword = (id) => {
    console.log("editing password with Id : ", id);
    setForm({ ...passwordArray.filter((i) => i.id === id)[0], id: id });
    setPasswordArray(passwordArray.filter((item) => item.id !== id));

    // localStorage.setItem("passwords", JSON.stringify([...passwordArray, form]));
    // console.log([...passwordArray, form]);
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition="Slide"
      />

      {!ready && (
        <div className="p-8 text-center text-purple-800">Loading…</div>
      )}

      {ready && !user && (
        <div className="p-4 md:px-50 py-8 md:mycontainer">
          <h1 className="text-4xl text font-bold text-center">
            <span className="text-purple-500">&lt;</span>
            <span>Pass</span>
            <span className="text-violet-800">Man</span>
            <span className="text-purple-500">/&gt;</span>
          </h1>
          <p className="text-purple-800 text-lg text-center mb-8">
            Built for Privacy. Designed for Trust.
          </p>
          <AuthForm />
        </div>
      )}

      {ready && user && (
      <div className="p-4 md:px-50 py-8 md:mycontainer">
        <h1 className="text-4xl text font-bold text-center">
          <span className="text-purple-500">&lt;</span>
          <span>Pass</span>
          <span className="text-violet-800">Man</span>
          <span className="text-purple-500">/&gt;</span>
        </h1>
        <p className="text-purple-800 text-lg text-center">
          Built for Privacy. Designed for Trust.
        </p>

        <div className="flex flex-col p-4 text-black gap-6 items-center">
          <input
            value={form.site}
            onChange={handleChange}
            className="rounded-3xl border-2 border-purple-400 w-full p-4 py-1 focus:border-purple-600 outline-none transition-colors duration-400 ease-in-out"
            type="text"
            name="site"
            id="site"
            placeholder="Enter Website URL"
          />
          <div className="flex flex-col md:flex-row w-full justify-between gap-6">
            <input
              value={form.username}
              onChange={handleChange}
              className="rounded-3xl border-2 border-purple-400 w-full p-4 py-1 focus:border-purple-600 outline-none transition-colors duration-400 ease-in-out"
              type="text"
              name="username"
              id="username"
              placeholder="Enter Username"
            />
            <div className="relative">
              <input
                ref={passwordRef}
                value={form.password}
                onChange={handleChange}
                className="rounded-3xl border-2 border-purple-400 w-full p-4 py-1 focus:border-purple-600 outline-none transition-colors duration-400 ease-in-out"
                type="password"
                name="password"
                id="password"
                placeholder="Enter Password"
              />
              <span
                className="absolute right-1 top-2 cursor-pointer"
                onClick={showPassword}
              >
                <img ref={ref} width={20} src="Icons/opened.png" alt="eye" />
              </span>
            </div>
          </div>
          <button
            onClick={savePassword}
            className="flex justify-center items-center bg-purple-400  rounded-full px-3 py-1.5 w-fit hover:bg-purple-500"
          >
            <lord-icon
              src="https://cdn.lordicon.com/vjgknpfx.json"
              trigger="hover"
              state="hover-swirl"
              colors="primary:#000000,secondary:#ffffff"
            ></lord-icon>
            Add
          </button>
        </div>
        <div className="passwords">
          <h2 className="flex items-center justify-center font-bold text-2xl py-3">
            Passwords
          </h2>
          {passwordArray.length === 0 && (
            <div className="flex items-center justify-center">
              Nothing to show here{" "}
            </div>
          )}
          {passwordArray.length != 0 && (
            <table className="table-auto w-full rounded-lg overflow-hidden mb-6">
              <thead className=" bg-purple-400">
                <tr>
                  <th className="py-2">Site</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Password</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-purple-300">
                {passwordArray.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="py-1.5 border border-white text-center">
                        <div className="flex items-center justify-center ">
                          <a href="{item.site}" target="_blank">
                            {item.site}
                          </a>
                          <div
                            className="lordiconcopy size-1 cursor-pointer"
                            onClick={() => {
                              copyText(item.site);
                            }}
                          >
                            <lord-icon
                              style={{
                                height: "25px",
                                width: "25px",
                                marginTop: "-7px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 border border-white text-center ">
                        <div className="flex items-center justify-center ">
                          <span>{item.username}</span>
                          <div
                            className="lordiconcopy size-1 cursor-pointer "
                            onClick={() => {
                              copyText(item.username);
                            }}
                          >
                            <lord-icon
                              style={{
                                height: "25px",
                                width: "25px",
                                marginTop: "-7px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 border border-white text-center ">
                        <div className="flex items-center justify-center ">
                          <span>{"*".repeat(item.password?.length || 0)}</span>
                          <div
                            className="lordiconcopy size-1 cursor-pointer"
                            onClick={() => {
                              copyText(item.password);
                            }}
                          >
                            <lord-icon
                              style={{
                                height: "25px",
                                width: "25px",
                                marginTop: "-7px",
                              }}
                              src="https://cdn.lordicon.com/iykgtsbt.json"
                              trigger="hover"
                            ></lord-icon>
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 border border-white text-center ">
                        <span
                          className="cursor-pointer mx-1"
                          onClick={() => {
                            editPassword(item.id);
                          }}
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/gwlusjdu.json"
                            trigger="hover"
                            style={{ height: "25px", width: "25px" }}
                          ></lord-icon>
                        </span>
                        <span
                          className="cursor-pointer mx-1"
                          onClick={() => {
                            deletePassword(item.id);
                          }}
                        >
                          <lord-icon
                            src="https://cdn.lordicon.com/skkahier.json"
                            trigger="hover"
                            style={{ height: "25px", width: "25px" }}
                          ></lord-icon>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}
    </>
  );
};

export default Manager;
