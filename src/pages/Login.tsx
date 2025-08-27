
import React, { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

const Login = () => {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(https://i.ibb.co/zhWqkYSg/palak.jpg)' }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Content */}
      <div className="relative z-10 flex justify-center items-center min-h-screen p-4">
        {showSignup ? (
          <SignupForm onBackToLogin={() => setShowSignup(false)} />
        ) : (
          <LoginForm onShowSignup={() => setShowSignup(true)} />
        )}
      </div>
    </div>
  );
};

export default Login;
