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
    <div className="container mx-auto text-center px-4 sm:px-6">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">Get In Touch</h2>
      <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        Have any questions? Reach out to us and we'll get back to you as soon as
        possible.
      </p>
      <div className="mt-6 sm:mt-8">
        <form onSubmit={onSubmit} className="max-w-xl mx-auto space-y-3 sm:space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={handleInputChange(setName)}
            className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-salmon focus:ring-2 focus:ring-salmon/30 smooth-transition"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={handleInputChange(setEmail)}
            className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-salmon focus:ring-2 focus:ring-salmon/30 smooth-transition"
          />
          <textarea
            placeholder="Your Message"
            value={message}
            onChange={handleInputChange(setMessage)}
            className="w-full px-4 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 dark:border-gray-600 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-salmon focus:ring-2 focus:ring-salmon/30 smooth-transition"
            rows="4"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-strawberry to-salmon hover:from-strawberry-dark hover:to-salmon-dark text-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl smooth-transition transform hover:scale-105"
          >
            {loading ? (
              <LoaderCircle className="animate-spin mx-auto" />
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
