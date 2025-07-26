import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, addDoc, collection, serverTimestamp } from '../firebase/config';

const AnnouncementInput = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      console.error("No user is logged in.");
      return;
    }

    const scope = currentUser.role === 'supervisor' ? currentUser.uid : 'all';

    try {
      await addDoc(collection(db, 'announcements'), {
        title,
        content,
        author: currentUser.displayName || 'Admin',
        authorId: currentUser.uid,
        createdAt: serverTimestamp(),
        scope,
        readBy: [],
      });
      setTitle('');
      setContent('');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Announcement</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-lg font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-lg font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post Announcement
        </button>
      </form>
    </div>
  );
};

export default AnnouncementInput;
