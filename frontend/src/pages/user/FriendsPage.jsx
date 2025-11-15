import React from 'react';
import Layout from '@/components/Layout';
import FriendsHub from '@/components/FriendsHub';

const FriendsPage = ({ user, onLogout }) => {
  return (
    <Layout user={user} onLogout={onLogout} role="user">
      <FriendsHub />
    </Layout>
  );
};

export default FriendsPage;
