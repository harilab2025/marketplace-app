'use client';

import { decryptData } from "@/actions/crypto.action";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

async function fetchData(key: string) {
  const decryptedData = await decryptData(key);
  return decryptedData;
}
// Analytics Page
export default function AnalyticsPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<{
    user: { id: string, name: string, email: string, role: string },
    accessToken: string
  }>({ user: { id: "", name: "", email: "", role: "" }, accessToken: "" });
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchData(session?.user?.key || "").then((data) => {
        const result = JSON.parse(data);
        setData(result || "");
      });
    }

    return () => {
      setData({ user: { id: "", name: "", email: "", role: "" }, accessToken: "" });
    };
  }, [session?.user?.key, status]);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <h1>Analytics</h1>
      <div className="w-full h-full flex flex-col items-center shadow-xl bg-white rounded-2xl border p-4">
        <button onClick={() => setToken(data.accessToken)} className="bg-blue-500 text-white rounded-md p-2 cursor-pointer">
          Get Token
        </button>
        <div className="w-full mt-4 px-10">
          {/* Add any additional content or components here */}
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Token:</label>
          <span className="bg-zinc-300 text-zinc-900 rounded-md p-2 w-full flex justify-center shadow px-3 overflow-auto flex-col gap-2">
            <textarea disabled placeholder="your token is here" value={token} rows={8} className="text-sm font-medium w-full placeholder:italic" />
            <button onClick={() => navigator.clipboard.writeText(token || "").then(() => toast.success("Token copied to clipboard!"))} className="w-auto text-sm bg-blue-500 text-white rounded-md p-2 cursor-pointer">
              Copy Token
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}