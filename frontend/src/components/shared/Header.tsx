import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';

interface HeaderProps {
  showBack?: boolean;
  showLogout?: boolean;
  title?: string;
}

export default function Header({ showBack, showLogout = true, title }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-blue-600">
              {title || 'InterviewAI Pro'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
          )}
          {showLogout && (
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
