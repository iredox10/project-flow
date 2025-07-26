
import React from 'react';
import Announcements from '../components/Announcements';
import StudentLayout from '../components/StudentLayout';

const AnnouncementsPage = () => {

  return (
    <StudentLayout>
      <div className="space-y-8">
        <Announcements />
      </div>
    </StudentLayout>
  );
};

export default AnnouncementsPage;
