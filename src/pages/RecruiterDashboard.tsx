import React, { useState, useEffect } from 'react';
import { showAlert, showConfirm } from '../utils/swal';
import { Users, Video, FileText, Search, Check, Plus, List, UserPlus, Edit, Trash2, File } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import VideoPlayer from '../components/video/VideoPlayer';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { toast } from 'react-toastify';

const RecruiterDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'answers'>('video');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [editQuestion, setEditQuestion] = useState<any | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionForm, setQuestionForm] = useState({ text: '', order: 1 });
  const [questionError, setQuestionError] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'candidates' | 'questions' | 'users'>('candidates');
  const [users, setUsers] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    console.log('Fetching candidates...');
    fetch('http://localhost:5000/api/candidates')
      .then(res => res.json())
      .then(data => {
        console.log('Candidates fetched:', data);
        setCandidates(data);
      })
      .catch(error => {
        console.error('Error fetching candidates:', error);
        toast.error('Erreur lors du chargement des candidats');
      });
    
    fetch('http://localhost:5000/api/questions')
      .then(res => res.json())
      .then((data) => {
        console.log('Questions fetched:', data);
        setQuestions(data);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
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
  const [cvData, setCvData] = useState<any>(null);

  const handleViewCandidate = (candidateId: string) => {
    setSelectedCandidate(candidateId);
    setShowCandidateModal(true);
    setCvData(null);
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
      toast.error('Candidat non trouvé');
    } else {
      toast.success(`Affichage du profil de ${candidate.username}`);
      // Charger le CV du candidat
      fetch(`http://localhost:5000/api/cv/${candidateId}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setCvData(data); });
    }
  };

  const handleDownloadVideo = (videoUrl: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'candidate_video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Question management functions
  const openAddQuestionModal = () => {
    setEditQuestion(null);
    setQuestionForm({ text: '', order: questions.length + 1 });
    setShowQuestionModal(true);
  };

  const openEditQuestionModal = (question: any) => {
    setEditQuestion(question);
    setQuestionForm({ text: question.text, order: question.order });
    setShowQuestionModal(true);
  };

  const closeQuestionModal = () => {
    setShowQuestionModal(false);
    setEditQuestion(null);
    setQuestionForm({ text: '', order: 1 });
    setQuestionError('');
  };

  const handleQuestionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuestionForm({ ...questionForm, [name]: name === 'order' ? parseInt(value) || 1 : value });
  };

  const handleQuestionFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionError('');
    setQuestionLoading(true);

    if (!questionForm.text.trim()) {
      setQuestionError('Le texte de la question est requis');
      setQuestionLoading(false);
      return;
    }

    try {
      const url = editQuestion 
        ? `http://localhost:5000/api/questions/${editQuestion.id}`
        : 'http://localhost:5000/api/questions';
      
      const method = editQuestion ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionForm)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de la sauvegarde');
      }

      // Refresh questions
      const updated = await fetch('http://localhost:5000/api/questions').then(r => r.json());
      setQuestions(updated);
      closeQuestionModal();
      toast.success(editQuestion ? 'Question modifiée avec succès !' : 'Question ajoutée avec succès !');
    } catch (err: any) {
      setQuestionError(err.message || 'Erreur lors de la sauvegarde');
      toast.error(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const result = await showConfirm({
      title: 'Confirmation',
      text: 'Supprimer cette question ?',
      icon: 'warning',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${questionId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      const updated = await fetch('http://localhost:5000/api/questions').then(r => r.json());
      setQuestions(updated);
      toast.success('Question supprimée avec succès !');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // User management functions
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
        const res = await fetch(`http://localhost:5000/api/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: userForm.username, email: userForm.email })
        });
        if (!res.ok) throw new Error('Erreur lors de la modification');
      } else {
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

      // Refresh users
      const updated = await fetch('http://localhost:5000/api/recruiters').then(r => r.json());
      setUsers(updated);
      closeUserModal();
      toast.success(editUser ? 'Utilisateur modifié avec succès !' : 'Utilisateur ajouté avec succès !');
    } catch (err: any) {
      setUserError(err.message || 'Erreur');
      toast.error(err.message || 'Erreur');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await showConfirm({
      title: 'Confirmation',
      text: 'Supprimer cet utilisateur ?',
      icon: 'warning',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      const updated = await fetch('http://localhost:5000/api/recruiters').then(r => r.json());
      setUsers(updated);
      toast.success('Utilisateur supprimé avec succès !');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
    {/* Sidebar responsive */}
    <aside className="w-full md:w-56 bg-white dark:bg-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex flex-row md:flex-col py-2 md:py-8 px-2 md:px-4 space-x-2 md:space-x-0 md:space-y-2 sticky top-0 z-30">
      <button
        className={`flex-1 md:flex-none flex items-center justify-center md:justify-start px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors ${sidebarTab === 'candidates' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        onClick={() => setSidebarTab('candidates')}
      >
        <Users className="h-5 w-5 mr-2" /> <span className="hidden sm:inline">Candidats</span>
      </button>
      <button
        className={`flex-1 md:flex-none flex items-center justify-center md:justify-start px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors ${sidebarTab === 'questions' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        onClick={() => setSidebarTab('questions')}
      >
        <List className="h-5 w-5 mr-2" /> <span className="hidden sm:inline">Questions</span>
      </button>
      <button
        className={`flex-1 md:flex-none flex items-center justify-center md:justify-start px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors ${sidebarTab === 'users' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        onClick={() => setSidebarTab('users')}
      >
        <UserPlus className="h-5 w-5 mr-2" /> <span className="hidden sm:inline">Utilisateurs</span>
      </button>
    </aside>

    {/* Main content responsive */}
    <main className="flex-1 p-2 sm:p-4 md:p-8 space-y-4 sm:space-y-6 max-w-full overflow-x-auto">
        {sidebarTab === 'questions' && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Questions</h3>
              <Button onClick={openAddQuestionModal} variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une question
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ordre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Aucune question</td>
                    </tr>
                  )}
                  {questions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{question.order}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{question.text}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditQuestionModal(question)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteQuestion(question.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {sidebarTab === 'users' && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Utilisateurs</h3>
              <Button onClick={openAddUserModal} variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un utilisateur
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Aucun utilisateur</td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditUserModal(user)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {sidebarTab === 'candidates' && (
          <>
            {/* Search */}
            <Card className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </Card>

            {/* Candidats complets */}
            <Card className="p-0 overflow-hidden mb-8">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-green-700 dark:text-green-400 flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" /> 
                  Candidats ayant tout soumis ({completeCandidates.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vidéos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Réponses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {completeCandidates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          Aucun candidat complet pour le moment
                        </td>
                      </tr>
                    )}
                    {completeCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{candidate.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{candidate.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {candidate.videos?.length || 0} vidéo(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {candidate.answers?.length || 0} réponse(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button 
                            size="sm" 
                            variant={selectedCandidate === candidate.id ? 'primary' : 'secondary'} 
                            onClick={() => handleViewCandidate(candidate.id)}
                          >
                            {selectedCandidate === candidate.id ? 'Affiché' : 'Voir'}
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
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-400 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-yellow-500 dark:text-yellow-400" /> 
                  Candidats incomplets ({incompleteCandidates.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {incompleteCandidates.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          Aucun candidat incomplet
                        </td>
                      </tr>
                    )}
                    {incompleteCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{candidate.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{candidate.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {(!candidate.videos || candidate.videos.length === 0) && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Vidéo manquante
                              </span>
                            )}
                            {(!candidate.answers || candidate.answers.length === 0) && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Réponses manquantes
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button 
                            size="sm" 
                            variant={selectedCandidate === candidate.id ? 'primary' : 'secondary'} 
                            onClick={() => handleViewCandidate(candidate.id)}
                          >
                            {selectedCandidate === candidate.id ? 'Affiché' : 'Voir'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Modale détail candidat */}
            <Modal isOpen={showCandidateModal} onClose={() => setShowCandidateModal(false)} title={selectedCandidateData ? `Profil de ${selectedCandidateData.username}` : 'Candidat'} className="max-w-4xl w-full">
              {!selectedCandidateData ? (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-md mb-4">
                  Erreur : impossible de trouver les données du candidat sélectionné (ID : {selectedCandidate}). 
                  Vérifiez que le candidat existe dans la base de données.
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Profil de {selectedCandidateData.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCandidateData.email}</p>
                  </div>
                  <nav className="flex -mb-px mb-4">
                    <button
                      className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'video'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setActiveTab('video')}
                    >
                      <div className="flex items-center">
                        <Video className="h-5 w-5 mr-2" />
                        Présentation vidéo ({selectedCandidateData.videos?.length || 0})
                      </div>
                    </button>
                    <button
                      className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'answers'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setActiveTab('answers')}
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Réponses ({selectedCandidateData.answers?.length || 0})
                      </div>
                    </button>
                  </nav>
                  {/* Section CV du candidat */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center mb-2">
                      <File className="h-5 w-5 mr-2" /> CV du candidat
                    </h4>
                    {cvData ? (
                      <a
                        href={`http://localhost:5000${cvData.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600 dark:text-blue-400"
                      >
                        {cvData.filename}
                      </a>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Aucun CV soumis</span>
                    )}
                  </div>
                  {/* Affichage vidéo ou réponses, sans duplication */}
                  {activeTab === 'video' && selectedCandidateData.videos && selectedCandidateData.videos.length > 0 && (
                    <div className="space-y-4">
                      {selectedCandidateData.videos.map((video: any, index: number) => (
                        <div key={video.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {video.title || `Vidéo ${index + 1}`}
                            </h4>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDownloadVideo(video.url)}
                            >
                              Télécharger
                            </Button>
                          </div>
                          <VideoPlayer 
                            src={video.url} 
                            title={video.title || `Présentation de ${selectedCandidateData.username}`}
                            downloadable
                            onDownload={() => handleDownloadVideo(video.url)}
                          />
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Durée : {video.duration || 'Non spécifiée'} | 
                            Envoyée le : {new Date(video.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'video' && (!selectedCandidateData.videos || selectedCandidateData.videos.length === 0) && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Video className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Aucune vidéo soumise</h3>
                      <p>Ce candidat n'a pas encore envoyé de vidéo de présentation.</p>
                    </div>
                  )}
                  {activeTab === 'answers' && selectedCandidateData.answers && selectedCandidateData.answers.length > 0 && (
                    <div className="space-y-6">
                      {selectedCandidateData.answers.map((answer: any, index: number) => (
                        <div key={answer.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-start">
                            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4 mt-1 flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                {answer.questionText}
                              </h4>
                              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {answer.text}
                              </p>
                              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Répondu le : {new Date(answer.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'answers' && (!selectedCandidateData.answers || selectedCandidateData.answers.length === 0) && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Aucune réponse soumise</h3>
                      <p>Ce candidat n'a pas encore répondu aux questions.</p>
                    </div>
                  )}
                </>
              )}
            </Modal>
          </>
        )}

        {/* Question Modal */}
        <Modal isOpen={showQuestionModal} onClose={closeQuestionModal} title={editQuestion ? 'Modifier la question' : 'Ajouter une question'}>
          <form onSubmit={handleQuestionFormSubmit} className="space-y-4">
            {questionError && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-md text-sm">
                {questionError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Texte de la question
              </label>
              <textarea
                name="text"
                value={questionForm.text}
                onChange={handleQuestionFormChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                required
              />
            </div>
            <Input
              label="Ordre"
              name="order"
              type="number"
              value={questionForm.order}
              onChange={handleQuestionFormChange}
              min={1}
              required
            />
            <Button type="submit" fullWidth isLoading={questionLoading}>
              {editQuestion ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </form>
        </Modal>

        {/* User Modal */}
        <Modal isOpen={showUserModal} onClose={closeUserModal} title={editUser ? 'Modifier utilisateur' : 'Ajouter un utilisateur'}>
          <form onSubmit={handleUserFormSubmit} className="space-y-4">
            {userError && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-md text-sm">
                {userError}
              </div>
            )}
            <Input
              label="Nom d'utilisateur"
              name="username"
              type="text"
              value={userForm.username}
              onChange={handleUserFormChange}
              required
            />
            <Input
              label="Adresse e-mail"
              name="email"
              type="email"
              value={userForm.email}
              onChange={handleUserFormChange}
              required
            />
            {!editUser && (
              <>
                <Input
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={userForm.password}
                  onChange={handleUserFormChange}
                  required
                />
                <Input
                  label="Confirmer le mot de passe"
                  name="confirmPassword"
                  type="password"
                  value={userForm.confirmPassword}
                  onChange={handleUserFormChange}
                  required
                />
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rôle
              </label>
              <input
                type="text"
                value="Recruteur"
                readOnly
                disabled
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed text-gray-500 dark:text-gray-400"
              />
            </div>
            <Button type="submit" fullWidth isLoading={userLoading}>
              {editUser ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default RecruiterDashboard;