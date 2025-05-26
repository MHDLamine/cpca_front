import React, { useState, useEffect } from 'react';
import { Users, Video, FileText, Search, Check, Plus, List, UserPlus } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import VideoPlayer from '../components/video/VideoPlayer';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';

const RecruiterDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'answers'>('video');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [addUserError, setAddUserError] = useState('');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionOrder, setNewQuestionOrder] = useState(questions.length + 1);
  const [addQuestionError, setAddQuestionError] = useState('');
  const [addQuestionLoading, setAddQuestionLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'candidates' | 'questions' | 'users'>('candidates');
  const [users, setUsers] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/candidates')
      .then(res => res.json())
      .then(setCandidates);
    fetch('http://localhost:5000/api/questions')
      .then(res => res.json())
      .then((data) => {
        setQuestions(data);
        setNewQuestionOrder(data.length + 1);
      });
  }, []);

  // Charger les utilisateurs quand on va sur l'onglet users
  useEffect(() => {
    if (sidebarTab === 'users') {
      console.log('Fetching recruiters...');
      fetch('http://localhost:5000/api/recruiters')
        .then(res => res.json())
        .then((data) => {
          console.log('Fetched recruiters:', data);
          setUsers(data);
        });
    }
  }, [sidebarTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCandidates = candidates.filter(candidate => 
    candidate.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Séparation des candidats
  const completeCandidates = filteredCandidates.filter(
    (c) => c.videos && c.videos.length > 0 && c.answers && c.answers.length > 0
  );
  const incompleteCandidates = filteredCandidates.filter(
    (c) => !(c.videos && c.videos.length > 0 && c.answers && c.answers.length > 0)
  );

  const selectedCandidateData = candidates.find((c: any) => c.id === selectedCandidate);

  const handleDownloadVideo = (videoUrl: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'candidate_video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.confirmPassword) {
      setAddUserError('All fields are required');
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      setAddUserError('Passwords do not match');
      return;
    }
    setAddUserLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          role: 'recruiter',
        })
      });
      if (!res.ok) {
        const err = await res.json();
        setAddUserError(err.message || 'Failed to add recruiter');
      } else {
        setNewUser({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (err) {
      setAddUserError('Failed to add recruiter');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddQuestionError('');
    if (!newQuestion.trim()) {
      setAddQuestionError('Question text is required');
      return;
    }
    setAddQuestionLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newQuestion, order: newQuestionOrder })
      });
      if (!res.ok) {
        const err = await res.json();
        setAddQuestionError(err.message || 'Failed to add question');
      } else {
        setNewQuestion('');
        // Refresh questions
        const updated = await fetch('http://localhost:5000/api/questions').then(r => r.json());
        setQuestions(updated);
        setNewQuestionOrder(updated.length + 1);
      }
    } catch (err) {
      setAddQuestionError('Failed to add question');
    } finally {
      setAddQuestionLoading(false);
    }
  };

  const openAddUserModal = () => {
    setEditUser(null);
    setUserForm({ username: '', email: '', password: '', confirmPassword: '' });
    setShowUserModal(true);
  };
  const openEditUserModal = (user: any) => {
    setEditUser(user);
    setUserForm({ username: user.username, email: user.email, password: '', confirmPassword: '' });
    setShowUserModal(true);
  };
  const closeUserModal = () => {
    setShowUserModal(false);
    setEditUser(null);
    setUserForm({ username: '', email: '', password: '', confirmPassword: '' });
    setUserError('');
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserLoading(true);
    if (!userForm.username || !userForm.email || (!editUser && (!userForm.password || !userForm.confirmPassword))) {
      setUserError('Tous les champs sont requis');
      setUserLoading(false);
      return;
    }
    if (!editUser && userForm.password !== userForm.confirmPassword) {
      setUserError('Les mots de passe ne correspondent pas');
      setUserLoading(false);
      return;
    }
    try {
      if (editUser) {
        // Edition
        const res = await fetch(`http://localhost:5000/api/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userForm.username, email: userForm.email })
        });
        if (!res.ok) throw new Error('Erreur lors de la modification');
      } else {
        // Ajout
        const res = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
            role: 'recruiter',
          })
        });
        if (!res.ok) throw new Error('Erreur lors de l\'ajout');
      }
      // Refresh
      fetch('http://localhost:5000/api/recruiters')
        .then(res => res.json())
        .then((data) => {
          console.log('Refreshed recruiters:', data);
          setUsers(data);
        });
      closeUserModal();
    } catch (err: any) {
      setUserError(err.message || 'Erreur');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE' });
    fetch('http://localhost:5000/api/recruiters')
      .then(res => res.json())
      .then((data) => {
        console.log('Refreshed recruiters after delete:', data);
        setUsers(data);
      });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col py-8 px-4 space-y-2">
        <button
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${sidebarTab === 'candidates' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setSidebarTab('candidates')}
        >
          <Users className="h-5 w-5 mr-2" /> Candidats
        </button>
        <button
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${sidebarTab === 'questions' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setSidebarTab('questions')}
        >
          <List className="h-5 w-5 mr-2" /> Questions
        </button>
        <button
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${sidebarTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setSidebarTab('users')}
        >
          <UserPlus className="h-5 w-5 mr-2" /> Utilisateurs
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 space-y-6">
        {sidebarTab === 'questions' && (
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-500" /> Ajouter une question
            </h3>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              {addQuestionError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">{addQuestionError}</div>}
              <Input
                label="Question text"
                type="text"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                required
              />
              <Input
                label="Order"
                type="number"
                value={newQuestionOrder}
                onChange={e => setNewQuestionOrder(Number(e.target.value))}
                min={1}
                required
              />
              <Button type="submit" fullWidth isLoading={addQuestionLoading}>Ajouter la question</Button>
            </form>
            {/* Liste des questions existantes */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Questions existantes</h4>
              <ul className="list-disc pl-5 text-gray-800">
                {questions.map((q: any) => (
                  <li key={q.id}>{q.text}</li>
                ))}
                {questions.length === 0 && <li className="text-gray-400">Aucune question</li>}
              </ul>
            </div>
          </Card>
        )}

        {sidebarTab === 'users' && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Utilisateurs</h3>
              <Button onClick={openAddUserModal} variant="primary" size="sm">Ajouter un utilisateur</Button>
            </div>
            {/* Liste des utilisateurs */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Aucun utilisateur</td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditUserModal(user)}>Éditer</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user.id)}>Supprimer</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Modal d'ajout/édition utilisateur */}
            <Modal isOpen={showUserModal} onClose={closeUserModal} title={editUser ? 'Éditer utilisateur' : 'Ajouter un utilisateur'}>
              <form onSubmit={handleUserFormSubmit} className="space-y-4">
                {userError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">{userError}</div>}
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  value={userForm.username}
                  onChange={handleUserFormChange}
                  required
                />
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  required
                />
                {!editUser && (
                  <>
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      value={userForm.password}
                      onChange={handleUserFormChange}
                      required
                    />
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={handleUserFormChange}
                      required
                    />
                  </>
                )}
                <Input
                  label="Role"
                  value="Recruiter"
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <Button type="submit" fullWidth isLoading={userLoading}>{editUser ? 'Enregistrer' : 'Ajouter'}</Button>
              </form>
            </Modal>
          </Card>
        )}

        {sidebarTab === 'candidates' && (
          <>
            {/* Candidats complets */}
            <Card className="p-0 overflow-hidden mb-8">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                <h3 className="text-lg font-medium text-green-700 flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-500" /> Candidats ayant tout soumis
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completeCandidates.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Aucun candidat complet</td>
                      </tr>
                    )}
                    {completeCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{candidate.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{candidate.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Complet</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button size="sm" variant={selectedCandidate === candidate.id ? 'primary' : 'secondary'} onClick={() => setSelectedCandidate(candidate.id)}>
                            Voir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Candidats incomplets */}
            <Card className="p-0 overflow-hidden mb-8">
              <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                <h3 className="text-lg font-medium text-yellow-700 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-yellow-500" /> Candidats incomplets (vidéo ou questionnaire manquant)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {incompleteCandidates.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Aucun candidat incomplet</td>
                      </tr>
                    )}
                    {incompleteCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{candidate.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{candidate.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Incomplet</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button size="sm" variant={selectedCandidate === candidate.id ? 'primary' : 'secondary'} onClick={() => setSelectedCandidate(candidate.id)}>
                            Voir
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Affichage du détail du candidat sélectionné (inchangé) */}
            {selectedCandidateData && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedCandidateData.username}'s Submission
                    </h3>
                  </div>
                  <nav className="flex -mb-px">
                    <button
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'video'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('video')}
                      disabled={selectedCandidateData.videos.length === 0}
                    >
                      <div className="flex items-center">
                        <Video className="h-5 w-5 mr-2" />
                        Video Presentation
                      </div>
                    </button>
                    <button
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'answers'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('answers')}
                      disabled={selectedCandidateData.answers.length === 0}
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Answers
                      </div>
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'video' ? (
                    <div>
                      {selectedCandidateData.videos.length > 0 ? (
                        <VideoPlayer 
                          src={selectedCandidateData.videos[0].url} 
                          title={`${selectedCandidateData.username}'s Introduction`}
                          downloadable
                          onDownload={() => handleDownloadVideo(selectedCandidateData.videos[0].url)}
                        />
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          No video submissions yet
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedCandidateData.answers.length > 0 ? (
                        selectedCandidateData.answers.map((answer: any) => (
                          <div key={answer.id} className="border border-gray-200 rounded-md p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{answer.questionText}</h4>
                            <p className="text-gray-700 whitespace-pre-line">{answer.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          No answers submitted yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default RecruiterDashboard;