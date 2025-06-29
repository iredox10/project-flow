
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import TiptapEditor from '../../components/TiptapEditor'; // New import
import { FiCheck, FiArrowLeft } from 'react-icons/fi';

// --- Mock Data ---
const mockProjectData = {
  id: 'proj_01',
  title: 'Advanced Cryptography Techniques',
  studentName: 'Ethan Hunt',
  chapters: [
    { id: 1, title: 'Chapter 1: Introduction to Cryptography', status: 'approved', content: '<h1>Chapter 1: An Introduction</h1><p>This chapter provides a foundational overview of cryptographic principles, tracing its origins from ancient ciphers to modern digital encryption. We will explore the core concepts of confidentiality, integrity, and availability.</p>' },
    { id: 2, title: 'Chapter 2: Symmetric-Key Algorithms', status: 'approved', content: '<h1>Symmetric-Key Algorithms</h1><p>Exploring algorithms like AES and DES, this chapter details the mechanics of symmetric encryption where the same key is used for both encryption and decryption.</p>' },
    { id: 3, title: 'Chapter 3: Asymmetric-Key Algorithms', status: 'reviewing', content: '<h1>Asymmetric-Key Algorithms</h1><p>This section covers RSA, ECC, and their mathematical underpinnings. The focus will be on how public-key cryptography solves the key distribution problem.</p>' },
  ],
};


const ChapterEditorPage = () => {
  const { projectId, chapterId } = useParams();

  // Find the specific chapter from mock data
  const chapter = mockProjectData.chapters.find(c => c.id === parseInt(chapterId));

  // State to hold the editor's content
  const [editorContent, setEditorContent] = useState(chapter?.content || '<p>Chapter content not found.</p>');

  const handleSaveChanges = () => {
    // API call to save the updated content (editorContent) would go here
    alert("Changes saved successfully!");
    console.log(editorContent);
  };

  if (!chapter) {
    return <SupervisorLayout><p>Chapter not found.</p></SupervisorLayout>;
  }

  return (
    <SupervisorLayout>
      <div className="mb-8">
        <Link to={`/supervisor/project/${projectId}`} className="flex items-center gap-2 text-teal-600 font-semibold hover:underline mb-4">
          <FiArrowLeft />
          Back to Project Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{chapter.title}</h1>
        <p className="text-gray-500 text-lg">Viewing chapter from project: "{mockProjectData.title}"</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md">
        {/* Use the new reusable editor component */}
        <TiptapEditor
          initialContent={editorContent}
          onUpdate={(newContent) => setEditorContent(newContent)}
        />
        <div className="flex justify-end mt-6">
          <button onClick={handleSaveChanges} className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
            <FiCheck size={20} />
            Save Changes
          </button>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default ChapterEditorPage;
