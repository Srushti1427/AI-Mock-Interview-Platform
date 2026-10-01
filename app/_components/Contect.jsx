"use client";
import { LoaderCircle } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "sonner";

const Contect = () => {
  const handleInputChange = (setState) => (e) => {
    setState(e.target.value);
  };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    console.log(name, email, message);

    if (name && email && message) {
      setLoading(true);
      try {
        const res = await fetch('/api/newsletter/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newName: name, newEmail: email, newMessage: message, createdAt: moment().format('YYYY-MM-DD') }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast('User Response recorded successfully');
        setName('');
        setEmail('');
        setMessage('');
      } catch (error) {
        console.error(error);
        toast("Error recording response");
      } finally {
        setLoading(false);
      }
    } else {
      toast("No data entered");
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        Support & Feedback
      </div>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
        Get In Touch
      </h2>
      <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
        Have questions, feedback, or need assistance with InterviewAI? Send us a message and our team will respond promptly.
      </p>

      <div className="mt-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-left max-w-xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Sharma"
              value={name}
              onChange={handleInputChange(setName)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={handleInputChange(setEmail)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Message
            </label>
            <textarea
              placeholder="How can we help you?"
              value={message}
              onChange={handleInputChange(setMessage)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-slate-700 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-colors resize-none"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 text-sm font-semibold text-white rounded-lg sm:rounded-xl bg-[linear-gradient(90deg,#05080B_0%,#365F87_100%)] hover:opacity-95 transition-opacity shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle className="animate-spin w-4 h-4" />
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contect;
