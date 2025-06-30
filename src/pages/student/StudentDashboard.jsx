
import React from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import { FiFileText, FiMessageSquare, FiClock, FiCheckCircle, FiUser } from 'react-icons/fi';

// --- Mock Data for the student's dashboard ---
const studentData = {
  name: 'Ethan Hunt',
  project: {
    status: 'approved', // 'none', 'submitted', 'approved', 'rejected'
    title: 'Advanced Cryptography Techniques',
    supervisor: 'Dr. Alan Turing',
    chaptersSubmitted: 2,
    totalChapters: 5,
    nextChapter: 'Chapter 3: Asymmetric-Key Algorithms',
  },
  recentActivity: [
    { type: 'feedback', text: 'Dr. Turing left feedback on Chapter 2.', timestamp: '2 days ago', link: '/student/my-project' },
    { type: 'submission', text: 'You submitted Chapter 2 for review.', timestamp: '4 days ago', link: '/student/my-project' },
    { type: 'approval', text: 'Your project proposal was approved.', timestamp: '2 weeks ago', link: '/student/proposal' },
  ]
};


// --- Reusable Stat Card Component ---
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-4 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// --- Main Dashboard Component ---
const StudentDashboard = () => {
  const { project, recentActivity } = studentData;

  const getStatusIcon = (type) => {
    switch (type) {
      case 'feedback': return <FiMessageSquare className="text-blue-500" />;
      case 'submission': return <FiFileText className="text-green-500" />;
      case 'approval': return <FiCheckCircle className="text-purple-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  }

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {studentData.name}!</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FiFileText size={24} className="text-blue-500" />}
          title="Chapters Submitted"
          value={`${project.chaptersSubmitted}/${project.totalChapters}`}
          color="bg-blue-100"
        />
        <StatCard
          icon={<FiUser size={24} className="text-green-500" />}
          title="Supervisor"
          value={project.supervisor}
          color="bg-green-100"
        />
        <StatCard
          icon={<FiClock size={24} className="text-yellow-500" />}
          title="Next Deadline"
          value="July 15th"
          color="bg-yellow-100"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Next Up */}
        <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-gray-700">Submit Your Next Chapter</p>
            <p className="text-lg font-bold text-blue-800 my-1">{project.nextChapter}</p>
            <Link to="/student/my-project" className="inline-block mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Go to Project
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="w-full lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(activity.type)}
                </div>
                <div>
                  <p className="text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
